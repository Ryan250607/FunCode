<template>
  <div class="flex items-center">
    <el-dropdown trigger="hover" placement="bottom" @command="confirmLang">
      <div class="reference_btn">
        <svg-icon icon-class="lang" class="text-xl" />
        <!-- <span class="current_language">{{ current_language }}</span> -->
      </div>
      <template #dropdown>
        <el-dropdown-menu class="ifFlagDropdown">
          <el-dropdown-item
            v-for="item in langList"
            :key="item.category"
            :command="item.category"
            :class="{ 'is-selected': item.category === selectedLang }"
          >
            {{ item.lang }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { langList } from "@/utils/langList";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import CACHE_KEY from "@/constants/cache-key";
import { getLocalData, setLocalData } from "@/utils/cache/local-storage";

const { locale } = useI18n();
const router = useRouter();

const langue = computed<string>(() => {
  return getLocalData(CACHE_KEY.LOCAL_LANG) || "en";
});

const selectedLang = ref<string>(langue.value);

// const current_language = computed(() => {
//   return langList.find((el) => el.category === selectedLang.value)?.lang || "English";
// });

const confirmLang = (lang: string) => {
  selectedLang.value = lang;
  locale.value = lang;
  setLocalData(CACHE_KEY.LOCAL_LANG, lang);
  router.go(0);
};
</script>

<style scoped lang="scss">
.reference_btn {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  padding: 5px 8px;

  &:hover {
    color: #9b6bff; /* 浅紫色 */
  }
}

:deep(.ifFlagDropdown) {
  width: 260px;
  padding: 10px;
  border-radius: 5px;
}

:deep(.el-dropdown-menu__item) {
  height: 25px;
  line-height: 25px;
  font-size: 12px;
  padding: 0 15px;
  color: #333;
  border: 1px solid transparent;
  border-radius: 3px;
  margin: 5px 0;

  &:hover {
    color: #9b6bff; /* 浅紫色 */
    border: 1px solid #9b6bff23; /* 更浅的边框透明色 */
    background-color: #9b6bff6b; /* 更浅的背景透明色 */
  }

  &.is-selected {
    border: 1px solid #9b6bff; /* 浅紫色 */
    background-color: #9b6bff; /* 浅紫色 */
    color: #ffffff;
  }
}

// @media screen and (max-width: 880px) {
//   .current_language {
//     display: none;
//   }
// }
</style>
