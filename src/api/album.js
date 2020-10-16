import request from "@/utils/request";
import { mapTrackPlayableStatus } from "@/utils/common";

export function getAlbum(id) {
  return request({
    url: "/album",
    method: "get",
    params: {
      id,
    },
  }).then((data) => {
    data.songs = mapTrackPlayableStatus(data.songs);
    return data;
  });
}

export function newAlbums(params) {
  // limit : 返回数量 , 默认为 30
  // offset : 偏移数量，用于分页 , 如 :( 页数 -1)*30, 其中 30 为 limit 的值 , 默认为 0
  // area : ALL:全部,ZH:华语,EA:欧美,KR:韩国,JP:日本
  return request({
    url: "/album/new",
    method: "get",
    params,
  });
}
