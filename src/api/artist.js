import request from '@/utils/request';
import { mapTrackPlayableStatus } from '@/utils/common';
import { isAccountLoggedIn } from '@/utils/auth';
import { getTrackDetail } from '@/api/track';

/**
 * 获取歌手单曲
 * 说明 : 调用此接口 , 传入歌手 id, 可获得歌手部分信息和热门歌曲
 * @param {number} id - 歌手 id, 可由搜索接口获得
 */
export function getArtist(id) {
  return request({
    url: '/artists',
    method: 'get',
    params: {
      id,
      timestamp: new Date().getTime(),
    },
  }).then(async data => {
    if (!isAccountLoggedIn()) {
      const trackIDs = data.hotSongs.map(t => t.id);
      const tracks = await getTrackDetail(trackIDs.join(','));
      data.hotSongs = tracks.songs;
      return data;
    }
    data.hotSongs = mapTrackPlayableStatus(data.hotSongs);
    return data;
  });
}

/**
 * 获取歌手专辑
 * 说明 : 调用此接口 , 传入歌手 id, 可获得歌手专辑内容
 * - id: 歌手 id
 * - limit: 取出数量 , 默认为 50
 * - offset: 偏移数量 , 用于分页 , 如 :( 页数 -1)*50, 其中 50 为 limit 的值 , 默认为 0
 * @param {Object} params
 * @param {number} params.id
 * @param {number=} params.limit
 * @param {number=} params.offset
 */
export function getArtistAlbum(params) {
  return request({
    url: '/artist/album',
    method: 'get',
    params,
  });
}

/**
 * 歌手榜
 * 说明 : 调用此接口 , 可获取排行榜中的歌手榜
 * - type : 地区
 * 1: 华语
 * 2: 欧美
 * 3: 韩国
 * 4: 日本
 * @param {number=} type
 */
export function toplistOfArtists(type = null) {
  let params = {};
  if (type) {
    params.type = type;
  }
  return request({
    url: '/toplist/artist',
    method: 'get',
    params,
  });
}
/**
 * 获取歌手 mv
 * 说明 : 调用此接口 , 传入歌手 id, 可获得歌手 mv 信息 , 具体 mv 播放地址可调 用/mv传入此接口获得的 mvid 来拿到 , 如 : /artist/mv?id=6452,/mv?mvid=5461064
 * @param {number} params.id 歌手 id, 可由搜索接口获得
 * @param {number} params.offset
 * @param {number} params.limit
 */
export function artistMv(params) {
  return request({
    url: '/artist/mv',
    method: 'get',
    params,
  });
}

/**
 * 收藏歌手
 * 说明 : 调用此接口 , 传入歌手 id, 可收藏歌手
 * - id: 歌手 id
 * - t: 操作,1 为收藏,其他为取消收藏
 * @param {Object} params
 * @param {number} params.id
 * @param {number} params.t
 */
export function followAArtist(params) {
  return request({
    url: '/artist/sub',
    method: 'post',
    params,
  });
}

/**
 * 相似歌手
 * 说明 : 调用此接口 , 传入歌手 id, 可获得相似歌手
 * - id: 歌手 id
 * @param {number} id
 */
export function similarArtists(id) {
  return request({
    url: '/simi/artist',
    method: 'post',
    params: { id },
  });
}
