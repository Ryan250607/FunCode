<!-- src/components/VideoPlayer.vue -->
<template>
  <div class="">
    <video ref="videoEl" class="video-js" />
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
  autoplay: false, // 不自动播放
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
      {
        // 倍数播放
        name: "playbackRateMenuButton",
        playbackRates: [0.5, 1, 1.5, 2, 2.5],
      },
      {
        name: "volumePanel", // 音量控制
        inline: false, // 不使用水平方式
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

// 暂停视频
const pauseVideo = () => {
  player?.pause();
};

// 快进 10 秒
const fastForward = () => {
  if (player) player.currentTime(player.currentTime() + 10);
};

// 快退 10 秒
const rewind = () => {
  if (player) player.currentTime(player.currentTime() - 10);
};

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

// 暴露方法
defineExpose({
  player: () => player,
  pauseVideo,
  fastForward,
  rewind,
});
</script>

<style scoped>
:deep .vjs-current-time {
  display: block !important;
}
:deep .video-js .vjs-time-control {
  display: block !important;
}

</style>
