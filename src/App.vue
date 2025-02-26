<template>
  <ElConfigProvider :locale="locale === 'en' ? en : zhCn">
    <router-view />
  </ElConfigProvider>
</template>

<script setup lang="ts">
import useSettingsStore from "@/store/modules/settings";
import { handleThemeStyle } from "@/utils/theme";
import { nextTick, onMounted } from "vue";
import { useI18n } from "vue-i18n";
const { locale } = useI18n();
import en from 'element-plus/es/locale/lang/en';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
onMounted(() => {
  nextTick(() => {
    // 初始化主题样式
    handleThemeStyle(useSettingsStore().theme);
  });
});
</script>
