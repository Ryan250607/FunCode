<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryForm"
      :inline="true"
      v-show="showSearch"
    >
      <el-form-item label="课程名称" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入课程名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item class="w-44" label="课程难度" prop="difficulty">
        <el-select
          v-model="queryParams.difficulty"
          placeholder="请选择课程难度"
          clearable
        >
          <el-option
            v-for="dict in difficult_value"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createdAt">
        <el-date-picker
          v-model="queryParams.createdAt"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择创建时间"
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
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
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
          :disabled="multiple"
          @click="handleDelete"
          >删除</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          >导出</el-button
        >
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
    </el-row>

    <el-table
      v-loading="loading"
      :data="coursesList"
      @selection-change="handleSelectionChange"
      @row-click="viewCourseDetail"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" width="55" align="center" prop="id" />
      <el-table-column
        label="课程名称"
        width="130"
        align="center"
        prop="title"
      />
      <el-table-column
        label="授课老师"
        align="center"
        prop="teacherId"
        width="80"
        :formatter="formatUserName"
      />
      <el-table-column
        label="课程描述"
        align="center"
        show-overflow-tooltip
        prop="description"
      />
      <el-table-column
        label="课程难度"
        width="80"
        align="center"
        prop="difficulty"
      >
        <template #default="scope">
          <dict-tag :options="difficult_value" :value="scope.row.difficulty" />
        </template>
      </el-table-column>
      <el-table-column
        label="课程封面"
        align="center"
        prop="coverImage"
        width="100"
      >
        <template #default="scope">
          <el-image
            :src="
              isHttp(scope.row.coverImage)
                ? scope.row.coverImage
                : baseURL + scope.row.coverImage
            "
            @click.stop
            class="w-full aspect-[4/3] object-cover"
          />
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
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
        class-name="small-padding fixed-width"
      >
        <template #default="scope">
          <el-button
            type="text"
            icon="Edit"
            @click.stop="handleUpdate(scope.row)"
            >修改</el-button
          >
          <el-button
            type="text"
            icon="Edit"
            @click.stop="goToQuestion(scope.row)"
            >题目设置</el-button
          >
          <el-button
            type="text"
            icon="Delete"
            @click.stop="handleDelete(scope.row)"
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
        <el-form-item label="课程名称" prop="title">
          <el-input v-model="form.title" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="授课老师" prop="teacherId">
          <el-select
            v-model="form.teacherId"
            placeholder="请选择授课老师"
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
        <el-form-item label="课程描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="5"
            placeholder="请输入内容"
          />
        </el-form-item>
        <el-form-item label="课程难度" prop="difficulty">
          <el-select v-model="form.difficulty" placeholder="请选择课程难度">
            <el-option
              v-for="dict in difficult_value"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="课程封面" prop="coverImage">
          <image-upload v-model="form.coverImage" />
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
import { useRouter } from "vue-router";
import {
  listCourses,
  getCourses,
  delCourses,
  addCourses,
  updateCourses,
} from "@/api/funcode/courses";
import { listUser } from "@/api/system/user";
import { parseTime } from "@/utils/ruoyi";
import { isHttp } from "@/utils/validate";

// 获取 proxy 并处理字典数据
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { difficult_value } = proxy!.useDict("difficult_value");
const baseURL = ref(import.meta.env.VITE_APP_BASE_API);
// 类型定义
interface Course {
  id?: number;
  title?: string;
  description?: string;
  difficulty?: string;
  coverImage?: string;
  createdAt?: string;
  teacherId?: number;
}

interface QueryParams {
  pageNum: number;
  pageSize: number;
  title?: string | null;
  difficulty?: string | null;
  createdAt?: string | null;
  teacherId?: number | null;
}

interface DictItem {
  value: string | number;
  label: string;
}

interface User {
  userId: number;
  userName: string;
}

