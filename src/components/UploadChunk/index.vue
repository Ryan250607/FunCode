<!-- src/components/UploadChunk.vue -->
<template>
  <el-dialog
    :title="title"
    v-model="visible"
    width="800px"
    append-to-body
    @close="onClose"
    fullscreen
  >
    <el-upload
      ref="uploadRef"
      multiple
      :auto-upload="false"
      :file-list="fileList"
      :http-request="customUpload"
      :on-change="handleFileChange"
      :before-upload="beforeUpload"
      drag
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        Drop files here or <em>click to upload</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">Support multiple files upload</div>
      </template>
      <template #file="{ file }">
        <div
          class="file-item p-3 border text-white border-gray-200 bg-[#00aeec] rounded-md mb-2 relative"
        >
          <!-- 删除按钮右上角 -->
          <!-- <el-button 
              type="danger" 
              size="small" 
              
              :disabled="file.status === 'uploading'"
              class="absolute top-2 right-2"
            >
              删除
            </el-button> -->
          <div
            class="absolute top-2 right-2 pointer"
            @click.stop="removeFile(file)"
          >
            <svg-icon :icon-class="'delete'" class="opacity-90 text-base" />
          </div>
          <div class="file-info flex justify-between items-center mb-2">
            <div>
              <span class="file-name text-sm font-mediu">{{ file.name }}</span>
              <!-- <span class="file-size text-xs ml-2"
                >({{ convertFileSizeUnit(file.size) }})</span
              > -->
            </div>
            <div class="file-meta text-xs">
              <!-- 仅对非已存在文件显示 MD5 信息 -->
              <span v-if="file.status !== 'success' || !file.url">
                MD5:
                <!-- <span v-if="file.md5Progress > 0 && !file.md5">
                {{ `${file.md5Progress}%` }}
              </span> -->
                <span class="md5-value font-mono mr-6">
                  {{ file.md5 || "N/A" }}
                </span>
              </span>
            </div>
          </div>
          <!-- 进度条单独一行 -->
          <div class="mb-8 w-3/4 relative">
            <!-- v-if="file.status === 'preparation' && file.md5Progress" -->
            <!-- <div
              >
            <el-progress :percentage="file.md5Progress" />
              </div> -->

            <div v-if="file.status === 'uploading' && file.progress">
              <el-progress :percentage="file.progress" status="success" />
            </div>
          </div>
          <!-- 状态标签右下角 -->
          <div class="file-status absolute bottom-3 right-3">
            <el-tag :type="getTagType(file.status)">{{
              getStatusText(file.status)
            }}</el-tag>
          </div>
        </div>
      </template>
    </el-upload>

    <template #footer>
      <div class="dialog-footer flex justify-between items-center">
        <!-- 将 Upload 按钮放到左下角 -->
        <el-button type="primary" @click="startUpload">Upload</el-button>
        <div class="right-buttons flex gap-3">
          <el-button type="primary" @click="saveFiles">Save</el-button>
          <el-button @click="visible = false">Cancel</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import { UploadFilled } from "@element-plus/icons-vue";
import axios from "axios";
import pLimit from "p-limit";
import { checkFileByMd5, initMultPartFile, mergeFileByMd5 } from "@/api/upload";
import cutFile from "@/utils/md5/core/cutFile";
import { MerkleTree } from "@/utils/md5/core/MerkleTree";
import { convertFileSizeUnit, downloadFileByBlob } from "@/utils/fileUtil";

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB per chunk
const limit = pLimit(3);

interface ChunkFileUrlType {
  url: string;
  file: Blob;
}

interface FileTableDataType {
  uid: string;
  name: string;
  size?: number;
  unitSize?: string;
  md5?: string;
  md5Progress?: number;
  progress?: number;
  file?: File;
  chunkCount?: number;
  chunkFileList?: Blob[];
  uploadedSize?: number;
  status: "preparation" | "preupload" | "uploading" | "success" | "error";
  url?: string;
}

const props = defineProps<{
  title?: string;
  modelValue: boolean;
  existingVideos?: Array<{ name: string; url: string; chapterId?: number }>;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "success", files: FileTableDataType[]): void;
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const uploadRef = ref();
const fileList = ref<FileTableDataType[]>([]);
const state = reactive<{ dataSource: FileTableDataType[] }>({
  dataSource: [],
});

