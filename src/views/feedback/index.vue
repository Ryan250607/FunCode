<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
      label-width="68px"
    >
      <el-form-item label="用户" prop="userId">
        <el-select
          v-model="queryParams.userId"
          placeholder="请选择用户"
          clearable
        >
          <el-option
            v-for="user in userDict"
            :key="user.value"
            :label="user.label"
            :value="user.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="课程" prop="courseId">
        <el-select
          v-model="queryParams.courseId"
          placeholder="请选择课程"
          clearable
        >
          <el-option
            v-for="dict in courseDict"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="反馈类型" prop="feedbackType">
        <el-select
          v-model="queryParams.feedbackType"
          placeholder="请选择反馈类型"
          clearable
        >
          <el-option
            v-for="dict in feedback_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="反馈状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择反馈状态"
          clearable
        >
          <el-option
            v-for="dict in course_feedback"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="反馈时间" prop="createdAt">
        <el-date-picker
          v-model="queryParams.createdAt"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择反馈时间"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          size="mini"
          :disabled="single"
          @click="handleUpdate"
          >修改</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          size="mini"
          :disabled="multiple"
          @click="handleDelete"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          size="mini"
          @click="handleExport"
          >导出</el-button
        >
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table
      v-loading="loading"
      :data="feedbackList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" align="center" width="55" prop="id" />
      <el-table-column
        label="用户"
        align="center"
        prop="userId"
        :formatter="formatUserName"
      />
      <el-table-column
        label="课程"
        align="center"
        prop="courseId"
        :formatter="formatCourseName"
      />
      <el-table-column label="课程评分" align="center" prop="rating" />
      <el-table-column
        label="反馈内容"
        align="center"
        prop="content"
        show-overflow-tooltip
      />
      <el-table-column label="反馈类型" align="center" prop="feedbackType">
        <template #default="scope">
          <dict-tag :options="feedback_type" :value="scope.row.feedbackType" />
        </template>
      </el-table-column>
      <el-table-column label="反馈状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="course_feedback" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="管理员回复" align="center" prop="adminReply" />
      <el-table-column
        label="反馈时间"
        align="center"
        prop="createdAt"
        width="180"
      >
        <template #default="scope">
          <span>{{ parseTime(scope.row.createdAt, "{y}-{m}-{d}") }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="140"
        class-name="small-padding fixed-width"
      >
        <template #default="scope">
          <el-button
            type="text"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            >回复</el-button
          >
          <el-button
            type="text"
            icon="Delete"
            @click="handleDelete(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="getList"
    />

    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="反馈类型" prop="feedbackType">
          <el-select
            v-model="form.feedbackType"
            placeholder="请选择反馈类型"
            disabled
          >
            <el-option
              v-for="dict in feedback_type"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="反馈内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            placeholder="请输入内容"
            disabled
          />
        </el-form-item>
        <el-form-item label="附件">
            <editor v-model="form.attachment" :min-height="192" />
        </el-form-item>
        <el-form-item label="回复内容" prop="adminReply">
          <el-input v-model="form.adminReply" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确定</el-button>
          <el-button @click="cancel">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  getCurrentInstance,
  ComponentInternalInstance,
} from "vue";
import { ElMessageBox, ElMessage, FormInstance } from "element-plus";
import {
  listFeedback,
  getFeedback,
  delFeedback,
  updateFeedback,
} from "@/api/funcode/feedback";
import { listCourses } from "@/api/funcode/courses";
import { listUser } from "@/api/system/user";
import { parseTime } from "@/utils/ruoyi";
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const { feedback_type, course_feedback } = proxy!.useDict(
  "feedback_type",
  "course_feedback"
);
// 类型定义
interface Feedback {
  id?: number;
  userId?: number;
  courseId?: number;
  rating?: number;
  content?: string;
  attachment?: string;
  feedbackType?: number;
  status?: number;
  adminReply?: string;
  createdAt?: string;
}

interface QueryParams {
  pageNum: number;
  pageSize: number;
  userId?: number | null;
  courseId?: number | null;
  feedbackType?: number | null;
  status?: number | null;
  createdAt?: string | null;
}

