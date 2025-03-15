<template>
    <div
      class="bg-white"
      style=" height: 85vh; overflow-y: auto"
    >
      <!-- 章节列表 -->
      <div class="chapter-list flex flex-col gap-2">
        <div
          v-for="chapter in props.chapters"
          :key="chapter.id"
          class="chapter-item bg-white border-gray-200 rounded transition-all duration-300"
        >
          <!-- 章节标题 -->
          <div
            @click="toggleChapter(chapter)"
            class="chapter-title p-3 font-medium text-gray-600 hover:text-blue-500 cursor-pointer flex justify-between items-center"
          >
            <span>{{ chapter.title }}</span>
            <span>{{ expandedChapters[chapter.id] ? "−" : "+" }}</span>
          </div>
  
          <!-- 视频列表（展开时显示） -->
          <div
            v-if="expandedChapters[chapter.id]"
            class="video-list flex flex-col gap-2 p-3 pt-0"
          >
            <div
              v-for="video in videoLists[chapter.id]"
              :key="video.id"
              @click="playSelectedVideo(video)"
              :class="[
                'video-item p-2 rounded cursor-pointer transition-all duration-300',
                selectedVideo?.id === video.id
                  ? 'text-blue-500 font-medium'
                  : 'text-gray-600 hover:text-blue-500',
              ]"
            >
              {{ video.videoTitle.replace(/\.mp4$/, '') }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from "vue";
  import { ElMessage } from "element-plus";
  import { listVideos } from "@/api/funcode/video";
  import type { Chapter } from "@/types/index";
  import type { VideoJsPlayerOptions } from "video.js";
  
  const props = defineProps<{
    chapters: Chapter[];
    playerOptions: VideoJsPlayerOptions;
  }>();
  
  // 使用对象跟踪每个章节的展开状态和视频列表
  const expandedChapters = ref<{ [key: string]: boolean }>({}); // 记录每个章节是否展开
  const videoLists = ref<{ [key: string]: any[] }>({}); // 存储每个章节的视频列表
  const selectedVideo = ref<any | null>(null); // 当前选中的视频
  
  // 点击章节时切换展开状态
  function toggleChapter(chapter: Chapter) {
    expandedChapters.value[chapter.id] = !expandedChapters.value[chapter.id];
    if (expandedChapters.value[chapter.id] && !videoLists.value[chapter.id]) {
      loadVideos(chapter); // 如果展开且未加载视频，则加载
    }
  }
  
  // 加载某个章节的视频
  async function loadVideos(chapter: Chapter) {
    try {
      const response = await listVideos({ chapterId: chapter.id });
      if (response.rows?.length > 0) {
        videoLists.value[chapter.id] = response.rows;
      } else {
        videoLists.value[chapter.id] = [];
      }
    } catch (error) {
      console.error(`加载章节 ${chapter.title} 的视频失败:`, error);
      ElMessage.error("加载视频失败，请检查路径是否正确");
      videoLists.value[chapter.id] = [];
    }
  }
  
  // 点击视频时播放
  function playSelectedVideo(video: any) {
    if (video && video.videoUrl) {
      selectedVideo.value = video; // 标记当前选中的视频
      props.playerOptions.sources = [
        {
          src:  video.videoUrl,
          type: "video/mp4",
        },
      ];
    } else {
      ElMessage.warning("无法播放此视频");
    }
  }
  
  // 初始化时展开所有章节并加载视频，完成后播放第一个章节的第一个视频
  onMounted(async () => {
    if (props.chapters.length > 0) {
      // 展开所有章节并加载视频
      await Promise.all(
        props.chapters.map(async (chapter) => {
          expandedChapters.value[chapter.id] = true; // 默认展开
          await loadVideos(chapter); // 加载视频
        })
      );
  
      // 加载完成后，播放第一个章节的第一个视频
      const firstChapter = props.chapters[0];
      if (videoLists.value[firstChapter.id]?.length > 0) {
        const firstVideo = videoLists.value[firstChapter.id][0];
        playSelectedVideo(firstVideo); // 默认播放第一个视频
      }
    }
  });
  </script>
  
  <style scoped>
  /* 如果需要额外的样式，可以在这里添加 */
  </style>