// 响应式数据
const loading = ref(true);
const ids = ref<number[]>([]);
const single = ref(true);
const multiple = ref(true);
const showSearch = ref(true);
const total = ref(0);
const coursesList = ref<Course[]>([]);
const title = ref("");
const open = ref(false);
const queryParams = ref<QueryParams>({
  pageNum: 1,
  pageSize: 10,
  title: null,
  difficulty: null,
  createdAt: null,
  teacherId: null,
});
const form = ref<Course>({});
const userList = ref<User[]>([]);
const formRef = ref<FormInstance | null>(null);
const router = useRouter();

// 计算属性
const userDict = computed(() =>
  userList.value.map((user) => ({
    value: user.userId,
    label: user.userName,
  }))
);

// 表单校验规则
const rules = ref({
  title: [{ required: true, message: "课程名称不能为空", trigger: "blur" }],
  description: [
    { required: true, message: "课程描述不能为空", trigger: "blur" },
  ],
  difficulty: [
    { required: true, message: "课程难度不能为空", trigger: "change" },
  ],
  coverImage: [
    { required: true, message: "课程封面不能为空", trigger: "blur" },
  ],
  teacherId: [
    { required: true, message: "授课老师不能为空", trigger: "change" },
  ],
});

// 方法
const formatUserName = (row: Course) => {
  const user = userList.value.find((user) => user.userId === row.teacherId);
  return user ? user.userName : "";
};

const getList = async () => {
  try {
    loading.value = true;
    const [coursesRes, userRes] = await Promise.all([
      listCourses(queryParams.value),
      listUser(),
    ]);
    coursesList.value = coursesRes.rows;
    total.value = coursesRes.total;
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
    title: undefined,
    description: undefined,
    difficulty: undefined,
    coverImage: undefined,
    createdAt: undefined,
    teacherId: undefined,
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
    title: null,
    difficulty: null,
    createdAt: null,
    teacherId: null,
  };
  handleQuery();
};

const handleSelectionChange = (selection: Course[]) => {
  ids.value = selection.map((item) => item.id!);
  single.value = selection.length !== 1;
  multiple.value = selection.length === 0;
};

const handleAdd = () => {
  reset();
  open.value = true;
  title.value = "添加课程";
};

const handleUpdate = async (row?: Course) => {
  reset();
  const id = row?.id || ids.value[0];
  try {
    const response = await getCourses(id);
    form.value = response.data;
    open.value = true;
    title.value = "修改课程";
  } catch (error) {
    ElMessage.error("获取课程详情失败");
  }
};

const submitForm = async () => {
  try {
    await formRef.value?.validate();
    if (form.value.id) {
      await updateCourses(form.value);
      ElMessage.success("修改成功");
    } else {
      await addCourses(form.value);
      ElMessage.success("新增成功");
    }
    open.value = false;
    getList();
  } catch (error) {
    ElMessage.error("提交失败");
  }
};

const handleDelete = async (row?: Course) => {
  const deleteIds = row?.id ? [row.id] : ids.value;
  try {
    await ElMessageBox.confirm(
      `是否确认删除课程编号为"${deleteIds}"的数据项？`,
      "警告",
      {
        type: "warning",
      }
    );
    await delCourses(deleteIds);
    ElMessage.success("删除成功");
    getList();
  } catch (error) {
    if (error !== "cancel") ElMessage.error("删除失败");
  }
};

const handleExport = () => {
  const url = `/system/courses/export?${new URLSearchParams(
    queryParams.value as any
  ).toString()}`;
  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `courses_${new Date().getTime()}.xlsx`;
      link.click();
    });
};

const viewCourseDetail = (course: Course) => {
  router.push({
    path: "/courses/detail",
    query: { id: course.id?.toString() },
  });
};

const goToQuestion = (course: Course) => {
  router.push({
    path: "/questions",
    query: { courseId: course.id?.toString() },
  });
};

// 初始化
onMounted(() => {
  getList();
});
</script>