interface DictItem {
  value: number | string;
  label: string;
}

// 响应式数据
const loading = ref(true);
const ids = ref<number[]>([]);
const single = ref(true);
const multiple = ref(true);
const showSearch = ref(true);
const total = ref(0);
const feedbackList = ref<Feedback[]>([]);
const title = ref("");
const open = ref(false);
const queryParams = ref<QueryParams>({
  pageNum: 1,
  pageSize: 10,
  userId: null,
  courseId: null,
  feedbackType: null,
  status: null,
  createdAt: null,
});
const form = ref<Feedback>({});
const courseList = ref<any[]>([]);
const userList = ref<any[]>([]);
const formRef = ref<FormInstance | null>(null);

// 计算属性
const courseDict = computed(() =>
  courseList.value.map((course) => ({
    value: course.id,
    label: course.title,
  }))
);

const userDict = computed(() =>
  userList.value.map((user) => ({
    value: user.userId,
    label: user.userName,
  }))
);

// 表单校验规则
const rules = ref({
  adminReply: [{ required: true, message: "回复不能为空", trigger: "blur" }],
});

// 方法
const formatCourseName = (row: Feedback) => {
  const course = courseList.value.find((course) => course.id === row.courseId);
  return course ? course.title : "未选择课程";
};

const formatUserName = (row: Feedback) => {
  const user = userList.value.find((user) => user.userId === row.userId);
  return user ? user.userName : "";
};

const getList = async () => {
  try {
    loading.value = true;
    const [feedbackRes, courseRes, userRes] = await Promise.all([
      listFeedback(queryParams.value),
      listCourses(),
      listUser(),
    ]);
    feedbackList.value = feedbackRes.rows;
    total.value = feedbackRes.total;
    courseList.value = courseRes.rows;
    userList.value = userRes.rows;
  } catch (error) {
    ElMessage.error("数据加载失败");
  } finally {
    loading.value = false;
  }
};

const cancel = () => {
  open.value = false;
  reset();
};

const reset = () => {
  form.value = {
    id: undefined,
    userId: undefined,
    courseId: undefined,
    rating: undefined,
    content: undefined,
    attachment: '', // 默认值为空字符串
    feedbackType: undefined,
    status: undefined,
    adminReply: undefined,
    createdAt: undefined,
  };
  formRef.value?.resetFields();
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    userId: null,
    courseId: null,
    feedbackType: null,
    status: null,
    createdAt: null,
  };
  handleQuery();
};

const handleSelectionChange = (selection: Feedback[]) => {
  ids.value = selection.map((item) => item.id!);
  single.value = selection.length !== 1;
  multiple.value = selection.length === 0;
};

const handleUpdate = async (row?: Feedback) => {
  reset();
  
  const id = row?.id || ids.value[0];
  try {

    const response = await getFeedback(id);
    form.value = response.data;
    open.value = true;
    title.value = "修改课程反馈";
  } catch (error) {
    ElMessage.error("获取反馈详情失败");
  }
};

const submitForm = async () => {
  try {
    await formRef.value?.validate();
    if (form.value.id) {
      await updateFeedback(form.value);
      ElMessage.success("修改成功");
    }
    open.value = false;
    getList();
  } catch (error) {
    ElMessage.error("提交失败");
  }
};

const handleDelete = async (row?: Feedback) => {
  const deleteIds = row?.id ? [row.id] : ids.value;
  try {
    await ElMessageBox.confirm(
      `是否确认删除课程反馈编号为"${deleteIds}"的数据项？`,
      "警告",
      {
        type: "warning",
      }
    );
    await delFeedback(deleteIds);
    ElMessage.success("删除成功");
    getList();
  } catch (error) {
    if (error !== "cancel") ElMessage.error("删除失败");
  }
};

const handleExport = () => {
  // 注意：Vite环境下需要调整下载逻辑
  // 这里假设使用fetch API实现文件下载
  const url = `/system/feedback/export?${new URLSearchParams(
    queryParams.value as any
  ).toString()}`;
  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `feedback_${new Date().getTime()}.xlsx`;
      link.click();
    });
};

// 初始化
onMounted(() => {
  getList();
});
</script>
