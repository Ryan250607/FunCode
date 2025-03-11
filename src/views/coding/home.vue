<template>
  <div class="coding-container">
    <!-- 顶部导航栏 -->
    <div class="top-navigation">
      <div>
        <el-button 
          type="primary" 
          :icon="Back" 
          plain 
          @click="handleBack"
        >
          返回
        </el-button>
      </div>
      <div class="nav-right"><el-button
        type="primary"
        :loading="isSubmitting"
        @click="handleSubmit"
        :icon="UploadFilled"
      >
        提交代码
      </el-button></div>
    </div>
    
    <el-row :gutter="16" class="content-area">
      <!-- 左侧题目描述和测试用例 -->
      <el-col :span="10" class="full-height">
        <el-card class="problem-card full-height" shadow="never">
          <el-tabs v-model="activeTab" class="description-tabs">
            <el-tab-pane label="题目描述" name="description">
              <div class="problem-header">
                <h2 class="problem-title">{{ problem.title }}</h2>
              </div>
              <div class="problem-content" v-html="problem.description"></div>
            </el-tab-pane>

            <el-tab-pane label="题解" name="solution">
              <div class="solution-container">
                <!-- 题解内容将在这里显示 -->
                <div v-if="problem.solution" v-html="problem.solution"></div>
                <div v-else class="no-solution">暂无题解</div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="测试用例" name="examples">
              <div class="examples-container">
                <div v-for="(example, index) in problem.examples" :key="index" class="example-item">
                  <h4>示例 {{ index + 1 }}</h4>
                  <div class="example-content">
                    <div class="example-input">
                      <strong>输入：</strong>
                      <pre>{{ example.input }}</pre>
                    </div>
                    <div class="example-output">
                      <strong>输出：</strong>
                      <pre>{{ example.output }}</pre>
                    </div>
                    <div v-if="example.explanation" class="example-explanation">
                      <strong>解释：</strong>
                      <p>{{ example.explanation }}</p>
                    </div>
                  </div>
                </div>
                <el-empty v-if="!problem.examples?.length" description="暂无测试用例" />
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>

      <!-- 右侧代码编辑区和结果显示 -->
      <el-col :span="14" class="full-height">
        <div class="editor-container">
          <div class="editor-toolbar">
            <el-select
              v-model="selectedLanguage"
              placeholder="选择编程语言"
              size="default"
              class="language-select"
            >
              <el-option
                v-for="lang in supportedLanguages"
                :key="lang.value"
                :label="lang.label"
                :value="lang.value"
              />
            </el-select>

            
          </div>

          <div class="code-editor-wrapper">
            <CodeEditor
              v-model="code"
              :language="selectedLanguage"
              :placeholder="'请编写您的代码...'"
            />
          </div>

          <div class="result-container">
            <ResultDisplay
              :result="submissionResult"
              :status="submissionStatus"
              :loading="isSubmitting"
            />
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { UploadFilled, Back, View, DataAnalysis } from "@element-plus/icons-vue";
import { getQuestions } from "@/api/funcode/questions";
import { run } from "@/api/funcode/execution";
import type {
  Problem,
  Example,
  SubmissionResult,
  SubmissionStatus,
} from "@/types";
import useUserStore from "@/store/modules/user";

// 路由相关
const route = useRoute();
const router = useRouter();
const problemId = computed(() => route.params.id as string);

// 状态管理
const userStore = useUserStore();

// 基础数据
const activeTab = ref("description");
const isSubmitting = ref(false);
const selectedLanguage = ref("java");
const code = ref("");
const problem = ref<Problem>({
  id: "",
  title: "加载中...",
  description: "",
  difficulty: "medium",
  examples: [],
  hints: [],
  templates: {},
});
const submissionResult = ref<SubmissionResult | null>(null);
const submissionStatus = ref<SubmissionStatus>("idle");

// 支持的编程语言
const supportedLanguages = [
  { label: "Java", value: "java" },
  { label: "Python", value: "python" },
  { label: "C", value: "c" },
];

