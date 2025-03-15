import request from "@/utils/request";

export const uploadVideos = (data: any) => {
  return request({
    headers: {
      "Content-Type": "multipart/form-data",
    },
    url: "/api/videos/upload",
    method: "post",
    data,
  });
};
export const streamDownload = (params: any) => {
  return request({
    responseType: "arraybuffer", // HLS 需要二进制数据
    url: "/api/videos/stream",
    method: "get",
    headers: {
      "Content-Type": "application/x-mpegURL",
    },
    params,
  });
};

// 查询视频列表
export function listVideos(query: any) {
  return request({
    url: "/system/videos/list",
    method: "get",
    params: query,
  });
}

// 查询视频详细
export function getVideos(id: number) {
  return request({
    url: "/system/videos/" + id,
    method: "get",
  });
}

// 新增视频
export function addVideos(data: any) {
  return request({
    url: "/system/videos",
    method: "post",
    data: data,
  });
}

// 修改视频
export function updateVideos(data: any) {
  return request({
    url: "/system/videos",
    method: "put",
    data: data,
  });
}

// 删除视频
export function delVideos(id: number) {
  return request({
    url: "/system/videos/" + id,
    method: "delete",
  });
}

export function replaceChapterVideos(chapterId:number,data: any) {
  return request({
    url: "/system/videos/replace/"+chapterId,
    method: "post",
    data: data,
  });
}
