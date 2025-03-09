<template>
  <div
    class="p-6 md:p-8 mx-auto max-w-[1300px] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md"
  >
    <h1 class="text-2xl md:text-3xl font-bold mb-6 text-indigo-800 text-center">
      学习数据分析
    </h1>

    <el-row :gutter="24">
      <!-- 用户学习进度分布（饼图） -->
      <el-col :xs="24" :sm="24" :md="12" class="mb-6">
        <el-card
          shadow="hover"
          class="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg h-full border-0 rounded-xl overflow-hidden"
          body-class="p-0"
        >
          <div class="bg-gradient-to-r from-blue-600 to-blue-400 p-4">
            <h2 class="text-lg font-bold mb-1 text-white flex items-center">
              <i class="el-icon-pie-chart mr-2"></i>用户学习进度分布
            </h2>
            <p class="text-sm text-blue-100 opacity-80">当前用户学习状态概览</p>
          </div>
          <div class="p-4">
            <div ref="progressChart" class="w-full h-[300px]"></div>
          </div>
        </el-card>
      </el-col>

      <!-- 课程受欢迎程度（柱状图） -->
      <el-col :xs="24" :sm="24" :md="12" class="mb-6">
        <el-card
          shadow="hover"
          class="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg h-full border-0 rounded-xl overflow-hidden"
          body-class="p-0"
        >
          <div class="bg-gradient-to-r from-emerald-600 to-emerald-400 p-4">
            <h2 class="text-lg font-bold mb-1 text-white flex items-center">
              <i class="el-icon-data-analysis mr-2"></i>课程受欢迎程度
            </h2>
            <p class="text-sm text-emerald-100 opacity-80">
              各课程注册人数统计
            </p>
          </div>
          <div class="p-4">
            <div ref="courseChart" class="w-full h-[300px]"></div>
          </div>
        </el-card>
      </el-col>

      <!-- 学习时长趋势（折线图） -->
      <el-col :xs="24" :sm="24" :md="12" class="mb-6">
        <el-card
          shadow="hover"
          class="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg h-full border-0 rounded-xl overflow-hidden"
          body-class="p-0"
        >
          <div class="bg-gradient-to-r from-amber-600 to-amber-400 p-4">
            <h2 class="text-lg font-bold mb-1 text-white flex items-center">
              <i class="el-icon-timer mr-2"></i>学习时长趋势（分钟/天）
            </h2>
            <p class="text-sm text-amber-100 opacity-80">
              过去一周每日学习时间
            </p>
          </div>
          <div class="p-4">
            <div ref="timeChart" class="w-full h-[300px]"></div>
          </div>
        </el-card>
      </el-col>

      <!-- 技能掌握分布（雷达图） -->
      <el-col :xs="24" :sm="24" :md="12" class="mb-6">
        <el-card
          shadow="hover"
          class="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg h-full border-0 rounded-xl overflow-hidden"
          body-class="p-0"
        >
          <div class="bg-gradient-to-r from-purple-600 to-purple-400 p-4">
            <h2 class="text-lg font-bold mb-1 text-white flex items-center">
              <i class="el-icon-discover mr-2"></i>技能掌握分布
            </h2>
            <p class="text-sm text-purple-100 opacity-80">各领域能力评估</p>
          </div>
          <div class="p-4">
            <div ref="skillChart" class="w-full h-[300px]"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import * as echarts from "echarts";
import type { ECharts } from "echarts";

// 定义图表引用
const progressChart = ref<HTMLElement | null>(null);
const courseChart = ref<HTMLElement | null>(null);
const timeChart = ref<HTMLElement | null>(null);
const skillChart = ref<HTMLElement | null>(null);

// 图表实例
let progressChartInstance: ECharts | null = null;
let courseChartInstance: ECharts | null = null;
let timeChartInstance: ECharts | null = null;
let skillChartInstance: ECharts | null = null;

