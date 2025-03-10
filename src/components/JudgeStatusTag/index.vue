<template>
  <el-tag :type="tagType" :effect="tagEffect">
    {{ statusText }}
  </el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { JudgeStatus } from '@/types';

const props = defineProps<{
  status: JudgeStatus;
}>();

const tagType = computed(() => {
  const typeMap: Record<string, string> = {
    ACCEPTED: 'success',
    WRONG_ANSWER: 'danger',
    COMPILATION_ERROR: 'warning',
    RUNTIME_ERROR: 'danger',
    TIME_LIMIT_EXCEEDED: 'warning',
    MEMORY_LIMIT_EXCEEDED: 'warning',
  };
  
  return typeMap[props.status] || 'info';
});

const tagEffect = computed(() => {
  return props.status === 'ACCEPTED' ? 'dark' : 'light';
});

const statusText = computed(() => {
  const textMap: Record<string, string> = {
    ACCEPTED: '评判通过',
    WRONG_ANSWER: '答案错误',
    COMPILATION_ERROR: '编译错误',
    RUNTIME_ERROR: '运行时错误',
    TIME_LIMIT_EXCEEDED: '时间超限',
    MEMORY_LIMIT_EXCEEDED: '内存超限',
  };
  
  return textMap[props.status] || '未知状态';
});
</script>