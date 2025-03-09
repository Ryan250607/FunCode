import request from '@/utils/request';

// 查询部门列表
export function changeLanguage(query?: any) {
    return request({
        url: '/changeLanguage',
        method: 'get',
        params: query,
    });
}