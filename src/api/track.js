import store from '@/store';
import request from '@/utils/request';
import { mapTrackPlayableStatus } from '@/utils/common';
import {
  cacheTrackDetail,
  getTrackDetailFromCache,
  cacheLyric,
  getLyricFromCache,
} from '@/utils/db';

/**
 * 获取音乐 url
 * 说明 : 使用歌单详情接口后 , 能得到的音乐的 id, 但不能得到的音乐 url, 调用此接口, 传入的音乐 id( 可多个 , 用逗号隔开 ), 可以获取对应的音乐的 url,
 * !!!未登录状态返回试听片段(返回字段包含被截取的正常歌曲的开始时间和结束时间)
 * @param {string} id - 音乐的 id，例如 id=405998841,33894312
 */
export function getMP3(id) {
  if (id.slice && id.slice(0, 2) == 'BV') {
    let bvcid = id.split('_');
    return fetch(
      `http://127.0.0.1:10764/song/url?bvid=${bvcid[0]}&cid=${bvcid[1]}`
    )
      .then(resp => resp.json())
      .then(data => {
        return {
          data: [
            {
              url: data['url'],
              br: 128000,
            },
          ],
        };
      });
  }

  const getBr = () => {
    // 当返回的 quality >= 400000时，就会优先返回 hi-res
    const quality = store.state.settings?.musicQuality ?? '320000';
    return quality === 'flac' ? '350000' : quality;
  };

  return request({
    url: '/song/url',
    method: 'get',
    params: {
      id,
      br: getBr(),
    },
  });
}

/**
 * 获取歌曲详情
 * 说明 : 调用此接口 , 传入音乐 id(支持多个 id, 用 , 隔开), 可获得歌曲详情(注意:歌曲封面现在需要通过专辑内容接口获取)
 * @param {string} ids - 音乐 id, 例如 ids=405998841,33894312
 */
export function getTrackDetail(ids) {
  if (ids.slice && ids.slice(0, 2) == 'BV') {
    let bvcid = ids.split('_');
    return fetch(
      `http://127.0.0.1:10764/song/detail?bvid=${bvcid[0]}&cid=${bvcid[1]}`
    )
      .then(resp => resp.json())
      .then(data => {
        return {
          songs: [
            {
              id: ids,
              name: data['title'],
              ar: [
                {
                  id: data['artist']['id'],
                  name: data['artist']['name'],
                  tns: [],
                  alias: [],
                },
              ],
              dt: data['duration'], // TODO: 依然出现为undefined情况
              al: {
                picUrl: data['cover'],
                id: '0',
                name: 'bilibili',
                tns: [],
              },
            },
          ],
        };
      });
  }

  if (typeof ids !== 'number' && typeof ids !== 'string') {
    console.log(ids);
    return new Promise(resolve => {
      resolve({
        songs: [
          {
            url: ids['url'],
            dt: ids['duration'],
            id: ids['id'],
            name: ids['name'],
            ar: [
              {
                id: 0,
                name: '',
                tns: [],
                alias: [],
              },
            ],
            al: {
              picUrl: ids['cover'],
              id: '0',
              name: ids['album'],
              tns: [],
            },
          },
        ],
      });
    });
  }

  const fetchLatest = () => {
    return request({
      url: '/song/detail',
      method: 'get',
      params: {
        ids,
      },
    }).then(data => {
      data.songs.map(song => {
        const privileges = data.privileges.find(t => t.id === song.id);
        cacheTrackDetail(song, privileges);
      });
      data.songs = mapTrackPlayableStatus(data.songs, data.privileges);
      return data;
    });
  };
  fetchLatest();

  let idsInArray = [String(ids)];
  if (typeof ids === 'string') {
    idsInArray = ids.split(',');
  }

  return getTrackDetailFromCache(idsInArray).then(result => {
    if (result) {
      result.songs = mapTrackPlayableStatus(result.songs, result.privileges);
    }
    return result ?? fetchLatest();
  });
}

/**
 * 获取歌词
 * 说明 : 调用此接口 , 传入音乐 id 可获得对应音乐的歌词 ( 不需要登录 )
 * @param {number} id - 音乐 id
 */
export function getLyric(id) {
  if (id.slice && id.slice(0, 2) == 'BV') {
    return new Promise(resolve => {
      resolve(
        '{"uncollected":true,"sgc":true,"sfy":true,"qfy":true,"needDesc":true,"lrc":{"version":1,"lyric":""},"code":200,"briefDesc":null}'
      );
    });
  }
  const fetchLatest = () => {
    return request({
      url: '/lyric',
      method: 'get',
      params: {
        id,
      },
    }).then(result => {
      cacheLyric(id, result);
      return result;
    });
  };

  fetchLatest();

  return getLyricFromCache(id).then(result => {
    return result ?? fetchLatest();
  });
}

/**
 * 新歌速递
 * 说明 : 调用此接口 , 可获取新歌速递
 * @param {number} type - 地区类型 id, 对应以下: 全部:0 华语:7 欧美:96 日本:8 韩国:16
 */
export function topSong(type) {
  return request({
    url: '/top/song',
    method: 'get',
    params: {
      type,
    },
  });
}

/**
 * 喜欢音乐
 * 说明 : 调用此接口 , 传入音乐 id, 可喜欢该音乐
 * - id - 歌曲 id
 * - like - 默认为 true 即喜欢 , 若传 false, 则取消喜欢
 * @param {Object} params
 * @param {number} params.id
 * @param {boolean=} [params.like]
 */
export function likeATrack(params) {
  params.timestamp = new Date().getTime();
  return request({
    url: '/like',
    method: 'get',
    params,
  });
}

/**
 * 听歌打卡
 * 说明 : 调用此接口 , 传入音乐 id, 来源 id，歌曲时间 time，更新听歌排行数据
 * - id - 歌曲 id
 * - sourceid - 歌单或专辑 id
 * - time - 歌曲播放时间,单位为秒
 * @param {Object} params
 * @param {number} params.id
 * @param {number} params.sourceid
 * @param {number=} params.time
 */
export function scrobble(params) {
  params.timestamp = new Date().getTime();
  return request({
    url: '/scrobble',
    method: 'get',
    params,
  });
}
