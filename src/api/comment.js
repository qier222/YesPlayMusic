import request from '@/utils/request';

/**
 * 获取评论
 * 必选
 * @param {number} id - 音乐 id
 * @param {number} type - 资源类型, 对应一下: 0:歌曲, 1:MV, 2:歌单, 3:专辑,
 *     4:电台, 5:视频,
 * 可选
 * @param {number} pageNo - 分页, 默认为1
 * @param {number} pageSize - 每页多少条, 默认20
 * @param {number} sortType - 排序方式， 1:推荐, 2:热度, 3:时间
 * @param {number} cursor - 当sortType为 3
 *     时且页数不是第一页时需传入,值为上一条数据的 time
 */
export function getComment(params) {
  return request({
    url : '/comment/new',
    method : 'get',
    params,
  });
}

/**
 * 获取楼层评论
 * 必选
 * @param {number} id - 音乐 id
 * @param {number} type - 资源类型, 对应一下: 0:歌曲, 1:MV, 2:歌单, 3:专辑,
 *     4:电台, 5:视频,
 * @param {number} parentCommentId - 楼层评论id
 * 可选
 * @param {number} limit - 评论数量, 默认20
 */
export function getFloorComment(params) {
  return request({
    url : '/comment/floor',
    method : 'get',
    params,
  });
}

/**
 * 发送/回复/删除评论
 * @param {number} t - 1:发送, 2:回复, 0:删除
 * @param {number} type - 资源类型, 对应一下: 0:歌曲, 1:MV, 2:歌单, 3:专辑,
 *     4:电台, 5:视频,
 * @param {number} id - 音乐id
 * @param {string} content - 评论内容（发送评论时是内容，删除时是内容id）
 * @param {number} commentId - 回复的评论的id（回复时必选）
 */
export function sendOrReplyOrDeleteComment(params) {
  return request({
    url : '/comment',
    method : 'get',
    params,
  });
}

/**
 * 点赞/取消赞
 * @param {number} id - 资源id
 * @param {number} cid - 评论id
 * @param {number} t - 1:点赞, 0取消点赞
 * @param {number} type -  资源类型, 对应一下: 0:歌曲, 1:MV, 2:歌单, 3:专辑,
 *     4:电台, 5:视频,
 * @returns
 */
export function likeOrDislikeComment(params) {
  return request({
    url : '/comment/like',
    method : 'get',
    params,
  });
}