// 监听 existingVideos 的变化，初始化已上传视频
watch(
  () => props.existingVideos,
  (newVideos) => {
    if (newVideos && newVideos.length > 0) {
      const existingFiles = newVideos.map((video, index) => ({
        uid: `${Date.now()}-${index}`,
        name: video.name,
        url: video.url,
        status: "success" as const,
        progress: 100,
        md5: "",
        md5Progress: 100,
      }));
      fileList.value = [...existingFiles];
      state.dataSource = [...existingFiles];
    }
  },
  { immediate: true }
);

const getStatusText = (status: string): string => {
  const statusMap = {
    preparation: "MD5计算中",
    preupload: "等待上传",
    uploading: "上传中",
    success: "上传成功",
    error: "上传失败",
  };
  return statusMap[status] || "";
};

const getTagType = (status: string): string => {
  const tagMap = {
    preparation: "info",
    preupload: "info",
    uploading: "info",
    success: "info",
    error: "danger",
  };
  return tagMap[status] || "info";
};

const beforeUpload = (file: File): boolean => {
  return true;
};

const handleFileChange = async (file: any, files: any[]) => {
  const existingSuccessFiles = state.dataSource.filter(
    (item) => item.status === "success"
  );

  const newFile = files[files.length - 1];
  if (!newFile) return;

  // 检查文件是否已存在
  const existing = state.dataSource.find(
    (item) => item.name === newFile.name && item.status === "success"
  );
  if (existing) {
    ElMessage.warning(`${newFile.name} 已存在，无需重复上传`);
    // 移除重复文件并更新 fileList
    fileList.value = fileList.value.filter((f) => f.uid !== newFile.uid);
    return;
  }

  // 只有在文件不重复时才更新 fileList 和 state.dataSource
  const newFiles = files
    .filter(
      (f) => !existingSuccessFiles.some((existing) => existing.uid === f.uid)
    )
    .map((f) => ({
      ...f,
      progress: f.progress || 0,
      md5Progress: f.md5Progress || 0,
      status: f.status || "preupload",
      md5: f.md5 || "",
    }));

  fileList.value = [...existingSuccessFiles, ...newFiles].filter(
    (item, index, self) => self.findIndex((i) => i.uid === item.uid) === index
  );

  const chunkCount = Math.ceil(newFile.size / CHUNK_SIZE);
  const dataItem: FileTableDataType = {
    uid: newFile.uid,
    name: newFile.name,
    size: newFile.size,
    md5: "",
    md5Progress: 0,
    progress: 0,
    chunkCount,
    file: newFile.raw,
    status: "preparation",
    chunkFileList: [],
    uploadedSize: 0,
  };
  state.dataSource.push(dataItem);

  const i = state.dataSource.findIndex((item) => item.uid === dataItem.uid);

  const chunks = await cutFile(newFile.raw, (progress: number) => {
    state.dataSource[i].md5Progress = progress;
    fileList.value[i].md5Progress = progress;
  });

  const merkleTree = new MerkleTree(chunks.map((chunk) => chunk.hash));
  const md5 = merkleTree.getRootHash();
  const chunkFileList = chunks.map((chunk) => chunk.blob);

  state.dataSource[i] = {
    ...state.dataSource[i],
    md5,
    chunkFileList,
    status: "preupload",
    md5Progress: 100,
  };

  fileList.value[i] = {
    ...fileList.value[i],
    md5,
    md5Progress: 100,
    status: "preupload",
  };
};

const customUpload = async (options: any) => {
  const index = state.dataSource.findIndex(
    (item) => item.uid === options.file.uid
  );
  if (index === -1) return;

  const item = state.dataSource[index];
  await uploadFile(index, item);
};

const startUpload = async () => {
  let hasFilesToUpload = false; // 用于标记是否有文件需要上传

  for (let i = 0; i < state.dataSource.length; i++) {
    if (
      !state.dataSource[i].md5 ||
      state.dataSource[i].status === "uploading"
    ) {
      continue; // 跳过当前文件
    }

    hasFilesToUpload = true; // 标记有文件需要上传
    await uploadFile(i, state.dataSource[i]); // 上传文件
  }

  // 检查是否有文件需要上传
  if (!hasFilesToUpload) {
    ElMessage.warning("没有文件需要上传");
  }
};

