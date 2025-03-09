import { ElMessage } from 'element-plus';
import { saveAs } from 'file-saver';
import request from '@/utils/request';

export function useDownload() {
  /**
   * 通用下载方法
   * @param url - 下载地址
   * @param params - 请求参数
   * @param filename - 文件名
   */
  const download = (url: string, params: Record<string, any>, filename: string) => {
    return request({
      url,
      method: 'get',
      params,
      responseType: 'blob'
    }).then((response) => {
      const blob = new Blob([response]);
      saveAs(blob, filename);
    }).catch((error) => {
      ElMessage.error('下载文件失败');
      console.error('下载文件失败', error);
    });
  };

  return {
    download
  };
}