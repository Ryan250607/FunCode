import request from '@/utils/request'

// 查询阅卷列表
export function listRecords(query:any) {
  return request({
    url: '/system/records/list',
    method: 'get',
    params: query
  })
}

// 查询阅卷列表
export function getRecords(id:number) {
  return request({
    url: '/system/records/' + id,
    method: 'get'
  })
}

// 查询阅卷详情
export function getStudentAnswer(id:number) {
  return request({
    url: '/grade/detail/' + id,
    method: 'get'
  })
}

// 新增阅卷
export function addRecords(data:any) {
  return request({
    url: '/system/records',
    method: 'post',
    data: data
  })
}

// 修改阅卷
export function updateRecords(data:any) {
  return request({
    url: '/system/records',
    method: 'put',
    data: data
  })
}

// 删除阅卷
export function delRecords(id:number) {
  return request({
    url: '/system/records/' + id,
    method: 'delete'
  })
}

