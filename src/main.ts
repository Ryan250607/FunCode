import { createApp } from "vue";

import Cookies from "js-cookie";

import ElementPlus from "element-plus";
import "@/assets/styles/index.scss"; // global css
// element css
import "element-plus/es/components/message/style/css";
import "element-plus/es/components/message-box/style/css";
import "element-plus/es/components/notification/style/css";
import "element-plus/es/components/loading/style/css";
// tailwindcss
import "./index.css";

import App from "./App.vue";
import store from "./store";
import router from "./router";
import directive from "./directive"; // directive

// 注册指令
import plugins from "./plugins"; // plugins
import { download } from "@/utils/request";

// svg图标
import "virtual:svg-icons-register";
import SvgIcon from "@/components/SvgIcon/index.vue";
import elementIcons from "@/components/SvgIcon/svgicon";

import "./permission"; // permission control

import { useDict } from "@/utils/dict";
import {
  parseTime,
  resetForm,
  addDateRange,
  handleTree,
  selectDictLabel,
  selectDictLabels,
} from "@/utils/ruoyi";

// 分页组件
import Pagination from "@/components/Pagination/index.vue";
// 自定义表格工具组件
import RightToolbar from "@/components/RightToolbar/index.vue";
// 富文本组件
import Editor from "@/components/Editor/index.vue";
// 文件上传组件
import FileUpload from "@/components/FileUpload/index.vue";
// 图片上传组件
import ImageUpload from "@/components/ImageUpload/index.vue";
// 图片预览组件
import ImagePreview from "@/components/ImagePreview/index.vue";
// 自定义树选择组件
import TreeSelect from "@/components/TreeSelect/index.vue";
// 字典标签组件
import DictTag from "@/components/DictTag/index.vue";
import { library } from '@fortawesome/fontawesome-svg-core'
import { faLanguage } from '@fortawesome/free-solid-svg-icons'
import { faUser } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// i18n
import i18n from '@/i18n/index'
library.add(faUser,faLanguage)

const app = createApp(App);

// 全局方法挂载
app.config.globalProperties.useDict = useDict;
app.config.globalProperties.download = download;
app.config.globalProperties.parseTime = parseTime;
app.config.globalProperties.resetForm = resetForm;
app.config.globalProperties.handleTree = handleTree;
app.config.globalProperties.addDateRange = addDateRange;
app.config.globalProperties.selectDictLabel = selectDictLabel;
app.config.globalProperties.selectDictLabels = selectDictLabels;

// 全局组件挂载
app.component("DictTag", DictTag);
app.component("Pagination", Pagination);
app.component("TreeSelect", TreeSelect);
app.component("FileUpload", FileUpload);
app.component("ImageUpload", ImageUpload);
app.component("ImagePreview", ImagePreview);
app.component("RightToolbar", RightToolbar);
app.component("Editor", Editor);
app.component("font-awesome-icon", FontAwesomeIcon);

app.use(router);
app.use(store);
app.use(plugins);
app.use(elementIcons);
app.use(i18n)
app.component("svg-icon", SvgIcon);

directive(app);
app.use(ElementPlus);

app.mount("#app");
