<template>
  <el-config-provider :locale="elementLocale">
    <router-view></router-view>
  </el-config-provider>
</template>

<script setup lang="ts">
import useSettingsStore from "@/store/modules/settings";
import { handleThemeStyle } from "@/utils/theme";
import { nextTick, onMounted } from "vue";


import { useElementPlusLocale } from "@/hooks/useElementPlusLocale";

/** 使用Element Plus语言环境hooks */
const { elementLocale } = useElementPlusLocale();
console.log(elementLocale.value);

onMounted(() => {
  nextTick(() => {
    // 初始化主题样式
    handleThemeStyle(useSettingsStore().theme);
  });
});
</script>
