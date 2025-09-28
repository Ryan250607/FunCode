

<template>
  <div class="p-4 bg-gray-50 text-sm text-gray-800 whitespace-pre-wrap overflow-auto min-h-[100px]">
    {{ result?.message || '暂无输出' }}
  </div>
</template>

<script setup lang="ts">
interface ExecutionResult {
  message: string;
  executionTime: number;
  memoryUsed: number;
}

defineProps<{
  result: ExecutionResult | null;
}>();
</script>

<style scoped>
div {
  font-family: monospace;
  border-top: 1px solid #d1d5db;
}
</style>