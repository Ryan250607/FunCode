<template>
    <div style="padding: 20px 20px 0">
        <!-- 课程列表 -->
        <el-row :gutter="16" justify="center">
            <el-col v-for="course in courses" :key="course.id" :xs="24" :sm="12" :md="8" :lg="6">
                <el-card
                    :body-style="{ padding: '16px' }"
                    shadow="hover"
                    style="width: 100%"
                    @click="viewDetail(course)"
                >
                    <el-image
                        :src="isHttp(course.coverImage) ? course.coverImage : baseURL + course.coverImage"
                        style="width: 100%; height: 200px; object-fit: cover; margin-bottom: 15px"
                    ></el-image>
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px">
                        <h3 :style="{ fontSize: ['16px', null, '18px', '20px'], margin: 0 }">
                            {{ course.title }}
                        </h3>
                        <!-- <dict-tag :options="dict.type.difficult_value" :value="course.difficulty" /> -->
                    </div>
                    <el-progress
                        :percentage="calculatePercentage(course)"
                        style="width: 100%; white-space: nowrap"
                    ></el-progress>
                    <div style="padding: 10px">
                        <el-button size="medium" @click.stop="goCoding(course.id)"> 开始答题 </el-button>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <!-- 课程详情 -->
        <!-- <el-dialog
      :visible.sync="detailVisible"
      fullscreen
      ref="detailVisible"
      @close="closeDetail"
    >
      <div style="display: flex; align-items: center">
        <h2>{{ currentCourse.title }}</h2>
        <dict-tag
          style="margin-left: 10px"
          :options="dict.type.difficult_value"
          :value="currentCourse.difficulty"
        />
      </div>

      <el-row :gutter="20">
        <el-col :span="18">
          <video-player
            class="vjs-custom-skin"
            ref="videoPlayer"
            :options="playerOptions"
            @ended="handleVideoEnded(currentChapter)"
          >
          </video-player>
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
              v-for="chapter in currentCourse.chapters"
              :key="chapter.id"
              @click.native="viewChapterDetail(chapter)"
              style="margin-bottom: 12px; cursor: pointer"
              :body-style="{ padding: '12px' }"
              :class="{ 'active-chapter': chapter.id === currentChapter.id }"
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
                  <el-tag v-if="chapter.status == 1" type="success"
                    >已完成</el-tag
                  >
                  <el-tag v-else type="info">未完成</el-tag>
                </div>
              </div>
            </el-card>
          </div>
        </el-col>
      </el-row>
    </el-dialog> -->
        <!-- 固定在右下角的反馈按钮 -->
        <el-button
            type="primary"
            icon="el-icon-edit"
            circle
            class="feedback-button"
            @click="openFeedbackDialog"
        ></el-button>

        <!-- 反馈弹窗 -->
        <el-dialog title="反馈" :visible.sync="dialogVisible" width="30%">
            <el-form :model="feedbackForm" ref="feedbackForm" :rules="rules" label-width="80px">
                <el-form-item label="反馈类型" prop="feedbackType">
                    <!-- <el-select v-model="feedbackForm.feedbackType" placeholder="请选择反馈类型" clearable>
                        <el-option
                            v-for="dict in dict.type.feedback_type"
                            :key="dict.value"
                            :label="dict.label"
                            :value="dict.value"
                        />
                    </el-select> -->
                </el-form-item>
                <el-form-item v-if="feedbackForm.feedbackType == 1" label="课程" prop="courseId">
                    <el-select v-model="feedbackForm.courseId" placeholder="请选择课程">
                        <el-option
                            v-for="dict in courseDict"
                            :key="dict.value"
                            :label="dict.label"
                            :value="dict.value"
                        ></el-option>
                    </el-select>
                </el-form-item>

                <el-form-item v-if="feedbackForm.feedbackType == 1" label="课程评分" prop="rating">
                    <el-input-number v-model="feedbackForm.rating" :min="1" :max="10"></el-input-number>
                </el-form-item>
                <el-form-item label="反馈内容" prop="content">
                    <el-input v-model="feedbackForm.content" type="textarea" placeholder="请输入内容" />
                </el-form-item>
                <el-form-item label="附件">
                    <editor v-model="feedbackForm.attachment" :min-height="152" />
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="submitFeedback" :loading="loading">提交</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { listCourses, fetchUserCourses } from '@/api/funcode/courses';
import { isHttp } from '@/utils/validate';
import { addFeedback, email } from '@/api/funcode/feedback';
// import { mapGetters } from "vuex";
import {
    listChapters,
    listStatus,
    addStatus,
    listFinished,
    listChaptersByCouseId,
} from '@/api/funcode/chapters';
// import { listVideos, streamDownload } from '@/api/funcode/video';
// 定义响应式数据
const courses = ref<Course[]>([]); // 课程列表数据
const currentChapter = ref<Chapter[]>([]); // 当前章节
const currentCourse = ref<Course>({
    id: '',
    name: '',
    chapters: [],
    totalChapters: [],
    finishedChapters: [],
}); // 当前课程详情
const detailVisible = ref<boolean>(false); // 详情弹窗显示状态
const loading = ref<boolean>(true); // 加载状态
const baseURL = ref<string>(import.meta.env.VITE_APP_BASE_API || '');
const queryParams = reactive<QueryParams>({
    pageNum: 1,
    pageSize: 999,
});
const dialogVisible = ref<boolean>(false); // 控制弹窗显示
const feedbackForm = reactive<FeedbackForm>({ rating: 10 });
const rules = reactive<FeedbackRules>({
    feedbackType: [{ required: true, message: '反馈类型不能为空', trigger: 'blur' }],
    content: [{ required: true, message: '反馈内容不能为空', trigger: 'blur' }],
});
const playerOptions = reactive<PlayerOptions>({
    playbackRates: [0.5, 1.0, 1.5, 2.0], // 播放速度
    autoplay: true, // 如果true,浏览器准备好时开始回放。
    muted: false, // 默认情况下将会消除任何音频。
    loop: false, // 导致视频一结束就重新开始。
    preload: 'auto', // 建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
    language: 'zh-CN',
    aspectRatio: '16:9', // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
    sources: [
        {
            type: 'video/mp4',
            src: 'http://vjs.zencdn.net/v/oceans.mp4', // 注意：此链接可能无法访问，请检查链接合法性
        },
    ],
    notSupportedMessage: '此视频暂无法播放，请稍后再试', // 允许覆盖Video.js无法播放媒体源时显示的默认信息。
    controlBar: {
        timeDivider: true,
        durationDisplay: true,
        remainingTimeDisplay: false,
        fullscreenToggle: true, // 全屏按钮
    },
});
const isVideoEnded = ref<boolean>(false); // 是否播放完成

