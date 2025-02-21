import request from '@/utils/request';

export const run = (data: any) => {
    return request({
        url: '/api/run',
        method: 'post',
        data,
    });
};
