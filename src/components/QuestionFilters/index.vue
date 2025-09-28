<!-- QuestionFilters.vue -->
<template>
  <el-card shadow="never" class="filter-container">
    <div class="search-row">
      <el-input
        v-model="title"
        placeholder="搜索题目"
        clearable
        prefix-icon="Search"
      />
    </div>
    
    <div class="filter-row">
      <div class="filter-group">
        <span class="filter-label">难度:</span>
        <el-radio-group v-model="difficulty">
          <el-radio-button label="easy">简单</el-radio-button>
          <el-radio-button label="medium">中等</el-radio-button>
          <el-radio-button label="hard">困难</el-radio-button>
        </el-radio-group>
      </div>
      
      <div class="filter-actions">
        <el-button @click="resetFilters">重置筛选</el-button>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ArrowDown, Search } from '@element-plus/icons-vue';
import { debounce } from "lodash";

interface QuestionFilter {
  difficulty: string;
  title: string;
}

const props = defineProps<{
  filters: QuestionFilter
}>();

const emit = defineEmits<{
  'update:filters': [filters: QuestionFilter]
  'filter-change': []
}>();

// 防抖处理搜索变化
const debouncedEmitFilterChange = debounce(() => {
  emit('filter-change');
}, 300);

// 简化计算属性，直接操作filters
const difficulty = computed({
  get: () => props.filters.difficulty,
  set: (value: string) => {
    emit('update:filters', { ...props.filters, difficulty: value });
    emit('filter-change');
  }
});

const title = computed({
  get: () => props.filters.title,
  set: (value: string) => {
    emit('update:filters', { ...props.filters, title: value });
    debouncedEmitFilterChange();
  }
});

// 重置过滤器
const resetFilters = () => {
  emit('update:filters', { difficulty: '', title: '' });
  emit('filter-change');
};
</script>

<style scoped>
.filter-container {
  margin-bottom: 16px;
}

.search-row {
  margin-bottom: 16px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-weight: 500;
  min-width: 40px;
}

.filter-actions {
  margin-left: auto;
}

.tags-popover {
  max-height: 300px;
  overflow-y: auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
</style>