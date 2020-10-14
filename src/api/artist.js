import request from "@/utils/request";

export function getArtist(id) {
  return request({
    url: "/artists",
    method: "get",
    params: {
      id,
    },
  });
}
export function getArtistAlbum(params) {
  // 必选参数 : id: 歌手 id
  // 可选参数 : limit: 取出数量 , 默认为 50
  // offset: 偏移数量 , 用于分页 , 如 :( 页数 -1)*50, 其中 50 为 limit 的值 , 默认 为 0
  return request({
    url: "/artist/album",
    method: "get",
    params,
  });
}

export function toplistOfArtists(type = null) {
  // type : 地区
  // 1: 华语
  // 2: 欧美
  // 3: 韩国
  // 4: 日本
  return request({
    url: "/toplist/artist",
    method: "get",
    params: {
      type,
    },
  });
}

export function artistMv(id) {
  return request({
    url: "/artist/mv",
    method: "get",
    params: {
      id,
    },
  });
}
