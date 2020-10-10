import request from "@/utils/request";

export function getMP3(id) {
  return request({
    url: "/song/url",
    method: "get",
    params: {
      id,
    },
  });
}

export function getTrackDetail(id) {
  return request({
    url: "/song/detail",
    method: "get",
    params: {
      ids: id,
    },
  });
}

export function getLyric(id) {
  return request({
    url: "/lyric",
    method: "get",
    params: {
      id: id,
    },
  });
}

export function topSong(type) {
  //   type: 地区类型 id,对应以下:
  // 全部:0
  // 华语:7
  // 欧美:96
  // 日本:8
  // 韩国:16
  return request({
    url: "/top/song",
    method: "get",
    params: {
      type,
    },
  });
}
