<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="章节标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入章节标题"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          >新增</el-button
        >
      </el-col>

      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click.stop="handleUpdate"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click.stop="handleDelete"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          >导出</el-button
        >
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table
      v-loading="loading"
      :data="chaptersList"
      @selection-change="handleSelectionChange"
      @row-click="viewChapterDetail"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="章节标题" align="center" prop="title" />
      <el-table-column label="章节描述" align="center" prop="description" />
      <el-table-column label="章节排序" align="center" prop="chaptersOrder" />
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template #default="scope">
          <el-button
            type="text"
            icon="UploadFilled"
            @click.stop="handleUpdateVideo(scope.row)"
            >上传视频</el-button
          >
          <el-button
            type="text"
            icon="Edit"
            @click.stop="handleUpdate(scope.row)"
            >修改</el-button
          >
          <el-button
            type="text"
            icon="Delete"
            @click.stop="handleDelete(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="getList"
    />

    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="课程id" prop="courseId" hidden>
          <el-input v-model="form.courseId" placeholder="请输入课程id" />
        </el-form-item>
        <el-form-item label="章节标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入章节标题" />
        </el-form-item>
        <el-form-item label="章节描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="请输入内容"
          />
        </el-form-item>
        <el-form-item label="章节排序" prop="chaptersOrder">
          <el-input v-model="form.chaptersOrder" placeholder="请输入章节排序" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确定</el-button>
          <el-button @click="cancel">取消</el-button>
        </div>
      </template>
    </el-dialog>
    <!--视频上传-->
    <el-dialog
      :title="t('video_upload_title')"
      v-model="videoOpen"
      width="500px"
      append-to-body
      fullscreen
    >
      <el-upload
        ref="uploadRef"
        class="upload-demo"
        :auto-upload="false"
        :on-progress="handleProgress"
        :on-change="handleFileChange"
        :limit="5"
        drag
        multiple
        :file-list="fileList"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <!-- <el-button type="primary">选择视频文件</el-button> -->
        <div class="el-upload__text">
          Drop file here or <em>click to upload</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            mp4 files with a size less than 500kb
          </div>
        </template>
        <template #file="{ file }">
          <div
            class="w-40 custom-file-item relative cursor-pointer p-3 border border-gray-200 rounded-lg bg-white mb-2"
            @click="selectFile(file)"
            :class="[
              selectedFile === file
                ? ['bg-primary-100', 'text-white', 'bg-opacity-80']
                : [],
            ]"
          >
            <!-- 文件名称 -->
            <span class="file-name block mb-2 truncate">
              {{ file.name }}
            </span>

            <!-- 上传进度条 -->
            <div
              v-if="file.status === 'uploading'"
              class="w-full bg-gray-200 rounded-full h-2"
            >
              <div
                class="bg-primary h-2 rounded-full"
                :style="{ width: file.percentage + '%' }"
              ></div>
            </div>
            <div class="flex items-center">
              <el-icon><SuccessFilled /></el-icon>
              <!-- 上传状态 -->
              <span class="file-status">
                {{ getStatusText(file.status) }}
              </span>
            </div>
            <div
              v-if="selectedFile === file"
              class="absolute top-1 right-1"
              @click.stop="handleVideoDelete(file)"
            >
              <svg-icon :icon-class="'delete'" class="opacity-90" />
            </div>
          </div>
        </template>
      </el-upload>
      <!-- 单独的上传进度显示区域 -->
      <div
        v-if="selectedFile"
        class="progress-display mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50"
      >
        <div class="text-sm text-gray-700 mb-2">
          {{ selectedFile.name }}
        </div>
        <div
          v-if="selectedFile.status === 'uploading'"
          class="w-full bg-gray-200 rounded-full h-2"
        >
          <div
            class="bg-primary h-2 rounded-full"
            :style="{ width: selectedFile.percentage + '%' }"
          ></div>
        </div>
        <div class="text-xs mt-1">
          状态：{{ getStatusText(selectedFile.status) }}
        </div>
      </div>
      <div>
        <el-button type="primary" @click="startUpload">开始上传</el-button>
      </div>
      <!-- <VideoList
        :videos="fileList"
        @delete="handleVideoDelete"
        @preview="handlePreview"
      />
      <VideoPreview
        :visible="previewVisible"
        :videoUrl="previewUrl"
        @close="handleClosePreview"
      /> -->
      <!-- </el-form> -->
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitVideoForm">确定</el-button>
          <el-button @click="videoCancel">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeMount, nextTick } from "vue";
import { ElMessageBox, ElMessage, FormInstance } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import {
  listChapters,
  getChapters,
  delChapters,
  addChapters,
  updateChapters,
} from "@/api/funcode/chapters";
import type { VideoJsPlayer, VideoJsPlayerOptions } from "video.js";
import {
  uploadVideos,
  addVideos,
  listVideos,
  updateVideos,
} from "@/api/funcode/video";
import { useI18n } from "vue-i18n";
import type { UploadInstance } from "element-plus";
const { t } = useI18n();

