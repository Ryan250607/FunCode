<script setup lang="ts">
import useLocaleStore from '@/store/modules/i18n';
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n'


// 定义语言类型
type LangType = 'zhCn' | 'en';

// 语言显示映射
const langType: Record<LangType, string> = {
  zhCn: '中文',
  en: 'English',
};

// 获取 Pinia store 和 i18n 实例
const localeStore = useLocaleStore();
const { locale } = useI18n();

// 处理语言切换
const handleCommand = (value: LangType) => {
  if (localeStore.locale === value) return;
  locale.value = value // 更新 i18n 实例的语言
  localeStore.setlocale(value); // 更新 Pinia store 的语言
  // ElMessage.closeAll();
  // ElMessage.success(`${langType[value]}切换成功！`);
};
</script>

<template>
  <el-dropdown @command="handleCommand" class="lang-warp">
    <span class="el-dropdown-link">
      {{ langType[localeStore.locale] }}
      <el-icon>
        <arrow-down />
      </el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="zhCn">中文</el-dropdown-item>
        <el-dropdown-item command="en">English</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style scoped lang="scss">
.lang-warp {
  margin: 0 20px;
  .el-dropdown-link {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    color: #606266; /* Element Plus 默认文字颜色，可调整 */
  }
}
</style>