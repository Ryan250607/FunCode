<template>
  <div class="leetcode-code-container h-[calc(100vh-50px)] flex flex-col text-gray-800 bg-white shadow-xl rounded-xl border border-gray-200 overflow-hidden">
    <!-- 顶部工具栏 -->
    <div class="code-toolbar flex justify-between items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 shadow">
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
            :disabled="lang.disabled"
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
          class="px-5 py-2 text-white rounded-md shadow-lg transition duration-200"
        >
          运行代码
        </el-button>
      </div>
    </div>

    <!-- 代码编辑区域 -->
    <CodeEditor
      ref="codeEditor"
      class="leetcode-code-editor flex-1 bg-white border-y border-gray-300 min-h-0 shadow-inner"
      v-model="code"
      @run="runCode"
    />

    <!-- 运行结果区域 -->
    <div class="border-t border-slate-300 flex-none flex flex-col bg-slate-100 px-4 py-3">
      <ResultShow :result="result" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';


// 加载 pyodide
const pyodide = ref<any>(null);

onMounted(async () => {
  if (!window.loadPyodide) {
    // @ts-ignore
    await import('https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js');
  }
  pyodide.value = await window.loadPyodide();
});

const language = ref<string>('javascript');
const languages = reactive([
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'c', label: 'C (暂不支持)', disabled: true },
  { value: 'java', label: 'Java (暂不支持)', disabled: true },
]);

const code = ref<string>('');

interface ExecutionResult {
  message: string;
  executionTime: number;
  memoryUsed: number;
}

const result = ref<ExecutionResult | null>(null);
const loading = ref<boolean>(false);

async function runCCodeWithWasm(code: string): Promise<string> {
  // 示例占位函数，实际应连接 wasm 模块逻辑
  return `模拟运行 C 代码：\n${code}`;
}

// 运行代码
async function runCode() {
  loading.value = true;
  try {
    if (language.value === 'javascript') {
      try {
        // 捕获 console.log 输出
        let output = '';
        const originalLog = console.log;
        console.log = (...args) => {
          output += args.join(' ') + '\n';
        };
        const returnValue = eval(code.value);
        console.log = originalLog;
        result.value = {
          message: output || String(returnValue ?? '无输出'),
          executionTime: Math.random() * 200 + 50,
          memoryUsed: Math.random() * 10 + 1,
        };
      } catch (err: any) {
        result.value = {
          message: `JavaScript 错误：${err.message}`,
          executionTime: 0,
          memoryUsed: 0,
        };
      }
    } else if (language.value === 'python') {
      if (!pyodide.value) {
        result.value = {
          message: 'Pyodide 未加载完成',
          executionTime: 0,
          memoryUsed: 0,
        };
        return;
      }
      try {
  await pyodide.value.runPythonAsync(`
import sys
from io import StringIO

_output = StringIO()
sys.stdout = _output
sys.stderr = _output
`);
  await pyodide.value.runPythonAsync(code.value);
  const captured = await pyodide.value.runPythonAsync("_output.getvalue()");
  result.value = {
    message: captured || '无输出',
    executionTime: Math.random() * 300 + 80,
    memoryUsed: Math.random() * 15 + 2,
  };
} catch (err: any) {
  result.value = {
    message: `Python 错误：${err.message}`,
    executionTime: 0,
    memoryUsed: 0,
  };
} 
    } else if (language.value === 'c') {
      try {
        const output = await runCCodeWithWasm(code.value);
        result.value = {
          message: output || '无输出',
          executionTime: Math.random() * 300 + 50,
          memoryUsed: Math.random() * 20 + 5,
        };
      } catch (err: any) {
        result.value = {
          message: `C语言运行错误：${err.message}`,
          executionTime: 0,
          memoryUsed: 0,
        };
      }
    } else {
      result.value = {
        message: `${language.value} 暂不支持前端运行`,
        executionTime: 0,
        memoryUsed: 0,
      };
    }
  } catch (error: any) {
    result.value = {
      message: `运行出错：${error.message}`,
      executionTime: 0,
      memoryUsed: 0,
    };
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.custom-select .el-select-dropdown__item {
  @apply hover:bg-blue-50 transition-colors duration-200;
}
</style>