// 类型定义
interface Chapter {
  id?: number;
  courseId?: string | number;
  title?: string;
  description?: string;
  chaptersOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface QueryParams {
  pageNum: number;
  pageSize: number;
  courseId?: string | number;
  title?: string | null;
  description?: string | null;
}
interface UploadFile {
  chapterId?: string | number;
  url?: string;
  duration?: number;
  status?: string;
  name?: string
  uid?: string
}
//
interface Video {
  id?: number;
  chapterId?: string | number;
  videoUrl?: string;
  fileName?: string;
  duration?: number;
}
interface UploadResponse {
  chapterId?: string | number;
  videoTitle?: string;
  videoUrl?: string;
  duration?: number;
}

// 响应式数据
const loading = ref(true);
const ids = ref<number[]>([]);
const single = ref(true);
const multiple = ref(true);
const showSearch = ref(true);
const total = ref(0);
const chaptersList = ref<Chapter[]>([]);
const title = ref("");
const open = ref(false);
const videoOpen = ref(false);
const route = useRoute();
const router = useRouter();
const courseId = ref(route.query.id);
const queryParams = ref<QueryParams>({
  pageNum: 1,
  pageSize: 10,
  courseId: route.query.id,
  title: null,
  description: null,
});
const form = ref<Chapter>({
  courseId: courseId.value, // 初始化时赋值
});
const formRef = ref<FormInstance | null>(null);

// 表单校验规则
const rules = ref({
  title: [{ required: true, message: "章节标题不能为空", trigger: "blur" }],
  chaptersOrder: [
    { required: true, message: "章节排序不能为空", trigger: "blur" },
  ],
});
//视频上传
const fileList = ref<UploadFile[]>([]);
const existingVideo = ref<Video | null>(null);
const progress = ref(0);
const uploading = ref(false);
const uploadSuccess = ref(false);
const videoUrl = ref<string>(""); // HLS 视频 URL
// Video.js 配置

const selectedFile = ref(null); // 当前选中的文件
const videoResponse = ref<UploadResponse | null>(null);
const uploadRef = ref<UploadInstance>();
// 方法
const viewChapterDetail = (chapter: Chapter) => {
  router.push({
    path: "/courses/chapters/video",
    query: { chapterId: chapter.id?.toString() },
  });
};

const getList = async () => {
  try {
    loading.value = true;
    const response = await listChapters(queryParams.value);
    chaptersList.value = response.rows;
    total.value = response.total;
  } catch (error) {
    ElMessage.error("数据加载失败");
  } finally {
    loading.value = false;
  }
};

const cancel = () => {
  open.value = false;
  reset();
};
const videoCancel = () => {
  videoOpen.value = false;
  // reset();
};

const reset = () => {
  form.value = {
    id: undefined,
    title: undefined,
    courseId: courseId.value, // 保持 courseId 不变
    description: undefined,
    chaptersOrder: undefined,
    createdAt: undefined,
    updatedAt: undefined,
  };
  formRef.value?.resetFields();
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    courseId: courseId.value,
    title: null,
    description: null,
  };
  handleQuery();
};

const handleSelectionChange = (selection: Chapter[]) => {
  ids.value = selection.map((item) => item.id!);
  single.value = selection.length !== 1;
  multiple.value = selection.length === 0;
};

const handleAdd = () => {
  reset();
  open.value = true;
  title.value = "添加章节";
};

const handleUpdate = async (row?: Chapter) => {
  reset();
  const id = row?.id || ids.value[0];
  try {
    const response = await getChapters(id);
    form.value = response.data;
    open.value = true;
    title.value = "修改章节";
  } catch (error) {
    ElMessage.error("获取章节详情失败");
  }
};

// 获取已有视频
const fetchExistingVideo = async (chapterId: number) => {
  if (!chapterId) return;
  try {
    const response = await listVideos({ chapterId });
    if (response.rows && response.rows.length > 0) {
      existingVideo.value = response.rows; // 修改为存储全部 rows
      videoUrl.value = response.rows.map(row => row.videoUrl || ""); // 将所有 videoUrl 存为数组

      // 清空 fileList 并添加所有已有视频
      fileList.value = [];
      const regex = /[^/]+(?=\.\w+$)/;
      
      response.rows.forEach((video, index) => {
        const match = video.videoUrl.match(regex);
        if (match) {
          fileList.value.push({
            name: match[0], // 文件名
            chapterId: chapterId,
            url: video.videoUrl, // 视频URL
            status: "success", // 标记为已上传成功
            uid: `${Date.now()}-${index}`, // 生成唯一ID，避免后续冲突
          });
        }
      });
    } else {
      fileList.value = []; // 如果没有视频，清空列表
    }
  } catch (error) {
    console.error("获取视频失败:", error);
    ElMessage.error("获取视频失败");
  }
};

