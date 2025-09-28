<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryFormRef"
      size="default"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="题目标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入题目标题"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :icon="Search" @click="handleQuery"
          >搜索</el-button
        >
        <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain :icon="Plus" @click="handleAdd"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          :icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          :icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain :icon="Download" @click="handleExport"
          >导出</el-button
        >
      </el-col>
      <right-toolbar
        v-model:show-search="showSearch"
        @query-table="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-loading="loading"
      :data="questionsList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="id" />
      <el-table-column label="题目标题" align="center" prop="title" />
      <el-table-column label="题目描述" align="center" prop="description" />
      <el-table-column label="运行时间限制" align="center" prop="timeLimit" />

      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template #default="{ row }">
          <el-button type="primary" link :icon="Edit" @click="handleUpdate(row)"
            >修改</el-button
          >
          <el-button
            type="primary"
            link
            :icon="Delete"
            @click="handleDelete(row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-if="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改编程问题对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <!-- <el-form-item label="课程id" prop="courseId">
          <el-input v-model="form.courseId" placeholder="请输入课程id" />
        </el-form-item> -->
        <el-form-item label="题目标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入题目标题" />
        </el-form-item>
        <el-form-item label="题目描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            placeholder="请输入内容"
          />
        </el-form-item>
        <el-form-item label="初始代码" prop="initialCode">
          <el-input
            v-model="form.initialCode"
            type="textarea"
            placeholder="请输入内容"
          />
        </el-form-item>
        <el-form-item label="参考答案" prop="answerCode">
          <el-input
            v-model="form.answerCode"
            type="textarea"
            placeholder="请输入内容"
          />
        </el-form-item>
        <el-form-item label="时间限制" prop="timeLimit">
          <el-input v-model="form.timeLimit" placeholder="时间限制" />
        </el-form-item>
        <el-form-item label="难度" prop="difficulty">
          <el-select v-model="form.difficulty" placeholder="Select" style="width: 240px">
            <el-option
              v-for="item in difficultyOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            /> 
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick } from "vue";
import { useRoute } from "vue-router";
import { ElMessage, ElMessageBox, FormInstance } from "element-plus";
import {
  Search,
  Refresh,
  Plus,
  Edit,
  Delete,
  Download,
} from "@element-plus/icons-vue";
import {
  listQuestions,
  getQuestions,
  delQuestions,
  addQuestions,
  updateQuestions,
} from "@/api/funcode/questions";
// Define the Question interface

import { useDownload } from "@/hooks/useDownload";

// 组件命名
defineOptions({
  name: "Questions",
});
interface Question {
  id?: number | string;
  courseId: string;
  title: string;
  description: string;
  initialCode: string;
  answerCode: string;
  timeLimit: string | number;
  difficulty: string;
}

// Define the QuestionQuery interface for search parameters
interface QuestionQuery {
  pageNum: number;
  pageSize: number;
  title?: string;
  courseId?: string;
}
// 路由参数
const route = useRoute();

// DOM引用
const queryFormRef = ref<FormInstance>();
const formRef = ref<FormInstance>();

// 基础数据
const loading = ref(true);
const total = ref(0);
const showSearch = ref(true);
const open = ref(false);
const title = ref("");
const questionsList = ref<Question[]>([]);

// 多选相关
const ids = ref<(string | number)[]>([]);
const single = computed(() => ids.value.length !== 1);
const multiple = computed(() => ids.value.length === 0);

// 查询参数
const queryParams = reactive<QuestionQuery>({
  pageNum: 1,
  pageSize: 10,
  title: "",
  courseId: route.query.courseId as string,
});

// 表单数据
const form = reactive<Question>({
  id: undefined,
  courseId: "",
  title: "",
  description: "",
  initialCode: "",
  answerCode: "",
  timeLimit: "",
  difficulty: "easy", // 默认难度
});

const difficultyOptions = [
  { value: "easy", label: "简单" },
  { value: "medium", label: "中等" },
  { value: "hard", label: "困难" },
];
// 验证规则
const rules = reactive({
  courseId: [{ required: true, message: "课程id不能为空", trigger: "blur" }],
  title: [{ required: true, message: "题目标题不能为空", trigger: "blur" }],
  description: [
    { required: true, message: "题目描述不能为空", trigger: "blur" },
  ],
  initialCode: [
    { required: true, message: "初始代码不能为空", trigger: "blur" },
  ],
  answerCode: [
    { required: true, message: "参考答案不能为空", trigger: "blur" },
  ],
  timeLimit: [
    { required: true, message: "时间限制(秒)不能为空", trigger: "blur" },
  ],
});

/** 初始化 */
onMounted(() => {
  getList();
});

/** 查询编程问题列表 */
const getList = async () => {
  loading.value = true;
  try {
    const res = await listQuestions(queryParams);
    questionsList.value = res.rows;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
};

/** 表单重置 */
const reset = () => {
  Object.assign(form, {
    id: undefined,
    courseId: "",
    title: "",
    description: "",
    initialCode: "",
    answerCode: "",
    timeLimit: "",
  });
  nextTick(() => {
    formRef.value?.resetFields();
  });
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: Question[]) => {
  ids.value = selection.map((item) => item.id as number | string);
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  open.value = true;
  title.value = "添加编程问题";
};

/** 修改按钮操作 */
const handleUpdate = async (row?: Question) => {
  reset();
  const id = row?.id || ids.value[0];
  try {
    const res = await getQuestions(id);
    Object.assign(form, res.data);
    open.value = true;
    title.value = "修改编程问题";
  } catch (error) {
    console.error("获取问题详情失败", error);
  }
};

/** 提交表单 */
const submitForm = async () => {
  try {
    await formRef.value?.validate();

    if (form.id) {
      await updateQuestions(form);
      ElMessage.success("修改成功");
    } else {
      await addQuestions(form);
      ElMessage.success("新增成功");
    }

    open.value = false;
    getList();
  } catch (error) {
    console.error("表单验证失败", error);
  }
};

/** 取消按钮 */
const cancel = () => {
  open.value = false;
  reset();
};

/** 删除按钮操作 */
const handleDelete = async (row?: Question) => {
  const deleteIds = row?.id || ids.value;

  try {
    await ElMessageBox.confirm(
      `是否确认删除编程问题编号为"${deleteIds}"的数据项？`
    );
    await delQuestions(deleteIds);
    getList();
    ElMessage.success("删除成功");
  } catch (error) {
    console.error("删除操作被取消或失败", error);
  }
};

/** 导出按钮操作 */
const handleExport = () => {
  const { download } = useDownload();
  download(
    "system/questions/export",
    {
      ...queryParams,
    },
    `questions_${new Date().getTime()}.xlsx`
  );
};

// 导出相关方法供外部调用
defineExpose({
  getList,
  handleQuery,
  resetQuery,
  handleAdd,
  handleUpdate,
  handleDelete,
  handleExport,
});
</script>

<style scoped>
.mb8 {
  margin-bottom: 8px;
}
</style>
