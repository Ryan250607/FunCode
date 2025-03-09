<template>
  <div class="flex items-center relative">
    <div
      class="reference_btn"
      @mouseenter="showDropdown = true"
      @mouseleave="startHideTimer"
    >
      <svg-icon icon-class="lang" class="text-xl opacity-80" />
    </div>

    <div
      v-show="showDropdown"
      class="lang-dropdown-card absolute top-full right-0 mt-1 shadow-md"
      style="z-index: 3000"
      @mouseenter="clearHideTimer"
      @mouseleave="startHideTimer"
    >
      <div class="justify-start p-1" style="width: 100%">
        <div
          v-for="item in langList"
          :key="item.category"
          class="lang-item flex items-center"
          :class="{ 'is-selected': item.category === selectedLang }"
          @click="confirmLang(item.category)"
        >
          <span class="text-xs">{{ item.lang }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { langList } from "@/utils/langList";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import CACHE_KEY from "@/constants/cache-key";
import { getLocalData, setLocalData } from "@/utils/cache/local-storage";
import {changeLanguage} from "@/api/system/lang"
const { locale } = useI18n();
const router = useRouter();

const langue = computed<string>(() => {
  return getLocalData(CACHE_KEY.LOCAL_LANG) || "en";
});

const selectedLang = ref<string>(langue.value);
const showDropdown = ref(false);
let hideTimer: number | null = null;

const confirmLang = async (lang: string) => {
  selectedLang.value = lang;
  locale.value = lang;
  setLocalData(CACHE_KEY.LOCAL_LANG, lang);
  await changeLanguage({lang})
  showDropdown.value = false;
   router.go(0);
};

const startHideTimer = () => {
  clearHideTimer();
  hideTimer = setTimeout(() => {
    showDropdown.value = false;
  }, 200);
};

const clearHideTimer = () => {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
};
</script>

<style scoped lang="scss">
.reference_btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #9b6bff;
  }
}

.lang-dropdown-card {
  min-width: 120px; // 增加最小宽度以容纳完整文字
  border-radius: 8px;
  background: #fff;
  transform-origin: top right;
  animation: fadeIn 0.2s ease;
}

.lang-item {
  height: 28px;
  line-height: 28px;
  padding: 0 12px;
  border-radius: 4px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap; // 防止文字换行
  width: 100%; // 确保占满卡片宽度
  box-sizing: border-box; // 确保padding不影响宽度

  &:hover {
    color: #9b6bff;
    background-color: #f8f7ff;
  }

  &.is-selected {
    background-color: #9b6bff;
    color: #ffffff;
    &:hover {
      background-color: #8c5ce6;
    }
  }

  span {
    display: block; // 确保文字span占满父元素宽度
    width: 100%;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
