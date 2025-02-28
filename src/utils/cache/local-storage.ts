/** 统一处理 localStorage */
import CACHE_KEY from "@/constants/cache-key";
import { type SidebarOpened, type SidebarClosed } from "@/constants/app-key";

/**
 * @通用方法
 * **/
// 通用的 get 方法，根据 key 获取 localStorage 的值，并解析成 JSON 格式
export const getLocalData = <T>(key: any): T | null => {
  const json = localStorage.getItem(key);
  return json ? (JSON.parse(json) as T) : null;
};

// 通用的 set 方法，根据 key 将值存储到 localStorage，值会被转换为 JSON 字符串
export const setLocalData = <T>(key: any, value: T) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// 通用的 remove 方法，根据 key 删除 localStorage 中的对应项
export const removeLocalData = (key: any) => {
  localStorage.removeItem(key);
};

//#endregion

//#region 侧边栏状态
export const getSidebarStatus = () => {
  return localStorage.getItem(CACHE_KEY.SIDEBAR_STATUS);
};
export const setSidebarStatus = (
  sidebarStatus: SidebarOpened | SidebarClosed
) => {
  localStorage.setItem(CACHE_KEY.SIDEBAR_STATUS, sidebarStatus);
};
//#endregion

//#endregion
