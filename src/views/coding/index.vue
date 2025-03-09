<template>
    <div class="leetcode-code-container h-[calc(100vh-85px)] flex flex-col  text-gray-800 overflow-hidden shadow-lg rounded-lg">
      <!-- 顶部工具栏 -->
      <div class="code-toolbar flex justify-between items-center p-3 bg-gradient-to-r from-gray-100 to-gray-200 border-b border-gray-300 shadow-sm">
        <div class="w-32">
          <el-select
            v-model="language"
            placeholder="选择语言"
            class="w-full"
            popper-class="custom-select"
          >
            <el-option
              v-for="lang in languages"
              :key="lang.value"
              :label="lang.label"
              :value="lang.value"
              class="hover:bg-blue-50"
            />
          </el-select>
        </div>
  
        <div class="toolbar-right flex gap-3">
          <el-button
            type="primary"
            size="small"
            @click="runCode"
            :loading="loading"
            class="px-4 py-2 text-white rounded-md shadow-md transition-all duration-200"
          >
            运行代码
          </el-button>
          <!-- <el-button
            type="success"
            size="small"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-md transition-all duration-200"
          >
            提交
          </el-button> -->
        </div>
      </div>
  
      <!-- 代码编辑区域 -->
      <CodeEditor
        ref="codeEditor"
        class="leetcode-code-editor flex-1 bg-white border border-gray-200 min-h-0 shadow-inner"
        v-model="code"
        @run="runCode"
      />
  
      <!-- 运行结果区域 -->
      <div class="border-t border-gray-300 flex-none flex flex-col">

        <ResultDisplay
          :result="result"
        />
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive, onMounted, nextTick } from 'vue';
  import { run } from '@/api/funcode/execution';
  import CodeEditor from '@/components/CodeEditor.vue';
  import ResultDisplay from '@/components/ResultDisplay.vue';
  
  // 定义响应式变量
  const language = ref<string>('javascript');
  const languages = reactive([
    { value: 'javascript', label: 'JavaScript' },
    { value: 'c', label: 'C' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
  ]);
  const code = ref<string>('');
  const result = ref<string>('');
  const loading = ref<boolean>(false);
  
  // 运行代码
  async function runCode() {
    loading.value = true;
    try {
      const response = await run({
        code: code.value,
        language: language.value,
      });
      result.value = response || '无输出'; // 假设 response 是返回的对象
    } catch (error: any) {
      result.value = `执行出错：${error.message}`;
    } finally {
      loading.value = false;
    }
  }
  </script>
  
  <style scoped>
  /* 自定义下拉菜单样式 */
  .custom-select .el-select-dropdown__item {
    @apply hover:bg-blue-50 transition-colors duration-200;
  }
  </style>