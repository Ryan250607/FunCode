<!-- src/components/VideoPlayer.vue -->
<template>
  <div class="video-player-container">
    <video ref="videoEl" class="video-js" />
  </div>
</template>

<script setup lang="ts">
import { debounce } from "lodash";
import { ref, onMounted, onUnmounted, watch } from "vue";
import videojs from "video.js";
import type { VideoJsPlayer, VideoJsPlayerOptions } from "video.js";
import "video.js/dist/video-js.css";

const props = defineProps<{
  options: VideoJsPlayerOptions;
}>();

const emit = defineEmits<{
  (e: "ready", player: VideoJsPlayer): void;
  (e: "play"): void;
  (e: "pause"): void;
  (e: "ended"): void;
  (e: "timeupdate", event: Event): void;
  (e: "error", error: any): void;
}>();

const videoEl = ref<HTMLVideoElement | null>(null);
let player: VideoJsPlayer | null = null;

// 初始化播放器
onMounted(() => {
  if (!videoEl.value) {
    console.error("Video element not found");
    return;
  }

  player = videojs(videoEl.value, props.options, () => {
    if (player) emit("ready", player);
  });

  player?.on("play", () => emit("play"));
  player?.on("pause", () => emit("pause"));
  player?.on("ended", () => emit("ended"));
  player?.on("timeupdate", (event) => emit("timeupdate", event));
  player?.on("error", (error) => emit("error", error));

  // 添加键盘事件监听
  document.addEventListener("keydown", handleKeyDown);
});

// 暂停视频的方法
const pauseVideo = () => {
  if (player) {
    player.pause();
  }
};

// 快进 10 秒
const fastForward = () => {
  if (player) {
    player.currentTime(player.currentTime() + 10);
  }
};

// 快退 10 秒
const rewind = () => {
  if (player) {
    player.currentTime(player.currentTime() - 10);
  }
};

// 键盘事件处理函数
const handleKeyDown = (event: KeyboardEvent) => {
  if (!player) return;

  switch (event.key) {
    case " ": // 空格键
      if (player.paused()) {
        player.play();
      } else {
        player.pause();
      }
      event.preventDefault(); // 阻止默认行为
      break;
    case "ArrowRight": // 右箭头键
      fastForward();
      break;
    case "ArrowLeft": // 左箭头键
      rewind();
      break;
    default:
      break;
  }
};

// 监听 sources 变化并切换视频源
watch(
  () => props.options.sources,
  debounce((newSources) => {
    if (player && newSources && newSources.length > 0) {
      player.src(newSources);
      player.load();
      if (props.options.autoplay) player.play();
    }
  }, 300),
  { deep: true }
);

// 更新其他配置（可选）
watch(
  () => props.options,
  (newOptions) => {
    if (player && newOptions) {
      player.options(newOptions);
    }
  },
  { deep: true }
);

onUnmounted(() => {
  if (player) {
    player.dispose();
    player = null;
  }

  // 移除键盘事件监听
  document.removeEventListener("keydown", handleKeyDown);
});

// 暴露方法和播放器实例给父组件
defineExpose({
  player: () => player,
  pauseVideo,
  fastForward,
  rewind,
});
</script>

<style scoped>
.video-player-container {
  width: 100%;
  max-width: 100%;
}

.video-js {
  width: 100%;
  height: auto;
}
</style>