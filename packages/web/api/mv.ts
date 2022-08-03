import {
  FetchMVResponse,
  FetchMVParams,
  FetchMVUrlParams,
  FetchMVUrlResponse,
} from '@/shared/api/MV'
import request from '@/web/utils/request'

// 获取 mv 数据
export function fetchMV(params: FetchMVParams): Promise<FetchMVResponse> {
  return request({
    url: '/mv/detail',
    method: 'get',
    params: {
      mvid: params.mvid,
      timestamp: new Date().getTime(),
    },
  })
}

// mv 地址
export function fetchMVUrl(
  params: FetchMVUrlParams
): Promise<FetchMVUrlResponse> {
  return request({
    url: '/mv/url',
    method: 'get',
    params,
  })
}

/**
 * 相似 mv
 * 说明 : 调用此接口 , 传入 mvid 可获取相似 mv
 * @param {number} mvid
 */
export function simiMv(mvid) {
  return request({
    url: '/simi/mv',
    method: 'get',
    params: { mvid },
  })
}

/**
 * 收藏/取消收藏 MV
 * 说明 : 调用此接口,可收藏/取消收藏 MV
 * - mvid: mv id
 * - t: 1 为收藏,其他为取消收藏
 * @param {Object} params
 * @param {number} params.mvid
 * @param {number=} params.t
 */

export function likeAMV(params) {
  params.timestamp = new Date().getTime()
  return request({
    url: '/mv/sub',
    method: 'post',
    params,
  })
}
