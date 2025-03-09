<template>
  <div class="result-display">
    <div class="result-header">
      <span>运行结果</span>
      <el-tag
        v-if="status !== 'idle'"
        :type="statusTagType"
        size="small"
      >
        {{ statusText }}
      </el-tag>
    </div>
    
    <div class="result-content">
      <div v-if="loading" class="loading-container">
        <!-- <el-spinner :size="32" /> -->
        <span>正在评测中...</span>
      </div>
      
      <div v-else-if="status === 'idle'" class="empty-result">
        <el-icon :size="32"><Connection /></el-icon>
        <span>提交代码后查看评测结果</span>
      </div>
      
      <div v-else-if="status === 'error'" class="error-result">
        <el-icon :size="24"><CircleCloseFilled /></el-icon>
        <span>{{ result?.message || '评测系统出错，请稍后再试' }}</span>
      </div>
      
      <div v-else class="result-details">
        <!-- 执行状态信息 -->
        <div class="result-summary">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-statistic title="执行时间" :value="`${result?.executionTime || 0}`" :suffix="'ms'" />
            </el-col>
            <el-col :span="12">
              <el-statistic title="内存消耗" :value="`${result?.memoryUsed || 0}`" :suffix="'KB'" />
            </el-col>
          </el-row>
        </div>
        
        <!-- 测试用例结果 -->
        <div v-if="result?.testCaseResults && result.testCaseResults.length > 0" class="test-cases-results">
          <div class="test-cases-header">
            <span>测试用例结果</span>
          </div>
          
          <el-collapse>
            <el-collapse-item
              v-for="(testCase, index) in result.testCaseResults"
              :key="index"
              :name="index"
            >
              <template #title>
                <div class="test-case-title">
                  <span>测试用例 {{ index + 1 }}</span>
                  <el-tag
                    :type="testCase.passed ? 'success' : 'danger'"
                    size="small"
                    effect="dark"
                  >
                    {{ testCase.passed ? '通过' : '失败' }}
                  </el-tag>
                </div>
              </template>
              
              <div class="test-case-detail">
                <el-descriptions :column="1" border>
                  <el-descriptions-item label="输入">
                    <pre>{{ testCase.input }}</pre>
                  </el-descriptions-item>
                  <el-descriptions-item label="预期输出">
                    <pre>{{ testCase.expectedOutput }}</pre>
                  </el-descriptions-item>
                  <el-descriptions-item label="实际输出">
                    <pre>{{ testCase.actualOutput }}</pre>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
        
        <!-- 编译错误或运行时错误 -->
        <div v-if="result?.compileError || result?.runtimeError" class="error-details">
          <el-alert
            :title="result.compileError ? '编译错误' : '运行时错误'"
            :description="result.compileError || result.runtimeError"
            type="error"
            :closable="false"
            show-icon
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
// import { Connection, CircleCloseFilled } from '@element-plus/icons-vue';
import type { SubmissionResult, SubmissionStatus } from '@/types';

const props = defineProps<{
  result: SubmissionResult | null;
  status: SubmissionStatus;
  loading: boolean;
}>();

// 状态标签类型
const statusTagType = computed(() => {
  switch (props.status) {
    case 'ACCEPTED':
      return 'success';
    case 'wrong_answer':
    case 'runtime_error':
    case 'compile_error':
    case 'time_limit_exceeded':
    case 'memory_limit_exceeded':
      return 'danger';
    case 'submitting':
      return 'info';
    case 'error':
      return 'error';
    default:
      return 'info';
  }
});

// 状态显示文本
const statusText = computed(() => {
  switch (props.status) {
    case 'ACCEPTED':
      return '通过';
    case 'wrong_answer':
      return '答案错误';
    case 'runtime_error':
      return '运行错误';
    case 'compile_error':
      return '编译错误';
    case 'time_limit_exceeded':
      return '超时';
    case 'memory_limit_exceeded':
      return '内存超限';
    case 'submitting':
      return '评测中';
    case 'error':
      return '系统错误';
    default:
      return '未知状态';
  }
});
</script>

<style scoped>
.result-display {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  font-weight: 600;
}

.result-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.loading-container,
.empty-result,
.error-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

.loading-container span,
.empty-result span,
.error-result span {
  margin-top: 12px;
}

.result-summary {
  padding: 12px 0;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 16px;
}

.test-cases-results {
  margin-top: 16px;
}

.test-cases-header {
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 8px;
}

.test-case-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.test-case-detail pre {
  background-color: #f5f7fa;
  padding: 8px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}

.error-details {
  margin-top: 16px;
}
</style>