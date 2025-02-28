<template>
  <div style="padding: 20px 20px 0">
    <!-- 课程列表 -->
    <el-row :gutter="16" justify="start" class="w-full">
      <el-col
        v-for="course in courses"
        :key="course.id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
        class="mb-4"
      >
        <div
          class="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 rounded-lg overflow-hidden cursor-pointer"
          @click="viewDetail(course)"
        >
          <el-image
            :src="
              isHttp(course.coverImage)
                ? course.coverImage
                : baseURL + course.coverImage
            "
            class="w-full aspect-[16/9] object-cover rounded-t-lg"
          />
          <div class="p-4">
            <div class="flex items-center gap-2 mb-2">
              <div class="text-base font-bold text-gray-800 truncate">
                {{ course.title }}
              </div>
              <dict-tag :options="difficult_value" :value="course.difficulty" />
            </div>
            <el-progress
              :percentage="calculatePercentage(course)"
              class="w-full"
            />
            <div class="mt-3">
              <el-button
                class="w-full"
                @click.stop="goCoding(course.id)"
              >
                开始答题
              </el-button>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 课程详情 -->
    <el-dialog
      v-model="detailVisible"
      fullscreen
      ref="detailVisibleRef"
      @close="closeDetail"
    >
      <div style="display: flex; align-items: center">
        <div class="text-lg font-bold">{{ currentCourse?.title }}</div>
        <dict-tag
          style="margin-left: 10px"
          :options="difficult_value"
          :value="currentCourse?.difficulty"
        />
      </div>
      <el-row :gutter="20">
        <el-col :span="18">
          <VideoPlayer
            ref="videoPlayerRef"
            :options="playerOptions"
            @ended="handleVideoEnded(currentChapter)"
          />
        </el-col>
        <el-col :span="6">
          <div
            style="
              background: #f1f2f3;
              padding: 16px;
              border-radius: 4px;
              height: 75vh;
              overflow-y: auto;
            "
          >
            <el-card
              v-for="chapter in currentCourse?.chapters"
              :key="chapter.id"
              @click="viewChapterDetail(chapter)"
              style="margin-bottom: 12px; cursor: pointer"
              :body-style="{ padding: '12px' }"
              :class="{ 'active-chapter': chapter.id === currentChapter?.id }"
            >
              <div
                style="
                  display: flex;
                  justify-content: space-around;
                  align-items: center;
                "
              >
                <div style="font-weight: 500; margin-bottom: 4px">
                  {{ chapter.title }}
                </div>
                <div style="color: #666; font-size: 14px">
                  {{ chapter.description }}
                </div>
                <div style="margin-bottom: 4px">
                  <el-tag v-if="chapter.status === 1" type="success"
                    >已完成</el-tag
                  >
                  <el-tag v-else type="info">未完成</el-tag>
                </div>
              </div>
            </el-card>
          </div>
        </el-col>
      </el-row>
    </el-dialog>

    <!-- 固定在右下角的反馈按钮 -->

    <el-button
      type="primary"
      :icon="Edit"
      circle
      class="feedback-button"
      @click="openFeedbackDialog"
    />

    <!-- 反馈弹窗 -->
    <el-dialog title="反馈" v-model="dialogVisible" width="30%">
      <el-form
        :model="feedbackForm"
        ref="feedbackFormRef"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="反馈类型" prop="feedbackType">
          <el-select
            v-model="feedbackForm.feedbackType"
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
        <el-form-item
          v-if="feedbackForm.feedbackType === 1"
          label="课程"
          prop="courseId"
        >
          <el-select v-model="feedbackForm.courseId" placeholder="请选择课程">
            <el-option
              v-for="dict in courseDict"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="feedbackForm.feedbackType === 1"
          label="课程评分"
          prop="rating"
        >
          <el-input-number v-model="feedbackForm.rating" :min="1" :max="10" />
        </el-form-item>
        <el-form-item label="反馈内容" prop="content">
          <el-input
            v-model="feedbackForm.content"
            type="textarea"
            placeholder="请输入内容"
          />
        </el-form-item>
        <el-form-item label="附件">
          <editor v-model="feedbackForm.attachment" :min-height="152" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitFeedback" :loading="loading">
            提交
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  getCurrentInstance,
  ComponentInternalInstance,
} from "vue";
import { useRouter } from "vue-router";
import { ElMessage, type FormInstance } from "element-plus";
import useUserStore from "@/store/modules/user";
import { isHttp } from "@/utils/validate";
import { listCourses, fetchUserCourses } from "@/api/funcode/courses";
import { addFeedback, email } from "@/api/funcode/feedback";
import {
  listChapters,
  listStatus,
  addStatus,
  listFinished,
  listChaptersByCouseId,
} from "@/api/funcode/chapters";
import { listVideos, streamDownload } from "@/api/funcode/video";
import type { Course, Chapter, FeedbackForm } from "@/types/index";
import type { VideoJsPlayerOptions } from "video.js";
import { Edit } from "@element-plus/icons-vue";
// Pinia Store
const userStore = useUserStore();
const email = computed(() => userStore.email);

// 路由
const router = useRouter();

