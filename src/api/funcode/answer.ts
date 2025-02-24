import request from '@/utils/request'

// 查询学生回答记录列表
export function listAnswers(query:any) {
  return request({
    url: '/system/answers/list',
    method: 'get',
    params: query
  })
}
export function listAnswersDto(query:any) {
  return request({
    url: '/system/answers/list/course',
    method: 'get',
    params: query
  })
}

// 查询学生回答记录详细
export function getAnswers(id:number) {
  return request({
    url: '/system/answers/' + id,
    method: 'get'
  })
}

// 新增学生回答记录
export function addAnswers(data:any) {
  return request({
    url: '/system/answers',
    method: 'post',
    data: data
  })
}

// 修改学生回答记录
export function updateAnswers(data:any) {
  return request({
    url: '/system/answers',
    method: 'put',
    data: data
  })
}

// 删除学生回答记录
export function delAnswers(id:number) {
  return request({
    url: '/system/answers/' + id,
    method: 'delete'
  })
}
