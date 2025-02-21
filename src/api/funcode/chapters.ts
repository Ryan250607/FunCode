import request from '@/utils/request';

// 查询章节列表
export function listChapters(query: any) {
    return request({
        url: '/system/chapters/list',
        method: 'get',
        params: query,
    });
}

// 查询章节详细
export function getChapters(id: number) {
    return request({
        url: '/system/chapters/' + id,
        method: 'get',
    });
}

// 新增章节
export function addChapters(data: any) {
    return request({
        url: '/system/chapters',
        method: 'post',
        data: data,
    });
}

// 修改章节
export function updateChapters(data: any) {
    return request({
        url: '/system/chapters',
        method: 'put',
        data: data,
    });
}

// 删除章节
export function delChapters(id: number) {
    return request({
        url: '/system/chapters/' + id,
        method: 'delete',
    });
}

// 查询用户章节状态列表
export function listStatus(query: any) {
    return request({
        url: '/system/status/list',
        method: 'get',
        params: query,
    });
}

// 查询用户章节已完成数
export function listFinished(params: any) {
    return request({
        url: '/system/status/count',
        method: 'get',
        params,
    });
}

// 查询课程所有章节数
export function listChaptersByCouseId(params: any) {
    return request({
        url: '/system/status/total',
        method: 'get',
        params,
    });
}

// 查询用户章节状态详细
export function getStatus(id: number) {
    return request({
        url: '/system/status/' + id,
        method: 'get',
    });
}

// 新增用户章节状态
export function addStatus(data: any) {
    return request({
        url: '/system/status',
        method: 'post',
        data: data,
    });
}

// 修改用户章节状态
export function updateStatus(data: any) {
    return request({
        url: '/system/status',
        method: 'put',
        data: data,
    });
}

// 删除用户章节状态
export function delStatus(id: number) {
    return request({
        url: '/system/status/' + id,
        method: 'delete',
    });
}
