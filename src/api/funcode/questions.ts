import request from '@/utils/request'

// 查询编程问题列表
export function listQuestions(query:any) {
  return request({
    url: '/system/questions/list',
    method: 'get',
    params: query
  })
}

// 查询编程问题详细
export function getQuestions(id:any) {
  return request({
    url: '/system/questions/' + id,
    method: 'get'
  })
}

// 新增编程问题
export function addQuestions(data:any) {
  return request({
    url: '/system/questions',
    method: 'post',
    data: data
  })
}

// 修改编程问题
export function updateQuestions(data:any) {
  return request({
    url: '/system/questions',
    method: 'put',
    data: data
  })
}

// 删除编程问题
export function delQuestions(id:any) {
  return request({
    url: '/system/questions/' + id,
    method: 'delete'
  })
}



