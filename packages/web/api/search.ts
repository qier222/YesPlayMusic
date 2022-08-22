import request from '@/web/utils/request'
import {
  SearchParams,
  SearchResponse,
  SearchTypes,
  MultiMatchSearchParams,
  MultiMatchSearchResponse,
  FetchSearchSuggestionsParams,
  FetchSearchSuggestionsResponse,
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

// 搜索建议
export function fetchSearchSuggestions(
  params: FetchSearchSuggestionsParams
): Promise<FetchSearchSuggestionsResponse> {
  return request({
    url: '/search/suggest',
    method: 'get',
    params,
  })
}
