<template>
  <el-tag :type="tagType" size="small" effect="plain">
    <!-- <el-icon v-if="languageIcon" class="language-icon">
      <component :is="languageIcon" />
    </el-icon> -->
    {{ languageText }}
  </el-tag>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  language: string;
}>();

const tagType = computed(() => {
  const typeMap: Record<string, string> = {
    java: "primary",
    python: "success",
    c: "info",
  };

  return typeMap[props.language.toLowerCase()] || "info";
});

const languageText = computed(() => {
  const textMap: Record<string, string> = {
    java: "Java",
    python: "Python",
    c: "C",
  };

  return textMap[props.language.toLowerCase()] || props.language;
});

// const languageIcon = computed(() => {
//   const iconMap: Record<string, any> = {
//     java: Document,
//     python: Document,
//     c: Document,
//   };

//   return iconMap[props.language.toLowerCase()] || null;
// });
</script>

<style scoped>
.language-icon {
  margin-right: 4px;
  vertical-align: middle;
}
.el-tag {
  font-size: 14px;
}
</style>
