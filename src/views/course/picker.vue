<!-- src/views/Home.vue -->
<template>
  <div class="px-5 pt-5 pb-0">
    <!-- 课程列表 -->
    <el-row :gutter="20" justify="start">
      <el-col
        v-for="course in courses"
        :key="course.id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
        class="mb-2"
      >
        <div
          class="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg overflow-hidden cursor-pointer"
        >
          <el-image
            :src="
              isHttp(course.coverImage)
                ? course.coverImage
                : baseURL + course.coverImage
            "
            class="w-full aspect-[4/3] object-cover rounded-t-lg"
          ></el-image>
          <div class="flex flex-col p-2">
            <div class="flex items-center gap-2 mb-2">
              <h3 class="text-base font-bold text-gray-800 truncate">
                {{ course.title }}
              </h3>
              <DifficultyTag :level="course.difficulty" />
            </div>
            <div class="mt-auto">
              <el-button
                v-if="!isCourseSelected(course.id)"
                type="primary"
                class="w-full"
                @click="selectCourse(course.id)"
              >
                选课
              </el-button>
              <el-button
                v-else
                type="danger"
                class="w-full"
                @click="cancelCourse(course.id)"
              >
                退选
              </el-button>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  onMounted,
  getCurrentInstance,
  type ComponentInternalInstance,
} from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  listCourses,
  fetchUserCourses,
  selectCourse as apiSelectCourse,
  deleteCourse,
} from "@/api/funcode/courses";
import { isHttp } from "@/utils/validate";

// 获取字典数据
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { difficult_value } = proxy!.useDict("difficult_value", "feedback_type");

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
    await apiSelectCourse({ courseId });
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