// 类型定义
interface Course {
    id: string;
    name: string;
    chapters: Chapter[];
    totalChapters: any;
    finishedChapters: any;
}

interface Chapter {
    id: string;
    name: string;
}

interface QueryParams {
    pageNum: number;
    pageSize: number;
}

interface FeedbackForm {
    rating: number;
}

interface FeedbackRules {
    feedbackType: { required: boolean; message: string; trigger: string }[];
    content: { required: boolean; message: string; trigger: string }[];
}

interface PlayerOptions {
    playbackRates: number[];
    autoplay: boolean;
    muted: boolean;
    loop: boolean;
    preload: string;
    language: string;
    aspectRatio: string;
    sources: { type: string; src: string }[];
    notSupportedMessage: string;
    controlBar: {
        timeDivider: boolean;
        durationDisplay: boolean;
        remainingTimeDisplay: boolean;
        fullscreenToggle: boolean;
    };
}

// 获取课程列表和用户课程
async function fetchCourses() {
    loading.value = true;
    try {
        const response = await listCourses(queryParams);
        const userCoursesResponse = await fetchUserCourses();

        courses.value = response.rows.filter((course: Course) =>
            userCoursesResponse.selectedCourseIds.includes(course.id)
        );

        // 并发请求章节数据和完成章节数据
        await Promise.all(
            courses.value.map(async (course: Course) => {
                const chaptersResponse = await listChaptersByCouseId({ courseId: course.id });
                const finishedResponse = await listFinished({ courseId: course.id });
                course.totalChapters = chaptersResponse;
                course.finishedChapters = finishedResponse;
            })
        );
    } catch (error) {
        console.error('Error fetching courses:', error);
    } finally {
        loading.value = false;
    }
}
function calculatePercentage(course) {
    let percentage = 0;
    const totalChapters = Number(course.totalChapters);
    const finishedChapters = Number(course.finishedChapters);

    if (course?.totalChapters && course?.finishedChapters && totalChapters > 0) {
        percentage = (finishedChapters / totalChapters) * 100;
    } else {
        percentage = 0;
    }
    return Number(percentage.toFixed(2));
}
onMounted(() => {
    fetchCourses();
});
</script>

<style scoped lang="scss"></style>
