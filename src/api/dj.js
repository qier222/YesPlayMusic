import request from '@/utils/request';

/**
 * 获取电台简介
 * 说明 ： 调用此接口 ，传入电台 rid， 即可获得电台内容
 * @param {number} rid
 */
export function getDjDetail(rid) {
  return request({
    url: '/dj/detail',
    method: 'get',
    params: {
      rid,
    },
  });
}

/**
 * 获取电台节目列表
 * 说明 : 调用此接口，可获取电台节目
 * - limit - 返回数量 , 默认为 30
 * - offset - 偏移数量，用于分页 , 如 :( 页数 -1)*30, 其中 30 为 limit 的值 , 默认为 0
 * - asc - 排序方式,默认为 false (新 => 老 ) 设置 true 可改为 老 => 新
 * @param {number} rid
 * @param {Object} params
 * @param {number} params.limit
 * @param {number} params.offset
 * @param {number} params.asc
 */
export function getDjPrograms(rid, params) {
  return request({
    url: '/dj/program',
    method: 'get',
    params: {
      rid,
      ...params,
    },
  });
}

/**
 * 获取电台节目详情
 * 说明 : 调用此接口传入电台节目id,可获得电台节目详情
 * @param id
 */
export function getDjProgramDetail(id) {
  return request({
    url: '/dj/program/detail',
    method: 'get',
    params: {
      id,
    },
  });
}
