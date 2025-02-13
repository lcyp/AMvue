import request from '@/utils/request'

// 查询课程安排列表
export function listCourseSchedule(query) {
  return request({
    url: '/courseSchedule/courseSchedule/list',
    method: 'get',
    params: query
  })
}

// 查询课程安排详细
export function getCourseSchedule(id) {
  return request({
    url: '/courseSchedule/courseSchedule/' + id,
    method: 'get'
  })
}

// 新增课程安排
export function addCourseSchedule(data) {
  return request({
    url: '/courseSchedule/courseSchedule',
    method: 'post',
    data: data
  })
}

// 修改课程安排
export function updateCourseSchedule(data) {
  return request({
    url: '/courseSchedule/courseSchedule',
    method: 'put',
    data: data
  })
}

// 删除课程安排
export function delCourseSchedule(id) {
  return request({
    url: '/courseSchedule/courseSchedule/' + id,
    method: 'delete'
  })
}
