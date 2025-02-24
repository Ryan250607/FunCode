<template>
  <div>
    <h1>上传并播放视频</h1>

    <el-form :model="form" label-width="80px">
      <el-form-item label="视频文件">
        <el-upload
          class="upload-demo"
          :http-request="customUpload"
          :on-progress="handleProgress"
          :on-success="handleSuccess"
          :before-upload="beforeUpload"
          :limit="2"
          :file-list="fileList"
        >
          <el-button type="primary">选择视频文件</el-button>
        </el-upload>
      </el-form-item>
    </el-form>

    <el-progress v-if="uploading" :percentage="progress" />

    <el-alert v-if="uploadSuccess" title="上传成功" type="success" :closable="false" />

    <!-- 使用 VideoPlayer 组件播放 HLS 视频 -->
    <div v-if="videoUrl" class="video-player-wrapper">
      <VideoPlayer
        :options="videoOptions"
        @ready="onPlayerReady"
        @play="onPlay"
        @pause="onPause"
        @ended="onEnded"
        @timeupdate="onTimeUpdate"
        @error="onError"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';
import type { VideoJsPlayer, VideoJsPlayerOptions } from 'video.js';
import { upload, addVideos, listVideos, updateVideos } from '@/api/funcode/video';

// 类型定义
interface Video {
  id?: number;
  chapterId?: string | number;
  videoUrl?: string;
  fileName?: string;
  duration?: number;
}

interface UploadFile {
  name: string;
  url: string;
}

// 响应式数据
const form = ref({ title: '', description: '' });
const uploading = ref(false);
const progress = ref(0);
const uploadSuccess = ref(false);
const fileList = ref<UploadFile[]>([]);
const existingVideo = ref<Video | null>(null);
const videoId = ref<number | null>(null);
const videoUrl = ref<string>(''); // HLS 视频 URL
const route = useRoute();

// Video.js 配置
const videoOptions = ref<VideoJsPlayerOptions>({
  controls: true,
  autoplay: false,
  preload: 'auto',
  fluid: true,
  sources: [],
});

// 获取已有视频
const fetchExistingVideo = async () => {
  const chapterId = route.query.chapterId;
  if (!chapterId) return;
  try {
    const response = await listVideos({ chapterId });
    if (response.rows && response.rows.length > 0) {
      existingVideo.value = response.rows[0];
      videoId.value = response.rows[0].id;
      videoUrl.value = existingVideo.value.videoUrl || '';
      updateVideoSources(videoUrl.value);
      const match = existingVideo.value.videoUrl?.match(/uploads\/(.*)/);
      if (match) {
        fileList.value = [{ name: match[1], url: existingVideo.value.videoUrl! }];
      }
    }
  } catch (error) {
    console.error('获取视频失败:', error);
    ElMessage.error('获取视频失败');
  }
};

// 更新 video.js 来源
const updateVideoSources = (url: string) => {
  videoOptions.value.sources = [
    {
      src: url,
      type: 'application/x-mpegURL', // HLS 类型
    },
  ];
};

// 上传前的校验
const beforeUpload = (file: File) => {
  const isVideo = file.type.startsWith('video/');
  if (!isVideo) {
    ElMessage.error('只能上传视频文件！');
  }
  return isVideo;
};

// 上传进度
const handleProgress = (event: any) => {
  uploading.value = true;
  progress.value = Math.round((event.percent || 0) * 100);
};

// 上传成功
const handleSuccess = async (response: any, file: File) => {
  uploading.value = false;
  uploadSuccess.value = true;
  videoUrl.value = response.url; // 设置 HLS URL
  updateVideoSources(response.url); // 更新 Video.js 来源

  try {
    if (videoId.value != null) {
      await updateVideos({ videoUrl: response.url, id: videoId.value });
      await fetchExistingVideo();
      ElMessage.success('视频上传成功！');
    } else {
      await addVideos({
        chapterId: route.query.chapterId,
        videoUrl: response.url,
        duration: response.duration,
      });
      ElMessage.success('视频上传成功！');
    }
  } catch (error) {
    console.error('保存视频信息失败:', error);
    ElMessage.error('保存视频信息失败！');
  }
};

// 自定义上传方法
const customUpload = async (options: { file: File }) => {
  const { file } = options;
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await upload(formData, {
      onUploadProgress: (progressEvent: ProgressEvent) => {
        progress.value = Math.round((progressEvent.loaded / progressEvent.total) * 100);
      },
    });
    handleSuccess(response, file);
  } catch (error) {
    console.error('上传失败:', error);
    ElMessage.error('视频上传失败！');
  }
};

// VideoPlayer 事件处理
const onPlayerReady = (player: VideoJsPlayer) => {
  console.log('播放器已就绪', player);
};

const onPlay = () => {
  console.log('视频开始播放');
};

const onPause = () => {
  console.log('视频暂停');
};

const onEnded = () => {
  console.log('视频播放结束');
};

const onTimeUpdate = (event: Event) => {
  console.log('播放时间更新', event);
};

const onError = (error: any) => {
  console.error('播放错误', error);
  ElMessage.error('视频播放出错');
};

// 初始化
onMounted(() => {
  fetchExistingVideo();
});
</script>

<style scoped>
.upload-demo {
  margin-top: 20px;
}

.video-player-wrapper {
  margin-top: 20px;
  max-width: 800px;
}
</style>