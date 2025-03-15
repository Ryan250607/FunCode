import request from '@/utils/request'
import type { FilesType, UploadFileInfoType, UploadUrls } from './typing'


// 根据 md5 检查文件是否上传，若上传一半，则返回已上传的文件序号 listParts
export function checkFileByMd5(md5: string) {
  return request({
    url: `files/multipart/check/${md5}`,
    method: 'get'
  })
}

// 根据文件信息初始化分片上传地址
export function initMultPartFile(data: any) {
  return request({
    url: 'files/multipart/init',
    method: 'post',
    data: data
  })
}

// 合并文件
export function mergeFileByMd5(md5: string) {
  return request({
    url: `files/multipart/merge/${md5}`,
    method: 'post'
  })
}

// 分片下载
export function chunkDownloadFile(id: number, bytes: string) {
  return request({
    url: `/files/download/${id}`,
    method: 'get',
    responseType: 'blob',
    headers: {
      Range: bytes
    }
  })
}

// 获取数据库文件列表
export function fetchFileList() {
  return request({
    url: `files/list`,
    method: 'get'
  })
}
