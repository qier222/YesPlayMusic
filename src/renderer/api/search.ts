import request from '@/renderer/utils/request'
import {
  SearchParams,
  SearchResponse,
  SearchTypes,
  MultiMatchSearchParams,
  MultiMatchSearchResponse,
} from '@/shared/api/Search'

// 搜索
export function search(params: SearchParams): Promise<SearchResponse> {
  return request({
    url: '/search',
    method: 'get',
    params: {
      ...params,
      type: SearchTypes[params.type ?? SearchTypes.All],
    },
  })
}

// 搜索多重匹配
export function multiMatchSearch(
  params: MultiMatchSearchParams
): Promise<MultiMatchSearchResponse> {
  return request({
    url: '/search/multimatch',
    method: 'get',
    params: params,
  })
}
