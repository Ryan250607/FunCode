<template>
    <div class="leetcode-code-container">
        <!-- 顶部工具栏 -->
        <div class="code-toolbar">
            <el-select v-model="language" placeholder="选择语言" size="small" style="width: 120px">
                <el-option
                    v-for="lang in languages"
                    :key="lang.value"
                    :label="lang.label"
                    :value="lang.value"
                />
            </el-select>

            <div class="toolbar-right">
                <el-button type="primary" size="small" @click="runCode" :loading="loading">
                    运行代码
                </el-button>
                <el-button type="success" size="small"> 提交 </el-button>
            </div>
        </div>

        <!-- 代码编辑区域 -->
        <CodeEditor ref="codeEditor" class="leetcode-code-editor" v-model="code" @run="runCode" />

        <!-- 运行结果区域 -->
        <div class="result-container">
            <ResultDisplay :result="result" class="leetcode-result-display" />
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
// const codeEditorRef = ref<InstanceType<typeof CodeEditor> | null>(null);

// 运行代码
async function runCode() {
    loading.value = true;
    // if (codeEditorRef.value) {
    // }

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
.leetcode-code-container {
    height: calc(100vh - 85px); /* 减去顶部导航栏高度 */
    display: flex;
    flex-direction: column;
    background: #fff;
    color: #333;
    overflow: hidden;
}

.code-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    background: #f0f0f0;
    border-bottom: 1px solid #ddd;
}

.toolbar-right {
    display: flex;
    gap: 8px;
}

.leetcode-code-editor {
    flex: 1;
    background: #fff;
    border: 1px solid #ddd;
    min-height: 0; /* 防止flex item溢出 */
}

.result-container {
    background: #f5f5f5;
    border-top: 1px solid #ddd;
    flex: 0 0 200px; /* 固定高度 */
}

.result-header {
    padding: 8px 16px;
    font-weight: bold;
    background: #f0f0f0;
    border-bottom: 1px solid #ddd;
    color: #333;
}

.leetcode-result-display {
    padding: 16px;
    height: calc(100% - 40px); /* 减去header高度 */
    overflow: hidden;
    background: #fff;
    color: #333;
}
</style>
