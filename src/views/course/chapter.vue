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

    <!-- 视频上传 -->
    <!-- <el-dialog
      :title="t('video_upload_title')"
      v-model="videoOpen"
      width="500px"
      append-to-body
      fullscreen
    >
      
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitVideoForm">确定</el-button>
          <el-button @click="videoCancel">取消</el-button>
        </div>
      </template>
    </el-dialog> -->
    <upload-chunk
        v-model="videoOpen"
        @success="handleUploadSuccess"
        :existing-videos="existingVideos"
      />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeMount } from "vue";
import { ElMessageBox, ElMessage, FormInstance } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import {
  listChapters,
  getChapters,
  delChapters,
  addChapters,
  updateChapters,
} from "@/api/funcode/chapters";
import {  listVideos,replaceChapterVideos } from "@/api/funcode/video";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const existingVideos = ref<Array<{ name: string; url: string; chapterId?: number }>>([]);
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
  name?: string;
  uid?: string;
  percentage?: number;
  raw?: File;
}

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
  courseId: courseId.value,
});
const formRef = ref<FormInstance | null>(null);
const chapterId = ref(null);
// 表单校验规则
const rules = ref({
  title: [{ required: true, message: "章节标题不能为空", trigger: "blur" }],
  chaptersOrder: [
    { required: true, message: "章节排序不能为空", trigger: "blur" },
  ],
});

// 视频上传相关
// const fileList = ref<UploadFile[]>([]);
// const existingVideo = ref<Video | null>(null);
// const videoUrl = ref<string>("");
// const selectedFile = ref<UploadFile | null>(null);
const videoResponse = ref<UploadResponse[] | null>(null);
// const uploading = ref(false);


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
};

const reset = () => {
  form.value = {
    id: undefined,
    title: undefined,
    courseId: courseId.value,
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
      existingVideos.value = response.rows;
      // videoUrl.value = response.rows.map((row: any) => row.videoUrl || "");
      existingVideos.value = [];
      // const regex = /[^/]+(?=\.\w+$)/;
      response.rows.forEach((video: any, index: number) => {
        // const match = video.videoUrl.match(regex);
        // if (match) {
          existingVideos.value.push({
            name: video.videoTitle,
            chapterId: chapterId,
            url: video.videoUrl,
            status: "success",
            // uid: `${Date.now()}-${index}`,
            percentage: 100,
          });
        // }
      });
    } else {
      existingVideos.value = [];
    }
  } catch (error) {
    console.error("获取视频失败:", error);
    ElMessage.error("获取视频失败");
  }
};

const handleUpdateVideo = async (row?: Chapter) => {
  // fileList.value = [];
  fetchExistingVideo(row?.id);
  chapterId.value = row?.id;
  videoOpen.value = true;
};

// 上传前的校验
// const beforeUpload = (files: UploadFile[]) => {
//   // for (const file of files) {
//   //   const isVideo = file.raw?.type.startsWith("video/");
//   //   const isLt500K = (file.raw?.size || 0) / 1024 < 500;
//   //   if (!isVideo) {
//   //     ElMessage.error(`${file.name} 只能上传视频文件！`);
//   //     return false;
//   //   }
//   // }
//   return true;
// };

// const getStatusText = (status: string) => {
//   switch (status) {
//     case "ready":
//       return "准备中";
//     case "uploading":
//       return "上传中";
//     case "success":
//       return "上传完成";
//     case "fail":
//       return "上传失败";
//     default:
//       return "";
//   }
// };

// 自定义上传方法（单个文件上传）
// const customUpload = async (file: UploadFile) => {
//   const chunkSize = 1 * 1024 * 1024; // 切片大小
//   const fileObj = file.file;
//   const nameList = fileObj.name.split(".");
//   fileData.value.name = fileObj.name;
//   fileData.value.size = fileObj.size;
//   fileData.value.type = fileObj.type;
//   fileData.value.suffix = nameList[nameList.length - 1];
//   if (chunkSize > fileData.value.size) {
//     // 文件大小小于切片大小，直接上传
//     try {
//       const response = await axios.post(
//         "/dev-api/api/videos/upload",
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//           onUploadProgress: (progressEvent: ProgressEvent) => {
//             if (progressEvent.total) {
//               const percentCompleted = Math.round(
//                 (progressEvent.loaded * 100) / progressEvent.total
//               );
//               fileList.value[fileIndex].percentage = percentCompleted;
//               fileList.value[fileIndex].status = "uploading";
//               if (selectedFile.value?.uid === file.uid) {
//                 selectedFile.value.percentage = percentCompleted;
//               }
//             }
//           },
//         }
//       );

//       fileList.value[fileIndex].status = "success";
//       fileList.value[fileIndex].percentage = 100;

