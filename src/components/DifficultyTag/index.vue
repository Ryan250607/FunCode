<script setup lang="ts">
import { computed } from 'vue';

// 定义难度等级的类型
type DifficultyLevel = 'easy' | 'medium' | 'hard';

// 定义 props 接口
interface Props {
  level: DifficultyLevel; // 必须传递的 level prop
  size?: 'default' | 'small' | 'large'; // 标签大小
  effect?: 'light' | 'dark' | 'plain'; // 标签效果
}

// 使用 defineProps 定义 props，并设置默认值
const props = withDefaults(defineProps<Props>(), {
  level: 'easy',
  size: 'default',
  effect: 'light'
});

// 根据 level 计算对应的标签类型和文本
const tagType = computed(() => {
  const typeMap: Record<DifficultyLevel, string> = {
    easy: 'success',
    medium: 'warning',
    hard: 'danger'
  };

  return typeMap[props.level] || 'info';
});

const difficultyText = computed(() => {
  const textMap: Record<DifficultyLevel, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  };

  return textMap[props.level] || props.level;
});

// 计算标签大小样式
const sizeClass = computed(() => {
  const sizeMap = {
    small: 'difficulty-tag--small',
    default: '',
    large: 'difficulty-tag--large'
  };
  
  return sizeMap[props.size];
});

// 为每个难度等级提供独特的图标
const difficultyIcon = computed(() => {
  const iconMap: Record<DifficultyLevel, string> = {
    easy: 'iEL-icon-success',
    medium: 'iEL-icon-warning',
    hard: 'iEL-icon-danger'
  };

  return props.effect !== 'plain' ? iconMap[props.level] : '';
});
</script>

<template>
  <el-tag
    class="difficulty-tag"
    :class="sizeClass"
    :type="tagType"
    :effect="effect"
    :size="size !== 'large' ? size : 'default'"
  >
    <i v-if="difficultyIcon" :class="difficultyIcon" class="difficulty-icon"></i>
    {{ difficultyText }}
  </el-tag>
</template>

<style scoped>
.difficulty-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  line-height: 1;
  transition: all 0.2s;
  border-radius: 12px;
  padding: 0 8px;
  white-space: nowrap;
}

.difficulty-tag--small {
  min-width: 44px;
  font-size: 12px;
  height: 22px;
}

.difficulty-tag--large {
  min-width: 64px;
  font-size: 14px;
  height: 32px;
  padding: 0 12px;
}

.difficulty-icon {
  margin-right: 4px;
  font-size: 0.85em;
}

/* 为不同难度等级添加脉冲动画效果 (仅在 dark 效果下) */
.difficulty-tag[effect="dark"][type="danger"] {
  box-shadow: 0 0 0 rgba(245, 108, 108, 0.4);
  animation: pulse-danger 2s infinite;
}

@keyframes pulse-danger {
  0% {
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(245, 108, 108, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0);
  }
}
</style>