// 响应式数据
const courses = ref<Course[]>([]);
const currentCourse = ref<(Course & { chapters: Chapter[] }) | null>(null);
const currentChapter = ref<Chapter | null>(null);
const detailVisible = ref(false);
const loading = ref(false);
const baseURL = ref(import.meta.env.VUE_APP_BASE_API);
const dialogVisible = ref(false);
const feedbackForm = ref<FeedbackForm>({ rating: 10 });
const detailVisibleRef = ref<any>(null); // FadeDialog 的实例类型需根据实际调整
const feedbackFormRef = ref<FormInstance>();
const isVideoEnded = ref(false);
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { difficult_value, feedback_type } = proxy!.useDict(
  "difficult_value",
  "feedback_type"
);
const videoPlayerRef = ref<InstanceType<typeof videoPlayerRef> | null>(null);
// 表单校验规则
const rules = {
  feedbackType: [
    { required: true, message: "反馈类型不能为空", trigger: "blur" },
  ],
  content: [{ required: true, message: "反馈内容不能为空", trigger: "blur" }],
};

// 默认播放器配置
const playerOptions = ref<VideoJsPlayerOptions>({
  playbackRates: [0.5, 1.0, 1.5, 2.0],
  autoplay: true,
  muted: false,
  loop: false,
  preload: "auto",
  controls: true, // 启用控制栏
  language: "zh-CN",
  aspectRatio: "16:9",
  sources: [],
  notSupportedMessage: "此视频暂无法播放，请稍后再试",
  controlBar: {
    timeDivider: true,
    durationDisplay: true,
    remainingTimeDisplay: false,
    fullscreenToggle: true,
  },
});

// 计算属性
const courseDict = computed(() =>
  courses.value.map((course) => ({
    value: course.id,
    label: course.title,
  }))
);

// 方法
function calculatePercentage(course: Course) {
  const totalChapters = Number(course.totalChapters || 0);
  const finishedChapters = Number(course.finishedChapters || 0);
  return totalChapters > 0
    ? Number(((finishedChapters / totalChapters) * 100).toFixed(2))
    : 0;
}

async function getList() {
  loading.value = true;
  try {
    const courseResponse = await listCourses({ pageNum: 1, pageSize: 999 });
    const userCourses = await fetchUserCourses();
    courses.value = courseResponse.rows.filter((course: Course) =>
      userCourses.selectedCourseIds.includes(course.id)
    );

    await Promise.all(
      courses.value.map(async (course) => {
        const chaptersRes = await listChaptersByCouseId({
          courseId: course.id,
        });
        course.totalChapters = chaptersRes;
        const finishedRes = await listFinished({ courseId: course.id });
        course.finishedChapters = finishedRes;
      })
    );
  } catch (error) {
    console.error("Failed to fetch courses:", error);
  } finally {
    loading.value = false;
  }
}

async function viewDetail(course: Course) {
  try {
    const response = await listChapters({
      courseId: course.id,
      pageNum: 1,
      pageSize: 999,
    });
    const chapters = response.rows;
    await Promise.all(
      chapters.map(async (row) => {
        const res = await listStatus({ chapterId: row.id });
        row.status = res.rows.length > 0 ? 1 : 0;
      })
    );
    currentCourse.value = {
      id: course.id,
      title: course.title,
      difficulty: course.difficulty,
      chapters,
    };
    if (chapters.length > 0) viewChapterDetail(chapters[0]);
    detailVisible.value = true;
  } catch (error) {
    console.error("Failed to fetch course details:", error);
  }
}

async function viewChapterDetail(chapter: Chapter) {
  currentChapter.value = chapter;
  try {
    const response = await listVideos({ chapterId: chapter.id });
    if (response.rows?.length > 0) {
      const videoUrl = response.rows[0].videoUrl;
      playerOptions.value.sources = [
        {
          src: "/dev-api/" + videoUrl,
          type: "application/x-mpegURL",
        },
      ];
    }
  } catch (error) {
    console.error("加载视频失败:", error);
    ElMessage.error("加载视频失败，请检查路径是否正确");
  }
}

async function handleVideoEnded(chapter: Chapter | null) {
  if (!chapter) return;
  try {
    await addStatus({ chapterId: chapter.id });
    isVideoEnded.value = true;
    chapter.status = 1; // 直接修改响应式数据
  } catch (error) {
    console.error("Failed to update status:", error);
  }
}

function goCoding(id: number | string) {
  router.push({ path: "/coding", query: { courseId: id } });
}

function openFeedbackDialog() {
  dialogVisible.value = true;
}

async function submitFeedback() {
  const form = feedbackFormRef.value;
  if (!form) return;

  form.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        await addFeedback(feedbackForm.value);
        if (email.value) {
          await email({ to: email.value });
          dialogVisible.value = false;
          feedbackForm.value = { rating: 10 };
          ElMessage.success("反馈提交成功");
        } else {
          ElMessage.error("该用户还没有绑定邮箱,无法提交反馈");
        }
      } catch (error) {
        console.error("Failed to submit feedback:", error);
      } finally {
        loading.value = false;
      }
    }
  });
}

function closeDetail() {
  if (videoPlayerRef.value) {
    videoPlayerRef.value.pauseVideo();
  }
  detailVisible.value = false;
}

// 生命周期
onMounted(() => {
  getList();
});

onUnmounted(() => {});
</script>

<style scoped>
.feedback-button {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 1;
}

.active-chapter {
  background-color: #e3b63e !important;
}


</style>