//       let chapterId = fileList.value[0].chapterId;
//       videoResponse.value = [
//         {
//           chapterId,
//           ...response.data,
//         },
//       ];

//       ElMessage.success(`${file.name} 上传成功！`);
//       return response.data;
//     } catch (error) {
//       fileList.value[fileIndex].status = "fail";
//       fileList.value[fileIndex].percentage = 0;
//       ElMessage.error(`${file.name} 上传失败！`);
//       console.error(`文件 ${file.name} 上传失败:`, error);
//       throw error;
//     } finally {
//       uploading.value = false;
//     }
//   }
//   batchUpload(fileObj); // 大文件切片上传
// };

// const batchUpload = async (fileObj: File) => {
//   // percentage.value = 0
//   // dialogVisible.value = true
//   // cancelUpload.value = false
//   const chunkCount = Math.ceil(fileData.value.size / chunkSize); // 切片数量
//   fileData.value.md5 = getFileMd5(); // 文件唯一标识
//   for (let i = 0; i < chunkCount; i++) {
//     if (cancelUpload.value) return;
//     const res = await uploadChunkFile(i, fileObj);
//     if (res.code !== 0) {
//       dialogVisible.value = false;
//       ElMessageBox({
//         message: `${fileData.value.name}上传失败`,
//         title: "提示",
//       });
//       return;
//     }
//     if (i === chunkCount - 1) {
//       setTimeout(() => {
//         dialogVisible.value = false;
//         ElMessageBox({
//           message: `${fileData.value.name}上传成功`,
//           title: "提示",
//         });
//         axios
//           .post("mergeUpload", { folder: fileData.value.md5 })
//           .then((res) => updateUrl(res.data));
//       }, 500);
//     }
//   }
// };

// let controller: AbortController | null = null; // 当前切片上传 AbortController
// const uploadChunkFile = async (i: number, fileObj: File) => {
//   const start = i * chunkSize; // 切片开始位置
//   const end = Math.min(fileData.value.size, start + chunkSize); // 切片结束位置
//   const chunkFile = fileObj.slice(start, end); // 切片文件
//   const formData = new FormData(); // formData 参数需要与后端对齐
//   formData.append("fileName", fileData.value.name);
//   formData.append("folder", fileData.value.md5);
//   formData.append("file", chunkFile, String(i + 1)); // 必传字段；若第三个参数不传，切片 filename 默认是 blob ，如果后端是以切片名称来做合并的，则第三个参数一定要传
//   controller = new AbortController(); // 每一次上传切片都要新生成一个 AbortController ，否则重新上传会失败
//   return await axios
//     .post("mergeUpload", formData, {
//       // 调用后端上传切片接口
//       onUploadProgress: (data) => {
//         // 进度条展示
//         percentage.value = Number(
//           (
//             (Math.min(fileData.value.size, start + data.loaded) /
//               fileData.value.size) *
//             100
//           ).toFixed(2)
//         );
//       },
//       signal: controller.signal, // 取消上传
//     })
//     .then((res) => updateUrl(res.data));
// };

// const handleFileChange = (file: any, files: any[]) => {
//   fileList.value = files.map((f: any) => ({
//     ...f,
//     chapterId: fileList.value[0]?.chapterId || f.chapterId,
//     percentage: f.status === "success" ? 100 : 0,
//   }));
// };

// // 选择文件
// const selectFile = (file: UploadFile) => {
//   selectedFile.value = file;
// };

// // 删除视频
// const handleVideoDelete = (file: UploadFile) => {
//   if (fileList.value.length === 1) {
//     ElMessage.error("至少存在一个视频任务");
//     return;
//   }
//   const index = fileList.value.findIndex((f) => f.uid === file.uid);
//   if (index !== -1) {
//     fileList.value.splice(index, 1);
//   }
//   if (selectedFile.value?.uid === file.uid) {
//     selectedFile.value = null;
//   }
// };

// const submitVideoForm = async () => {
//   if (!videoResponse.value) {
//     ElMessage.warning("请先上传视频！");
//     return;
//   }
//   try {
//     await addVideos(videoResponse.value);
//     ElMessage.success("保存成功！");
//     videoOpen.value = false;
//   } catch (error) {
//     console.error("保存视频信息失败:", error);
//     ElMessage.error("保存视频信息失败！");
//   }
// };

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

const handleUploadSuccess = async (files: any[]) => {
  try {
    const videoData = files
      .filter(file => file.status === 'success')
      .map(file => ({
        chapterId: chapterId.value,
        videoTitle: file.name,
        videoUrl: file.url,
        duration: 0
      }))
    
    await replaceChapterVideos(chapterId.value,videoData)
    ElMessage.success('视频保存成功')
    videoOpen.value = false
    getList()
  } catch (error) {
    ElMessage.error('视频保存失败')
  }
}

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