import request from "@/utils/request";

export function mvDetail(mvid) {
  return request({
    url: "/mv/detail",
    method: "get",
    params: {
      mvid,
    },
  });
}

export function mvUrl(params) {
  // 必选参数 : id: mv id
  // 可选参数 : r: 分辨率,默认1080,可从 /mv/detail 接口获取分辨率列表
  return request({
    url: "/mv/url",
    method: "get",
    params,
  });
}

export function simiMv(mvid) {
  return request({
    url: "/simi/mv",
    method: "get",
    params: { mvid },
  });
}