// 初始化加载题目详情
onMounted(async () => {
  if (problemId.value) {
    await loadProblemData();
  }
});

// 加载题目数据
const loadProblemData = async () => {
  try {
    const { data } = await getQuestions(problemId.value);
    problem.value = data;

    // 设置初始代码
    if (problem.value.templates && problem.value.templates[selectedLanguage.value]) {
      code.value = problem.value.templates[selectedLanguage.value];
    } else if (problem.value.initialCode) {
      code.value = problem.value.initialCode;
    } else {
      setDefaultCodeTemplate();
    }
  } catch (error) {
    console.error("获取题目详情失败:", error);
  }
};

// 监听语言变化，加载对应模板
watch(selectedLanguage, (newLang) => {
  if (problem.value.templates && problem.value.templates[newLang]) {
    code.value = problem.value.templates[newLang];
  } else {
    setDefaultCodeTemplate();
  }
});

// 设置默认代码模板
const setDefaultCodeTemplate = () => {
  const lang = selectedLanguage.value;
  
  if (lang === "java") {
    code.value = `public class Solution {\n    public static void main(String[] args) {\n        // 您的代码\n    }\n}`;
  } else if (lang === "python") {
    code.value = `def solution():\n    # 您的代码\n    pass\n\nif __name__ == "__main__":\n    solution()`;
  } else if (lang === "c") {
    code.value = `#include <stdio.h>\n\nint main() {\n    // 您的代码\n    return 0;\n}`;
  }
};

// 提交代码
const handleSubmit = async () => {
  if (!code.value.trim()) {
    return;
  }

  isSubmitting.value = true;
  submissionStatus.value = "submitting";
  submissionResult.value = null;

  try {
    const result = await run({
      questionId: problemId.value,
      studentId: userStore.userId,
      language: selectedLanguage.value,
      code: code.value,
    });

    submissionResult.value = result;
    submissionStatus.value = result.status;
    router.push(`/submit`);
  } catch (error) {
    console.error("提交代码失败:", error);
    submissionStatus.value = "error";
    submissionResult.value = {
      status: "error",
      message: "提交失败，请稍后再试",
      executionTime: 0,
      memoryUsage: 0,
      testCaseResults: [],
    };
  } finally {
    isSubmitting.value = false;
  }
};

// 返回上一页
const handleBack = () => {
  router.back();
};

// 查看题解
const handleViewSolution = () => {
  activeTab.value = "solution";
};

// 查看提交记录
const handleViewSubmissions = () => {
  router.push(`/submit?problemId=${problemId.value}`);
};
</script>

<style scoped>
.coding-container {
  height: calc(100vh - 20px);
  padding: 10px;
  display: flex;
  flex-direction: column;
}

.top-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 16px;
}



.nav-center {
  display: flex;
  justify-content: center;
}

.content-area {
  flex: 1;
  min-height: 0;
}

.full-height {
  height: 100%;
}

.problem-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.problem-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.problem-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.description-tabs {
  flex: 1;
  overflow: hidden;
  display: flex;
}

.problem-content {
  overflow-y: auto;
  padding-right: 10px;
  height: 100%;
}

.examples-container {
  margin-top: 12px;
}

.example-item {
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #f5f7fa;
}

.example-content {
  margin-top: 8px;
}

.example-input,
.example-output,
.example-explanation {
  margin-bottom: 10px;
}

.example-input pre,
.example-output pre {
  background-color: #ffffff;
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
  margin-top: 4px;
}

.hint-item {
  margin-bottom: 12px;
}

.editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.language-select {
  width: 120px;
}

.code-editor-wrapper {
  flex: 1;
  overflow: hidden;
  border-left: 1px solid #e4e7ed;
  border-right: 1px solid #e4e7ed;
}

.result-container {
  height: 200px;
  border: 1px solid #e4e7ed;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  overflow: hidden;
}

.no-solution {
  padding: 20px;
  text-align: center;
  color: #909399;
}

:deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
}

:deep(.el-tab-pane) {
  height: 100%;
  overflow-y: auto;
}
</style>