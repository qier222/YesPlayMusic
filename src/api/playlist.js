import request from "@/utils/request";

export function recommendPlaylist(params) {
  // limit: 取出数量 , 默认为 30
  return request({
    url: "/personalized",
    method: "get",
    params,
  });
}
export function dailyRecommendPlaylist(params) {
  // limit: 取出数量 , 默认为 30
  return request({
    url: "/recommend/resource",
    method: "get",
    params,
  });
}

export function getPlaylistDetail(id, noCache = false) {
  let params = { id };
  if (noCache) params.timestamp = new Date().getTime();
  return request({
    url: "/playlist/detail",
    method: "get",
    params,
  });
}

export function highQualityPlaylist(params) {
  // 可选参数: cat: tag, 比如 " 华语 "、" 古风 " 、" 欧美 "、" 流行 ", 默认为 "全部", 可从精品歌单标签列表接口获取(/playlist/highquality / tags)
  // limit: 取出歌单数量 , 默认为 20
  // before: 分页参数,取上一页最后一个歌单的 updateTime 获取下一页数据
  return request({
    url: "/top/playlist/highquality",
    method: "get",
    params,
  });
}

export function topPlaylist(params) {
  //  可选参数 : order: 可选值为 'new' 和 'hot', 分别对应最新和最热 , 默认为 'hot'
  // cat:cat: tag, 比如 " 华语 "、" 古风 " 、" 欧美 "、" 流行 ", 默认为 "全部",可从歌单分类接口获取(/playlist/catlist)
  // limit: 取出歌单数量 , 默认为 50
  // offset: 偏移数量 , 用于分页 , 如 :( 评论页数 -1)*50, 其中 50 为 limit 的值
  return request({
    url: "/top/playlist",
    method: "get",
    params,
  });
}

export function playlistCatlist() {
  return request({
    url: "/playlist/catlist",
    method: "get",
  });
}

export function toplists() {
  return request({
    url: "/toplist",
    method: "get",
  });
}

export function subscribePlaylist(params) {
  // 必选参数 :
  // t : 类型,1:收藏,2:取消收藏 id : 歌单 id
  return request({
    url: "/playlist/subscribe",
    method: "get",
    params,
  });
}
