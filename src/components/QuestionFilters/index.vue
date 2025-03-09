<template>
  <el-card shadow="never" class="filter-container">
    <div class="search-row">
      <el-input
        v-model="localFilters.searchKeyword"
        placeholder="搜索题目"
        clearable
        prefix-icon="Search"
        @input="debounceEmitChange"
      />
    </div>
    
    <div class="filter-row">
      <div class="filter-group">
        <span class="filter-label">难度:</span>
        <el-checkbox-group v-model="localFilters.difficulty" @change="emitChange">
          <el-checkbox-button label="easy">简单</el-checkbox-button>
          <el-checkbox-button label="medium">中等</el-checkbox-button>
          <el-checkbox-button label="hard">困难</el-checkbox-button>
        </el-checkbox-group>
      </div>
      
      <div class="filter-group">
        <span class="filter-label">标签:</span>
        <el-popover
          placement="bottom"
          trigger="click"
          :width="300"
        >
          <template #reference>
            <el-button type="primary" plain>
              标签 ({{ localFilters.tags.length }})
              <el-icon><ArrowDown /></el-icon>
            </el-button>
          </template>
          
          <div class="tags-popover">
            <el-checkbox-group v-model="localFilters.tags" @change="emitChange">
              <el-checkbox
                v-for="tag in availableTags"
                :key="tag.id"
                :label="tag.id"
              >
                {{ tag.name }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </el-popover>
      </div>
      
      <div class="filter-actions">
        <el-button @click="resetFilters">重置筛选</el-button>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { ArrowDown, Search } from '@element-plus/icons-vue';
import { debounce } from "lodash";
// import { QuestionFilter } from '@/api/question';
// import { fetchTags } from '@/api/tags';

// 定义Props和事件
const props = defineProps<{
  filters: QuestionFilter
}>();

const emit = defineEmits<{
  'update:filters': [filters: QuestionFilter]
  'filter-change': []
}>();

// 本地过滤器状态
const localFilters = reactive<QuestionFilter>({
  difficulty: [],
  tags: [],
  searchKeyword: ''
});

// 可用标签
const availableTags = ref<{ id: string, name: string }[]>([]);

// 初始化
const initTags = async () => {
  try {
    // const { data } = await fetchTags();
    // availableTags.value = data;
  } catch (error) {
    console.error('获取标签列表失败:', error);
  }
};

// 挂载时获取标签
initTags();

// 监听 props.filters 变化，同步到本地状态
watch(() => props.filters, (newVal) => {
  Object.assign(localFilters, newVal);
}, { deep: true, immediate: true });

// 过滤器变更处理
const emitChange = () => {
  emit('update:filters', { ...localFilters });
  emit('filter-change');
};

// 搜索防抖
const debounceEmitChange = debounce(() => {
  emitChange();
}, 300);

// 重置过滤器
const resetFilters = () => {
  localFilters.difficulty = [];
  localFilters.tags = [];
  localFilters.searchKeyword = '';
  emitChange();
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