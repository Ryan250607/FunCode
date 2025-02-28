<template>
  <div style="padding: 50px">
    <h1>阅卷列表</h1>
    <div class="flex mb-3">
      <div class="w-40">
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
      </div>
      
      <el-button
        type="primary"
        icon="Search"
        style="margin-left: 10px"
        @click="handleQuery"
        >搜索</el-button
      >
    </div>

    <el-table :data="gradingRecords" style="width: 100%">
      <el-table-column
        prop="studentId"
        label="用户"
        align="center"
        :formatter="formatUserName"
      />
      <el-table-column prop="title" label="题目名称" align="center" />
      <el-table-column align="center" prop="createdAt" label="提交时间">
        <template #default="scope">
          {{ parseTime(scope.row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="status" label="状态">
        <template #default="scope">
          <el-tag :type="scope.row.status === '1' ? 'success' : 'info'">
            {{ scope.row.status === "1" ? "已批阅" : "未批阅" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="score" label="得分" />
      <el-table-column align="center" label="操作">
        <template #default="scope">
          <el-button type="primary" size="small" @click="viewDetail(scope.row)"
            >查看</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import useUserStore from "@/store/modules/user";
import { listAnswersDto } from "@/api/funcode/answer";
import { listUser } from "@/api/system/user";
import { listCourses } from "@/api/funcode/courses";
import { parseTime } from "@/utils/ruoyi";

// 类型定义
interface GradingRecord {
  studentId?: number;
  title?: string;
  createdAt?: string;
  status?: string;
  score?: number;
}

interface Course {
  id: number;
  title: string;
}

interface User {
  userId: number;
  userName: string;
}

interface QueryParams {
  courseId?: number;
}

// 响应式数据
const userList = ref<User[]>([]);
const gradingRecords = ref<GradingRecord[]>([]);
const courseList = ref<Course[]>([]);
const queryParams = ref<QueryParams>({});
const router = useRouter();
const userStore = useUserStore();

// 计算属性
const courseDict = computed(() =>
  courseList.value.map((course) => ({
    value: course.id,
    label: course.title,
  }))
);

// 方法
const formatUserName = (row: GradingRecord) => {
  const user = userList.value.find((user) => user.userId === row.studentId);
  return user ? user.userName : "";
};

const viewDetail = (row: GradingRecord) => {
  router.push({
    path: "/grading/detail",
    query: { answerId: row.answerId },
  });
};

const handleQuery = async () => {
  try {
    const res = await listAnswersDto(queryParams.value);
    gradingRecords.value = res;
  } catch (error) {
    console.error("查询阅卷记录失败:", error);
  }
};

const getList = async () => {
  try {
    console.log(userStore.userId);

    const [courseRes, userRes] = await Promise.all([
      listCourses({ teacherId: userStore.userId }),
      listUser(),
    ]);
    courseList.value = courseRes.rows;
    userList.value = userRes.rows;
  } catch (error) {
    console.error("获取列表数据失败:", error);
  }
};

// 初始化
onMounted(() => {
  getList();
});
</script>

<style scoped>
h1 {
  margin-bottom: 20px;
}
</style>
