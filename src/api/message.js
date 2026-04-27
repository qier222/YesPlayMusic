import request from '@/utils/request';

/**
 * 获取私信列表（最近私信的用户）
 * 说明 : 登录后调用此接口 , 可获取私信列表
 * - offset : 偏移数量，用于分页，默认为 0
 * - limit : 返回数量，默认为 30
 */
export function getPrivateMsgList(params = {}) {
  return request({
    url: '/msg/private/users',
    method: 'get',
    params: {
      offset: params.offset || 0,
      limit: params.limit || 30,
      timestamp: new Date().getTime(),
    },
  });
}

/**
 * 获取与某人的私信历史
 * 说明 : 登录后调用此接口 , 可获取与某人的私信历史
 * - uid : 用户 id
 * - before : 分页参数, 上一条私信的 timestamp, 默认为 0
 * - limit : 返回数量，默认为 30
 */
export function getPrivateMsgHistory(params) {
  return request({
    url: '/msg/private/history',
    method: 'get',
    params: {
      uid: params.uid,
      before: params.before || 0,
      limit: params.limit || 30,
      timestamp: new Date().getTime(),
    },
  });
}

/**
 * 获取最近联系人
 * 说明 : 登录后调用此接口 , 可获取最近联系人
 */
export function getRecentContacts() {
  return request({
    url: '/msg/recentcontact/get',
    method: 'get',
    params: {
      timestamp: new Date().getTime(),
    },
  });
}

/**
 * 发送文字私信
 * 说明 : 登录后调用此接口 , 可发送文字私信
 * - user_ids : 用户 id
 * - msg : 消息内容
 */
export function sendTextMsg(params) {
  return request({
    url: '/send/text',
    method: 'get',
    params: {
      user_ids: params.user_ids,
      msg: params.msg,
      timestamp: new Date().getTime(),
    },
  });
}

/**
 * 发送歌曲私信
 * 说明 : 登录后调用此接口 , 可发送歌曲私信
 * - user_ids : 用户 id
 * - id : 歌曲 id
 * - msg : 消息内容（可选）
 */
export function sendSongMsg(params) {
  return request({
    url: '/send/song',
    method: 'get',
    params: {
      user_ids: params.user_ids,
      id: params.id,
      msg: params.msg || '',
      timestamp: new Date().getTime(),
    },
  });
}

/**
 * 发送歌单私信
 * 说明 : 登录后调用此接口 , 可发送歌单私信
 * - user_ids : 用户 id
 * - playlist : 歌单 id
 * - msg : 消息内容（可选）
 */
export function sendPlaylistMsg(params) {
  return request({
    url: '/send/playlist',
    method: 'get',
    params: {
      user_ids: params.user_ids,
      playlist: params.playlist,
      msg: params.msg || '',
      timestamp: new Date().getTime(),
    },
  });
}

/**
 * 获取关注列表（我关注的人）
 * 说明 : 登录后调用此接口 , 可获取关注列表
 * - uid : 用户 id
 * - offset : 偏移数量，默认为 0
 * - limit : 返回数量，默认为 30
 */
export function getUserFollows(params) {
  return request({
    url: `/user/follows`,
    method: 'get',
    params: {
      uid: params.uid,
      offset: params.offset || 0,
      limit: params.limit || 30,
      timestamp: new Date().getTime(),
    },
  });
}

/**
 * 获取粉丝列表（关注我的人）
 * 说明 : 登录后调用此接口 , 可获取粉丝列表
 * - uid : 用户 id
 * - offset : 偏移数量，默认为 0
 * - limit : 返回数量，默认为 30
 */
export function getUserFolloweds(params) {
  return request({
    url: `/user/followeds`,
    method: 'get',
    params: {
      uid: params.uid,
      offset: params.offset || 0,
      limit: params.limit || 30,
      timestamp: new Date().getTime(),
    },
  });
}

/**
 * 关注/取消关注用户
 * 说明 : 登录后调用此接口 , 可关注/取消关注用户
 * - id : 用户 id
 * - t : 1 为关注 , 0 为取消关注
 */
export function followUser(params) {
  return request({
    url: '/follow',
    method: 'get',
    params: {
      id: params.id,
      t: params.t,
      timestamp: new Date().getTime(),
    },
  });
}
