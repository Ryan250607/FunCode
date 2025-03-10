<template>
  <div class="code-viewer">
    <div class="code-viewer__toolbar">
      <div class="code-viewer__language">{{ languageLabel }}</div>
      <div class="code-viewer__actions">
        <el-tooltip content="复制代码" placement="top">
          <el-button type="primary" link size="small" :icon="DocumentCopy" @click="copyCode" />
        </el-tooltip>
      </div>
    </div>
    <pre class="code-viewer__content" :class="codeLanguageClass">{{ code }}</pre>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ElMessage } from 'element-plus';

const props = defineProps<{
  code: string;
  language: string;
}>();

const languageLabel = computed(() => {
  const textMap: Record<string, string> = {
    java: 'Java',
    python: 'Python',
    c: 'C',
  };
  
  return textMap[props.language.toLowerCase()] || props.language;
});

const codeLanguageClass = computed(() => {
  return `language-${props.language.toLowerCase()}`;
});

const copyCode = () => {
  navigator.clipboard.writeText(props.code)
    .then(() => {
      ElMessage.success('代码已复制到剪贴板');
    })
    .catch(() => {
      ElMessage.error('复制失败，请手动复制');
    });
};
</script>

<style scoped>
.code-viewer {
  width: 100%;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.code-viewer__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.code-viewer__language {
  font-family: monospace;
  font-weight: 600;
  color: #606266;
}

.code-viewer__content {
  margin: 0;
  padding: 16px;
  background-color: #fafafa;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  color: #24292e;
  overflow-x: auto;
  max-height: 400px;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 语言特定样式 */
.language-java {
  color: #24292e;
}

.language-python {
  color: #1a1a1a;
}

.language-c {
  color: #333333;
}
</style>