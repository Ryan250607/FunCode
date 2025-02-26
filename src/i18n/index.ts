import { createI18n} from "vue-i18n";
import zhCn from '@/i18n/lang/zh-CN'
import en from '@/i18n/lang/en-US'

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: localStorage.getItem('lang') || 'en',
  messages: {
    zhCn,
    en,
  },
})
export default i18n
