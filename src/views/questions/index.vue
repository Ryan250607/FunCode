<template>
  <div class="question-container">
    <!-- 顶部过滤器区域 -->
    <QuestionFilters
      v-model:filters="filters"
      @filter-change="handleFilterChange"
    />

    <!-- 题目列表区域 -->
    <el-card class="question-list-card" shadow="never">
      <template #header>
        <div class="list-header">
          <h2 class="title">题目列表</h2>
          <el-space>
            <el-switch
              v-model="onlyShowUnsolved"
              active-text="仅显示未解决"
              @change="handleFilterChange"
            />
            <el-select
              v-model="sortBy"
              placeholder="排序方式"
              @change="handleFilterChange"
            >
              <el-option label="默认排序" value="default" />
              <el-option label="难度升序" value="difficultyAsc" />
              <el-option label="难度降序" value="difficultyDesc" />
              <el-option label="最新添加" value="newest" />
            </el-select>
          </el-space>
        </div>
      </template>

      <el-table
        v-loading="loading"
        :data="questionList"
        style="width: 100%"
        row-key="id"
        :header-cell-style="{ background: '#f5f7fa' }"
        @row-click="navigateToQuestion"
      >
        <el-table-column label="状态" width="60" align="center">
          <template #default="{ row }">
            <!-- <QuestionStatusTag :status="row.status" /> -->
          </template>
        </el-table-column>

        <el-table-column label="题号" prop="id" width="80" align="center" />

        <el-table-column label="标题" prop="title" min-width="280">
          <template #default="{ row }">
            <div class="question-title" @click.stop="handleStartSolving(row)">
              {{ row.title }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="难度" width="100" align="center">
          <template #default="{ row }">
            <!-- <DifficultyTag :level="row.difficulty" /> -->
          </template>
        </el-table-column>

        <el-table-column
          label="通过率"
          prop="acceptRate"
          width="100"
          align="center"
        >
          <template #default="{ row }"> {{ row.acceptRate }}% </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalQuestions"
          @size-change="handlePageSizeChange"
          @current-change="fetchQuestionList"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
// import { useQuestionStore } from '@/stores/question';
// import QuestionStatusTag from './components/QuestionStatusTag.vue';
// import DifficultyTag from './components/DifficultyTag.vue';
import { listQuestions } from "@/api/funcode/questions";
import type { Question } from "@/types";

// 路由
const router = useRouter();
// const questionStore = useQuestionStore();

// 状态数据
const loading = ref(false);
const questionList = ref<Question[]>([]);
const totalQuestions = ref(0);
const currentPage = ref(1);
const pageSize = ref(20);
const onlyShowUnsolved = ref(false);
const sortBy = ref("default");

// 过滤器状态
const filters = reactive<QuestionFilter>({
  difficulty: [],
  tags: [],
  searchKeyword: "",
});

// 生命周期钩子
onMounted(() => {
  fetchQuestionList();
});

// 获取题目列表
const fetchQuestionList = async () => {
  loading.value = true;
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value,
      onlyUnsolved: onlyShowUnsolved.value,
      sortBy: sortBy.value,
      ...filters,
    };

    const { rows, total } = await listQuestions(params);
    questionList.value = rows;
    totalQuestions.value = total;
  } catch (error) {
    console.error("获取题目列表失败:", error);
  } finally {
    loading.value = false;
  }
};

// 处理筛选条件变化
const handleFilterChange = () => {
  currentPage.value = 1; // 重置到第一页
  fetchQuestionList();
};

// 处理页大小变化
const handlePageSizeChange = (size: number) => {
  pageSize.value = size;
  fetchQuestionList();
};

// 导航到题目详情页
const navigateToQuestion = (row: Question) => {
  router.push(`/problems/${row.id}/description`);
};

// 开始解答
const handleStartSolving = (question: Question) => {
  // 保存当前题目到状态管理
  //   questionStore.setCurrentQuestion(question);
  router.push(`/problems/${question.id}/description`);
};

// 查看题解
const handleViewSolution = (question: Question) => {
  router.push(`/questions/solution/${question.id}`);
};
</script>

<style scoped>
.question-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.question-list-card {
  margin-top: 16px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.question-title {
  font-weight: 500;
  color: #1890ff;
  cursor: pointer;
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
