<template>
  <div style="padding: 20px 20px 0">
    <!-- 课程列表 -->
    <el-row :gutter="20" justify="start">
      <el-col
        v-for="course in courses"
        :key="course.id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
      >
        <el-card
          :body-style="{ padding: '16px' }"
          shadow="hover"
          style="height: 320px"
        >
          <el-image
            :src="
              isHttp(course.coverImage)
                ? course.coverImage
                : baseURL + course.coverImage
            "
            style="
              width: 100%;
              height: 150px;
              object-fit: cover;
              border-radius: 4px;
              margin-bottom: 12px;
            "
          ></el-image>
          <div
            style="
              display: flex;
              flex-direction: column;
              gap: 8px;
              height: 100px;
            "
          >
            <div style="display: flex; align-items: center; gap: 8px">
              <h3 style="font-size: 16px; margin: 0; line-height: 1.4">
                {{ course.title }}
              </h3>
              <dict-tag
                  :options="difficult_value"
                  :value="course.difficulty"
                />
            </div>
            <div style="margin-top: auto">
              <el-button
                v-if="!isCourseSelected(course.id)"
                type="primary"
                size="medium"
                style="width: 100%"
                @click="selectCourse(course.id)"
              >
                选课
              </el-button>
              <el-button
                v-else
                type="danger"
                size="medium"
                style="width: 100%"
                @click="cancelCourse(course.id)"
              >
                退选
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted,getCurrentInstance, ComponentInternalInstance } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  listCourses,
  fetchUserCourses,
  selectCourse,
  deleteCourse,
} from "@/api/funcode/courses";
import { isHttp } from "@/utils/validate";
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { difficult_value, feedback_type } = proxy!.useDict('difficult_value', 'feedback_type');
// 定义课程类型
interface Course {
  id: number;
  title: string;
  coverImage: string;
  difficulty: string;
}

// 定义查询参数类型
interface QueryParams {
  pageNum: number;
  pageSize: number;
}

// 使用 Pinia 存储字典数据

// 定义响应式数据
const courses = ref<Course[]>([]);
const loading = ref(true);
const baseURL = import.meta.env.VITE_APP_BASE_API;
const queryParams = ref<QueryParams>({
  pageNum: 1,
  pageSize: 999,
});
const selectedCourseIds = ref<number[]>([]);

// 获取课程列表
const getList = async () => {
  try {
    loading.value = true;
    const response = await listCourses(queryParams.value);
    courses.value = response.rows;
  } finally {
    loading.value = false;
  }
};

// 获取用户已选课程
const fetchUserCoursesData = async () => {
  try {
    const res = await fetchUserCourses();
    selectedCourseIds.value = res.selectedCourseIds;
  } catch (error) {
    console.error("获取用户课程失败:", error);
  }
};

// 选课
const selectCourse = async (courseId: number) => {
  try {
    await selectCourse({ courseId });
    ElMessage.success("选课成功！");
    selectedCourseIds.value.push(courseId);
  } catch (error) {
    ElMessage.error("选课失败");
  }
};

// 检查课程是否已选
const isCourseSelected = (courseId: number) => {
  return selectedCourseIds.value.includes(courseId);
};

// 退课
const cancelCourse = async (courseId: number) => {
  try {
    await ElMessageBox.confirm("确定要退选该课程吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    await deleteCourse(courseId);
    selectedCourseIds.value = selectedCourseIds.value.filter(
      (id) => id !== courseId
    );
    ElMessage.success("退选成功");
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("退选失败");
    } else {
      ElMessage.info("已取消退选");
    }
  }
};

// 组件挂载时执行
onMounted(() => {
  getList();
  fetchUserCoursesData();
});
</script>