const uploadFile = async (index: number, item: FileTableDataType) => {
  try {
    const { code, data } = await checkFileByMd5(item.md5);

    // 更新状态和进度
    state.dataSource[index].status = "uploading";
    fileList.value[index].status = "uploading"; // 同步更新 fileList

    state.dataSource[index].url = data?.url;

    if (code === 2001) {
      state.dataSource[index].progress = 100;
      fileList.value[index].progress = 100; // 同步更新 fileList
      state.dataSource[index].status = "success";
      fileList.value[index].status = "success"; // 同步更新 fileList
      return;
    }

    const needUploadFile = await initSliceFile(item, data);

    const totalSize = needUploadFile.reduce(
      (pre, cur) => pre + cur.file.size,
      0
    );

    const uploadPromises = needUploadFile.map((chunkItem) =>
      limit(() => uploadChunk(chunkItem, index, totalSize, item.file?.type))
    );

    const results = await Promise.allSettled(uploadPromises);
    const failed = results.filter((r) => r.status === "rejected");

    if (failed.length > 0) {
      state.dataSource[index].status = "error";
      fileList.value[index].status = "error"; // 同步更新 fileList
      ElMessage.error(`${item.name} upload failed`);
      return;
    }

    const { code: mergeCode, data: mergeData } = await mergeFileByMd5(item.md5);
    if (mergeCode === 200) {
      state.dataSource[index].status = "success";
      fileList.value[index].status = "success"; // 同步更新 fileList
      state.dataSource[index].progress = 100;
      fileList.value[index].progress = 100; // 同步更新 fileList
      state.dataSource[index].url = mergeData;
      ElMessage.success(`${item.name} upload success`);
    } else {
      state.dataSource[index].status = "error";
      fileList.value[index].status = "error"; // 同步更新 fileList
      ElMessage.error(`${item.name} merge failed`);
    }
  } catch (error) {
    state.dataSource[index].status = "error";
    fileList.value[index].status = "error"; // 同步更新 fileList
    ElMessage.error(`${item.name} upload failed`);
  }
};

const initSliceFile = async (item: FileTableDataType, initData: any) => {
  const { uploadId, listParts } = initData || {};

  const param = {
    uploadId,
    originFileName: item.name,
    size: item.size,
    chunkSize: CHUNK_SIZE,
    chunkCount: item.chunkCount,
    md5: item.md5,
    contentType: item.file?.type || "video/mp4",
  };

  const needUploadFile: ChunkFileUrlType[] = [];

  const { code, data } = await initMultPartFile(param);
  if (code !== 200) return [];

  if ((listParts || []).length === 0) {
    item.chunkFileList?.forEach((chunk, index) => {
      needUploadFile.push({ url: data.urls[index], file: chunk });
    });
    return needUploadFile;
  }

  item.chunkFileList?.forEach((chunk, index) => {
    const i = (listParts || []).findIndex((v: number) => index + 1 === v);
    if (i === -1) {
      needUploadFile.push({ url: data.urls[index], file: chunk });
    }
  });

  return needUploadFile;
};

const uploadChunk = (
  chunkItem: ChunkFileUrlType,
  index: number,
  totalSize: number,
  type?: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    axios
      .put(chunkItem.url, chunkItem.file, {
        headers: {
          "Content-Type": type || "video/mp4",
        },
      })
      .then((res) => {
        if (res.status !== 200) {
          reject(chunkItem);
        } else {
          const newUploadedSize =
            state.dataSource[index].uploadedSize! + chunkItem.file.size;
          state.dataSource[index] = {
            ...state.dataSource[index],
            uploadedSize: newUploadedSize,
            progress: Math.floor((newUploadedSize / totalSize) * 100),
          };
          fileList.value[index] = {
            ...fileList.value[index],
            progress: state.dataSource[index].progress,
            status: state.dataSource[index].status,
          }; // 同步更新 fileList
          resolve();
        }
      })
      .catch((err) => {
        console.error(err);
        reject(chunkItem);
      });
  });
};

// 删除文件方法
const removeFile = (file: FileTableDataType) => {
  // 从 fileList 中移除
  fileList.value = fileList.value.filter((item) => item.uid !== file.uid);
  // 从 state.dataSource 中移除
  state.dataSource = state.dataSource.filter((item) => item.uid !== file.uid);
};

// 修改 saveFiles 方法，返回所有成功的文件
const saveFiles = () => {
  // 获取所有状态为 success 的文件（包括已存在和新上传的文件）
  const allSuccessFiles = state.dataSource.filter(
    (item) => item.status === "success"
  );

  if (allSuccessFiles.length === 0) {
    ElMessage.warning("没有上传成功的文件需要保存");
    return;
  }

  // 通过 emit 返回所有成功的文件
  emit("success", allSuccessFiles);
};

const onClose = () => {
  state.dataSource = state.dataSource.filter(
    (item) => item.status === "success"
  );
  fileList.value = fileList.value.filter((item) => item.status === "success");
};
</script>