const handleUpdateVideo = async (row?: Chapter) => {
  fileList.value = [];
  fetchExistingVideo(row?.id);
  videoOpen.value = true;
};
// 上传前的校验
const beforeUpload = (files: UploadFile[]) => {
  // const isVideo = file.type.startsWith("video/");
  // const isLt500K = file.size / 1024 < 500; // 检查文件大小是否小于500KB
  // if (!isVideo) {
  //   ElMessage.error("只能上传视频文件！");
  //   return false;
  // }
  // if (!isLt500K) {
  //   ElMessage.error("视频文件大小不能超过500KB！");
  //   return false;
  // }
  console.log(files);

  ElMessage.success("检查");
  return true;
};
// 上传进度
const handleProgress = (event: any, file: any) => {
  if (selectedFile.value && selectedFile.value.uid === file.uid) {
    selectedFile.value.percentage = Math.round(event.percent || 0);
  }
};
const getStatusText = (status: any) => {
  switch (status) {
    case "ready":
      return "准备中";
    case "uploading":
      return "上传中";
    case "success":
      return "上传完成";
    case "fail":
      return "上传失败";
    default:
      return "";
  }
};

// 自定义上传方法（支持批量上传）
const customUpload = async (files: UploadFile[]) => {
  if (!fileList.value || fileList.value.length === 0) {
    ElMessage.warning("请先选择视频文件！");
    return;
  }
  // 过滤出未上传的文件（状态不是 success 的文件）
  if (files.length === 0) {
    ElMessage.warning("没有新的视频文件需要上传！");
    return;
  }
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file.raw); // 使用 file.raw 获取原始文件
    });

    uploading.value = true;
    const response = await uploadVideos(formData);

    // 更新文件状态为成功
    fileList.value.forEach((file) => {
      file.status = "success";
    });
    let chapterId = fileList.value[0].chapterId;
    ElMessage.success("视频上传成功！");
    videoResponse.value = response.map((item:any) => {
      return {
        chapterId,
        ...item
      };
    });
  } catch (error) {
    console.error("上传失败:", error);
    fileList.value.forEach((file) => {
      file.status = "fail";
    });
    ElMessage.error("视频上传失败！");
    throw error;
  } finally {
    uploading.value = false;
  }
};
const startUpload = () => {
  const filesToUpload = fileList.value.filter(
    (file) => file.status !== "success"
  );
  beforeUpload(filesToUpload);
  customUpload(filesToUpload);
};
const handleFileChange = (file: any, files: any[]) => {
  fileList.value = files; // 更新文件列表
};
// 选择文件
const selectFile = (file: any) => {
  selectedFile.value = file;
};
// 删除视频
const handleVideoDelete = (file: any) => {
  if (fileList.value.length === 1) {
    ElMessage.error("至少存在一个视频任务");
    return;
  }
  const index = fileList.value.indexOf(file);
  if (index !== -1) {
    fileList.value.splice(index, 1);
  }
  // 如果删除的是当前选中的文件，清空选中状态
  if (selectedFile.value && selectedFile.value.uid === file.uid) {
    selectedFile.value = null;
  }
};

// 更新 video.js 来源
// const updateVideoSources = (url: string) => {
//   videoOptions.value.sources = [
//     {
//       src: url,
//       type: "application/x-mpegURL", // HLS 类型
//     },
//   ];
// };
const submitVideoForm = async () => {
  uploading.value = false;
  // uploadSuccess.value = true;
  // videoUrl.value = response.url; // 设置 HLS URL
  // updateVideoSources(response.url); // 更新 Video.js 来源

  try {
    // await fetchExistingVideo();
    await addVideos(videoResponse.value);
    // if (selectedFile.value && selectedFile.value.uid === file.uid) {
    //   selectedFile.value.status = "success";
    // }
    ElMessage.success("保存成功！");
    videoOpen.value = false;
  } catch (error) {
    console.error("保存视频信息失败:", error);
    ElMessage.error("保存视频信息失败！");
  }
};
const submitForm = async () => {
  try {
    await formRef.value?.validate();
    if (form.value.id) {
      await updateChapters(form.value);
      ElMessage.success("修改成功");
    } else {
      await addChapters(form.value);
      ElMessage.success("新增成功");
    }
    open.value = false;
    getList();
  } catch (error) {
    ElMessage.error("提交失败");
  }
};

const handleDelete = async (row?: Chapter) => {
  const deleteIds = row?.id ? [row.id] : ids.value;
  try {
    await ElMessageBox.confirm(
      `是否确认删除章节编号为"${deleteIds}"的数据项？`,
      "警告",
      {
        type: "warning",
      }
    );
    await delChapters(deleteIds);
    ElMessage.success("删除成功");
    getList();
  } catch (error) {
    if (error !== "cancel") ElMessage.error("删除失败");
  }
};

const handleExport = () => {
  const url = `/system/chapters/export?${new URLSearchParams(
    queryParams.value as any
  ).toString()}`;
  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `chapters_${new Date().getTime()}.xlsx`;
      link.click();
    });
};

// 初始化
onBeforeMount(() => {
  form.value.courseId = courseId.value;
});

onMounted(() => {
  getList();
});
</script>
<style scoped>
:deep .el-upload-list__item:hover {
  background: transparent;
}
:deep .el-upload-list__item {
  width: auto;
  margin-right: 10px;
}

:deep .el-upload-list {
  display: flex;
}
</style>
