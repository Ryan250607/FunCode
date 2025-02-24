<template>
  <div class="grading-page">
    <!-- 阅卷内容 -->
    <div class="grading-content">
      <!-- 题目描述 -->
      <div class="question-header">
        <h1>{{ currentAnswer.title }}</h1>
        <p>{{ currentAnswer.description }}</p>
      </div>

      <!-- 学生代码 -->
      <div class="code-section">
        <h2>学生代码</h2>
        <pre><code>{{ currentAnswer.answerCode }}</code></pre>
      </div>

      <!-- 评分和评语 -->
      <div class="grading-form">
        <h2>评分和评语</h2>
        <el-form :model="gradingForm" label-width="80px">
          <el-form-item label="得分">
            <el-input-number
              v-model="gradingForm.score"
              :min="0"
              :max="100"
              :precision="1"
              :step="0.5"
            />
          </el-form-item>
          <el-form-item label="评语">
            <el-input
              v-model="gradingForm.comments"
              type="textarea"
              :rows="4"
              placeholder="请输入评语"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitGrading">提交</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  listRecords,
  addRecords,
  updateRecords,
  getStudentAnswer,
} from "@/api/funcode/grade";

// 类型定义
interface Answer {
  title?: string;
  description?: string;
  answerId?: string;
  answerCode?: string;
  courseId?: string;
  studentId?: string;
}

interface GradingForm {
  id?: number;
  score?: number;
  comments?: string;
  teacherId?: number;
  answerId?: string;
}
const router = useRouter();
const route = useRoute();
// 响应式数据
const currentAnswer = ref<Answer>({});
const gradingForm = ref<GradingForm>({
  score: 0,
  comments: "",
});

// 方法
const getList = async () => {
  try {
    const { answerId } = route.query;

    const res = await listRecords({
      answerId,
    });
    // 调用后端接口获取学生答案详情
    const studentAnswer = await getStudentAnswer(answerId);
    // 将接口返回结果赋值给 currentAnswer.value
    currentAnswer.value = { ...studentAnswer };

    if (res.rows?.length > 0) {
      gradingForm.value = { ...res.rows[0] };
    }
  } catch (error) {
    console.error("获取评分记录失败:", error);
  }
};

const submitGrading = async () => {
  try {
    if (gradingForm.value.id != null) {
      await updateRecords({ ...gradingForm.value });
      ElMessage.success("评分提交成功！");
    } else {
      await addRecords({
        teacherId: store.state.user.id,
        answerId: currentAnswer.value.answerId,
        score: gradingForm.value.score,
        comments: gradingForm.value.comments,
      });
      ElMessage.success("评分提交成功！");
    }
    router.push({ path: "/grading" });
  } catch (error) {
    ElMessage.error("评分提交失败，请重试！");
  }
};

// 初始化
onMounted(() => {
  getList();
});
</script>

<style scoped>
.grading-page {
  display: flex;
  height: 100vh;
}

.grading-content {
  flex: 1;
  padding: 20px;
  max-width: 70vw;
  margin: 0 auto;
}

.question-header {
  margin-bottom: 20px;
}

.question-header h1 {
  font-size: 24px;
  margin-bottom: 10px;
}

.question-header p {
  font-size: 16px;
  color: #666;
}

.code-section {
  margin-bottom: 20px;
}

.code-section h2 {
  font-size: 20px;
  margin-bottom: 10px;
}

.code-section pre {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-family: monospace;
}

.grading-form {
  margin-top: 20px;
}

.grading-form h2 {
  font-size: 20px;
  margin-bottom: 10px;
}
</style>
