import request from "@/utils/request";
import { mapTrackPlayableStatus } from "@/utils/common";
import store from "@/store";

export function getMP3(id) {
  let br =
    store.state.settings?.musicQuality !== undefined
      ? store.state.settings.musicQuality
      : 320000;
  return request({
    url: "/song/url",
    method: "get",
    params: {
      id,
      br,
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
  }).then((data) => {
    data.songs = mapTrackPlayableStatus(data.songs);
    return data;
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

export function likeATrack(params) {
  // 必选参数: id: 歌曲 id
  // 可选参数 : like: 布尔值 , 默认为 true 即喜欢 , 若传 false, 则取消喜欢
  params.timestamp = new Date().getTime();
  return request({
    url: "/like",
    method: "get",
    params,
  });
}

export function scrobble(params) {
  // 必选参数 : id: 歌曲 id, sourceid: 歌单或专辑 id
  // 可选参数 : time: 歌曲播放时间,单位为秒
  params.timestamp = new Date().getTime();
  return request({
    url: "/scrobble",
    method: "get",
    params,
  });
}