// 初始化图表
const initCharts = () => {
  // 用户学习进度分布（饼图）
  if (progressChart.value) {
    progressChartInstance = echarts.init(progressChart.value);
    progressChartInstance.setOption({
      title: { text: "", subtext: "" },
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} ({d}%)",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderColor: "#ddd",
        borderWidth: 1,
        textStyle: { color: "#333" },
      },
      legend: {
        orient: "vertical",
        right: 10,
        top: "center",
        data: ["未开始", "进行中", "已完成"],
      },
      series: [
        {
          name: "学习进度",
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: {
            show: false,
            position: "center",
          },
          emphasis: {
            label: {
              show: true,
              fontSize: "16",
              fontWeight: "bold",
            },
          },
          labelLine: {
            show: false,
          },
          data: [
            { value: 150, name: "未开始", itemStyle: { color: "#a0aec0" } },
            { value: 300, name: "进行中", itemStyle: { color: "#4299e1" } },
            { value: 200, name: "已完成", itemStyle: { color: "#48bb78" } },
          ],
        },
      ],
    });
  }

  // 课程受欢迎程度（柱状图）
  if (courseChart.value) {
    courseChartInstance = echarts.init(courseChart.value);
    courseChartInstance.setOption({
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: ["HTML基础", "CSS进阶", "JS实战", "Python入门"],
        axisLabel: { interval: 0, rotate: 0 },
      },
      yAxis: {
        type: "value",
        name: "报名人数",
        nameTextStyle: { padding: [0, 0, 0, 40] },
      },
      series: [
        {
          name: "报名人数",
          type: "bar",
          data: [120, 200, 150, 180],
          barWidth: "40%",
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "#10b981" },
              { offset: 1, color: "#34d399" },
            ]),
            borderRadius: [5, 5, 0, 0],
          },
          label: { show: true, position: "top" },
        },
      ],
    });
  }

  // 学习时长趋势（折线图）
  if (timeChart.value) {
    timeChartInstance = echarts.init(timeChart.value);
    timeChartInstance.setOption({
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderColor: "#ddd",
        borderWidth: 1,
        textStyle: { color: "#333" },
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
        axisLine: {
          lineStyle: { color: "#ddd" },
        },
      },
      yAxis: {
        type: "value",
        name: "分钟",
        splitLine: {
          lineStyle: { type: "dashed", color: "#eee" },
        },
      },
      series: [
        {
          name: "学习时长",
          type: "line",
          smooth: true,
          lineStyle: { width: 3 },
          symbol: "circle",
          symbolSize: 8,
          data: [30, 45, 60, 50, 70, 40, 55],
          itemStyle: {
            color: "#f59e0b",
            borderColor: "#fff",
            borderWidth: 2,
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(245, 158, 11, 0.5)" },
              { offset: 1, color: "rgba(245, 158, 11, 0.05)" },
            ]),
          },
        },
      ],
    });
  }

  // 技能掌握分布（雷达图）
  if (skillChart.value) {
    skillChartInstance = echarts.init(skillChart.value);
    skillChartInstance.setOption({
      tooltip: {},
      radar: {
        indicator: [
          { name: "HTML", max: 100 },
          { name: "CSS", max: 100 },
          { name: "JavaScript", max: 100 },
          { name: "Python", max: 100 },
          { name: "算法", max: 100 },
        ],
        radius: "65%",
        splitNumber: 5,
        axisName: {
          color: "#333",
          backgroundColor: "#eee",
          borderRadius: 3,
          padding: [3, 5],
          fontWeight: "bold",
        },
        splitArea: {
          areaStyle: {
            color: ["rgba(250,250,250,0.1)", "rgba(200,200,200,0.1)"],
          },
        },
      },
      series: [
        {
          name: "技能掌握",
          type: "radar",
          data: [
            {
              value: [80, 70, 85, 60, 75],
              name: "平均掌握程度",
              symbol: "circle",
              symbolSize: 6,
              lineStyle: {
                width: 2,
                color: "#8b5cf6",
              },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: "rgba(139, 92, 246, 0.5)" },
                  { offset: 1, color: "rgba(139, 92, 246, 0.2)" },
                ]),
              },
              itemStyle: {
                color: "#8b5cf6",
              },
            },
          ],
        },
      ],
    });
  }
};

// 生命周期钩子
onMounted(() => {
  initCharts();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  if (progressChartInstance) progressChartInstance.dispose();
  if (courseChartInstance) progressChartInstance.dispose();
  if (timeChartInstance) progressChartInstance.dispose();
  if (skillChartInstance) progressChartInstance.dispose();
});

// 处理窗口大小变化
const handleResize = () => {
  if (progressChartInstance) progressChartInstance.resize();
  if (courseChartInstance) progressChartInstance.resize();
  if (timeChartInstance) progressChartInstance.resize();
  if (skillChartInstance) progressChartInstance.resize();
};
</script>

<style scoped>
/* 移除之前的样式，完全使用Tailwind类 */
</style>
