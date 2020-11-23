// 评论

module.exports = (query, request) => {
  query.cookie.os = 'pc';
  query.type = {
    0: 'R_SO_4_', //  歌曲
    1: 'R_MV_5_', //  MV
    2: 'A_PL_0_', //  歌单
    3: 'R_AL_3_', //  专辑
    4: 'A_DJ_1_', //  电台,
    5: 'R_VI_62_', //  视频
    6: 'A_EV_2_', //  动态
  }[query.type];
  const threadId = query.type + query.id;
  const pageSize = query.pageSize || 20;
  const pageNo = query.pageNo || 1;
  const data = {
    threadId: threadId, //'R_SO_4_863481066',
    pageNo,
    showInner: query.showInner || true,
    pageSize,
    cursor:
      +query.sortType === 3 ? query.cursor || '0' : (pageNo - 1) * pageSize,
    sortType: query.sortType || 1, //1:按推荐排序,2:按热度排序,3:按时间排序
  };
  return request(
    'POST',
    `https://music.163.com/api/v2/resource/comments`,
    data,
    {
      crypto: 'eapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
      url: '/api/v2/resource/comments',
    },
  );
};
