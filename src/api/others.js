import request from "@/utils/request";

export function search(params) {
  return request({
    url: "/search",
    method: "get",
    params,
  });
}
