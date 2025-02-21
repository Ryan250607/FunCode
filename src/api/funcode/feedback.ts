import request from '@/utils/request';

// 查询课程反馈列表
export function listFeedback(query: any) {
    return request({
        url: '/system/feedback/list',
        method: 'get',
        params: query,
    });
}

// 查询课程反馈详细
export function getFeedback(id: number) {
    return request({
        url: '/system/feedback/' + id,
        method: 'get',
    });
}

// 新增课程反馈
export function addFeedback(data: any) {
    return request({
        url: '/system/feedback',
        method: 'post',
        data: data,
    });
}

// 修改课程反馈
export function updateFeedback(data) {
    return request({
        url: '/system/feedback',
        method: 'put',
        data: data,
    });
}

// 删除课程反馈
export function delFeedback(id) {
    return request({
        url: '/system/feedback/' + id,
        method: 'delete',
    });
}
export function email(params) {
    return request({
        url: '/email/send',
        method: 'get',
        params,
    });
}
