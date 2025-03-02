<!-- src/components/VideoPlayer.vue -->
<template>
  <div>
    <video ref="videoEl" class="video-js" tabindex="0" />
  </div>
</template>

<script setup lang="ts">
import { debounce } from "lodash";
import { ref, onMounted, onUnmounted, watch } from "vue";
import videojs from "video.js";
import type { VideoJsPlayer, VideoJsPlayerOptions } from "video.js";
import "videojs-hotkeys";
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

// 定义默认配置
const defaultOptions: VideoJsPlayerOptions = {
  playbackRates: [0.5, 1.0, 1.5, 2.0],
  autoplay: true, // 自动播放
  muted: false, // 不静音
  loop: false, // 不循环
  preload: "auto", // 自动预加载
  controls: true, // 启用控制栏
  language: "zh-CN", // 中文界面
  aspectRatio: "16:9", // 宽高比
  sources: [], // 默认无视频源
  notSupportedMessage: "此视频暂无法播放，请稍后再试", // 错误提示
  controlBar: {
    // timeDivider: true, // 显示时间分隔符
    durationDisplay: true, // 显示总时长
    // remainingTimeDisplay: false, // 不显示剩余时间
    // fullscreenToggle: true, // 显示全屏按钮
    // volumePanel: {
    //   inline: false,//进度条水平显示
    // },
    children: [
      { name: "playToggle" }, // 播放按钮
      { name: "currentTimeDisplay" }, // 当前已播放时间
      { name: "progressControl" }, // 播放进度条
      { name: "durationDisplay" }, // 总时间
      { name: "timeDivider" }, // 总时间
      {
        // 倍数播放
        name: "playbackRateMenuButton",
        playbackRates: [0.5, 1, 1.5, 2, 2.5],
      },
      {
        name: "volumePanel", // 音量控制
        inline: false, // 不使用水平方式
      },
      {
        name: "fullscreenToggle", // 音量控制
      },
    ],
  },
};

// 合并默认配置和传入的配置
const mergedOptions = (): VideoJsPlayerOptions => {
  return {
    ...defaultOptions,
    ...props.options,
    sources: props.options.sources,
    controlBar: {
      ...defaultOptions.controlBar,
      ...props.options.controlBar, // 合并 controlBar 配置
    },
  };
};

// 初始化播放器
onMounted(() => {
  if (!videoEl.value) {
    console.error("Video element not found");
    return;
  }

  player = videojs(videoEl.value, mergedOptions(), () => {
    if (player) {
      emit("ready", player);

      // 配置 hotkeys
      player.hotkeys({
        volumeStep: 0.1,
        seekStep: 10,
        enableMute: true,
        enableVolume: true,
        enableFullscreen: true,
        enableNumbers: true,
        alwaysCaptureHotkeys: true,
        customKeys: {
          shiftRight: {
            key: (e: KeyboardEvent) => e.shiftKey && e.which === 39,
            handler: (player: VideoJsPlayer) => {
              player.currentTime(player.currentTime() + 30);
            },
          },
        },
      });
    }
  });


  player?.on("play", () => emit("play"));
  player?.on("pause", () => emit("pause"));
  player?.on("ended", () => emit("ended"));
  player?.on("timeupdate", (event) => emit("timeupdate", event));
  player?.on("error", (error) => emit("error", error));
});

// 监听 sources 变化并切换视频源
watch(
  () => props.options.sources,
  debounce((newSources) => {
    if (player && newSources && newSources.length > 0) {
      player.src(newSources);
      player.load();
      if (mergedOptions().autoplay) player.play();
    }
  }, 300),
  { deep: true }
);

// 更新其他配置
watch(
  () => props.options,
  (newOptions) => {
    if (player && newOptions) {
      player.options(mergedOptions());
    }
  },
  { deep: true }
);

onUnmounted(() => {
  if (player) {
    player.dispose();
    player = null;
  }
});
const pauseVideo = () => {
  player?.pause();
};
// 暴露方法
defineExpose({
  player: () => player,
  pauseVideo
});
</script>

<style scoped>
/* 播放器最外层容器 */
:deep .video-js {
  border-radius: 12px; /* YouTube风格的更大圆角 */
  overflow: hidden;
  background-color: #000; /* 黑色背景 */
}
:deep .vjs-tech:focus {
  outline: none; /* 移除默认的聚焦边框 */
}

/* 控制栏整体样式 */
:deep(.vjs-control-bar) {
  height: 40px;
  background: rgba(0, 0, 0, 0.2) !important; /* YouTube的深色半透明背景 */
  font-size: 13px;
  padding: 0 12px;
  display: flex;
  align-items: center;
}

/* 播放按钮（控制栏中的） */
:deep(.vjs-play-control) {
  order: 1;
  color: #fff !important;
  margin-right: 8px;
}

/* 当前时间显示 */
:deep(.vjs-current-time) {
  order: 2;
  display: flex !important;
  align-items: center;
  color: #fff;
}

/* 时间分隔符 */
:deep(.vjs-time-divider) {
  order: 3;
  color: #fff;
  padding: 0 4px;
}

/* 总时长显示 */
:deep(.vjs-duration) {
  order: 4;
  color: #fff;
}

/* 进度条容器 */
:deep(.vjs-progress-control) {
  order: 5;
  position: absolute !important;
  top: -8px;
  left: 0;
  right: 0;
  height: 4px;
  width: 100%;
  margin: 0;
}

/* 进度条轨道 */
:deep(.vjs-progress-holder) {
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
}

/* 播放进度 */
:deep(.vjs-play-progress) {
  background: #ff0000 !important;
  height: 4px;
}

/* 进度条滑块 */
:deep(.vjs-slider-handle) {
  width: 12px !important;
  height: 12px !important;
  background: #ff0000 !important;
  border: none !important;
  top: -4px;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
}

:deep .vjs-time-divider {
  padding: 0 !important;
  text-align: center;
}
:deep .vjs-time-control {
  padding: 0;
  display: block !important;
}

/* 音量控制 */
:deep(.vjs-volume-panel) {
  order: 6;
  margin-left: auto;
}

/* :deep(.vjs-volume-bar.vjs-slider-vertical) {
  width: 4px;
  height: 60px;
  margin: 8px auto;
  background: rgba(255, 255, 255, 0.2);
} */

:deep(.vjs-volume-level) {
  background: #ff0000;
}

/* 倍速菜单 */
:deep(.vjs-playback-rate) {
  order: 7;
  color: #fff;
}

:deep(.vjs-menu-button-popup .vjs-menu) {
  background: rgba(0, 0, 0, 0.8);
  /* bottom: 40px; */
}

:deep(.vjs-menu-item:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
}

:deep(.vjs-selected) {
  color: #ff0000 !important;
}

/* 全屏按钮 */
:deep(.vjs-fullscreen-control) {
  order: 8;
  color: #fff;
}

/* 大播放按钮 */
:deep(.vjs-big-play-button) {
  width: 64px;
  height: 64px;
  line-height: 64px;
  font-size: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  border: 2px solid #fff;
  color: #fff;
  transition: all 0.2s;
}

:deep(.vjs-big-play-button:hover) {
  background: rgba(255, 0, 0, 0.8);
  border-color: #ff0000;
}

/* 悬停时显示进度条 */
.video-js:hover :deep(.vjs-progress-control) {
  opacity: 1 !important;
  transform: translateY(0);
}

/* 加载动画 */
:deep(.vjs-loading-spinner) {
  border-color: #ff0000;
  border-top-color: transparent;
  width: 32px;
  height: 32px;
  margin: -16px 0 0 -16px;
}
</style>
