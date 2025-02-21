import request from '@/utils/request';

// 查询【请填写功能名称】列表
export function listCourses(query: any) {
    return request({
        url: '/system/courses/list',
        method: 'get',
        params: query,
    });
}

// 查询【请填写功能名称】详细
export function getCourses(id: number) {
    return request({
        url: '/system/courses/' + id,
        method: 'get',
    });
}

// 新增【请填写功能名称】
export function addCourses(data: any) {
    return request({
        url: '/system/courses',
        method: 'post',
        data: data,
    });
}

// 修改【请填写功能名称】
export function updateCourses(data: any) {
    return request({
        url: '/system/courses',
        method: 'put',
        data: data,
    });
}

// 删除【请填写功能名称】
export function delCourses(id: number) {
    return request({
        url: '/system/courses/' + id,
        method: 'delete',
    });
}

export const fetchUserCourses = () => {
    return request({
        url: '/api/user/courseSelected',
        method: 'get',
    });
};
export function selectCourse(data: any) {
    return request({
        url: '/api/user/courses',
        method: 'post',
        data,
    });
}
export function deleteCourse(id: number) {
    return request({
        url: '/api/user/courses/' + id,
        method: 'delete',
    });
}
