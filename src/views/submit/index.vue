<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-card" shadow="never">
      <el-form
        :model="queryParams"
        ref="queryFormRef"
        :inline="true"
        size="default"
      >
        <el-form-item label="题目ID" prop="questionId">
          <el-input
            v-model="queryParams.questionId"
            placeholder="请输入题目ID"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="评判状态" prop="judgeStatus" class="w-40">
          <el-select
            v-model="queryParams.judgeStatus"
            placeholder="请选择评判状态"
            clearable
          >
            <el-option
              v-for="item in judgeStatusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="编程语言" prop="language" class="w-40">
          <el-select
            v-model="queryParams.language"
            placeholder="请选择编程语言"
            clearable
          >
            <el-option
              v-for="item in languageOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <el-icon><Search /></el-icon>搜索
          </el-button>
          <el-button @click="resetQuery">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 提交列表 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="header-title">提交记录</span>
          <!-- <div class="header-options">
            <el-tooltip content="刷新数据" placement="top">
              <el-button :icon="Refresh" circle @click="getSubmitList" />
            </el-tooltip>
          </div> -->
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="submitList"
        stripe
        border
        :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
      >
        <el-table-column prop="id" label="序号" width="80" />
        <!-- <el-table-column prop="problemId" label="题目ID" width="80" /> -->
        <el-table-column
          prop="title"
          label="题目标题"
          min-width="150"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <router-link
              :to="`/problems/${row.questionId}/description`"
              class="problem-link"
            >
              {{ row.title }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column
          prop="judgeStatus"
          label="评判状态"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <judge-status-tag :status="row.judgeStatus" />
          </template>
        </el-table-column>
        <el-table-column
          prop="language"
          label="编程语言"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <language-tag :language="row.language" />
          </template>
        </el-table-column>
        <el-table-column
          prop="executionTime"
          label="执行时间"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <span v-if="row.executionTime !== null"
              >{{ row.executionTime }} ms</span
            >
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="memoryUsed"
          label="内存消耗"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <span v-if="row.memoryUsed !== null">{{ row.memoryUsed }} KB</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="submitTime"
          label="提交时间"
          width="180"
          align="center"
        >
          <template #default="{ row }">
            {{ parseTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              size="small"
              @click="viewSubmitDetail(row)"
            >
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页器 -->
      <div class="relative">
        <pagination
          v-if="total > 0"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getSubmitList"
          layout="total, sizes, prev, pager, next"
        />
      </div>
    </el-card>

    <!-- 提交详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="提交详情"
      width="60%"
      destroy-on-close
      append-to-body
    >
      <div v-if="currentSubmit" class="submit-detail">
        <el-descriptions border>
          <el-descriptions-item label="提交ID">{{
            currentSubmit.id
          }}</el-descriptions-item>
          <el-descriptions-item label="题目ID">{{
            currentSubmit.questionId
          }}</el-descriptions-item>
          <el-descriptions-item label="题目标题">{{
            currentSubmit.title
          }}</el-descriptions-item>
          <el-descriptions-item label="评判状态">
            <judge-status-tag :status="currentSubmit.judgeStatus" />
          </el-descriptions-item>
          <el-descriptions-item label="编程语言">
            <language-tag :language="currentSubmit.language" />
          </el-descriptions-item>
          <el-descriptions-item label="执行时间">
            {{
              currentSubmit.executionTime !== null
                ? `${currentSubmit.executionTime} ms`
                : "-"
            }}
          </el-descriptions-item>
          <el-descriptions-item label="内存消耗">
            {{
              currentSubmit.memoryUsed !== null
                ? `${currentSubmit.memoryUsed} KB`
                : "-"
            }}
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">
            {{ parseTime(currentSubmit.createdAt) }}
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="currentSubmit.errorMessage" class="error-message">
          <h4>错误信息：</h4>
          <pre>{{ currentSubmit.errorMessage }}</pre>
        </div>

        <div class="code-section">
          <h4>提交的代码：</h4>
          <code-viewer
            :code="currentSubmit.answerCode"
            :language="currentSubmit.language"
          />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { listAnswers } from "@/api/funcode/answer";
import { parseTime } from "@/utils/ruoyi";
import type { SubmitRecord, QueryParams, JudgeStatus } from "@/types";

// 查询参数
const queryParams = reactive<QueryParams>({
  pageNum: 1,
  pageSize: 10,
  questionId: "",
  judgeStatus: "",
  language: "",
});

// 表格数据
const loading = ref(false);
const submitList = ref<SubmitRecord[]>([]);
const total = ref(0);
const queryFormRef = ref<FormInstance>();

// 对话框数据
const dialogVisible = ref(false);
const currentSubmit = ref<SubmitRecord | null>(null);

// 状态选项
const judgeStatusOptions = [
  { label: "评判通过", value: "ACCEPTED" },
  { label: "答案错误", value: "WRONG_ANSWER" },
  { label: "编译错误", value: "COMPILATION_ERROR" },
  { label: "运行时错误", value: "RUNTIME_ERROR" },
  { label: "时间超限", value: "TIME_LIMIT_EXCEEDED" },
  { label: "内存超限", value: "MEMORY_LIMIT_EXCEEDED" },
];

// 语言选项
const languageOptions = [
  { label: "Java", value: "java" },
  { label: "Python", value: "python" },
  { label: "C", value: "c" },
];

// 生命周期钩子
onMounted(() => {
  getSubmitList();
});

// 获取提交列表
const getSubmitList = async () => {
  loading.value = true;
  try {
    const response = await listAnswers(queryParams);
    submitList.value = response.rows || [];
    total.value = response.total || 0;
  } catch (error) {
    console.error("获取提交记录失败", error);
    ElMessage.error("获取提交记录失败");
  } finally {
    loading.value = false;
  }
};

// 搜索按钮操作
const handleQuery = () => {
  queryParams.pageNum = 1;
  getSubmitList();
};

// 重置按钮操作
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

// 查看提交详情
const viewSubmitDetail = (row: SubmitRecord) => {
  currentSubmit.value = row;
  dialogVisible.value = true;
};
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 10px;
}

.table-card {
  position: relative;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-weight: 600;
  font-size: 16px;
}

.problem-link {
  color: #409eff;
  text-decoration: none;
}

.problem-link:hover {
  color: #66b1ff;
  text-decoration: underline;
}

.submit-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.error-message {
  background-color: #fff1f0;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #ffccc7;
}

.error-message h4 {
  color: #f56c6c;
  margin-top: 0;
  margin-bottom: 8px;
}

.error-message pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: monospace;
  color: #e74c3c;
}

.code-section {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.code-section h4 {
  margin: 0;
  padding: 12px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}
</style>
