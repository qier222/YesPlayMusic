// 收藏单曲到歌单 从歌单删除歌曲

module.exports = async (query, request) => {
  query.cookie.os = 'pc'
  const tracks = query.tracks.split(',')
  const data = {
    op: query.op, // del,add
    pid: query.pid, // 歌单id
    trackIds: JSON.stringify(tracks), // 歌曲id
    imme: 'true',
  }

  try {
    const res = await request(
      'POST',
      `https://music.163.com/api/playlist/manipulate/tracks`,
      data,
      {
        crypto: 'weapi',
        cookie: query.cookie,
        proxy: query.proxy,
        realIP: query.realIP,
      },
    )
    return {
      status: 200,
      body: {
        ...res,
      },
    }
  } catch (error) {
    if (error.body.code === 512) {
      return request(
        'POST',
        `https://music.163.com/api/playlist/manipulate/tracks`,
        {
          op: query.op, // del,add
          pid: query.pid, // 歌单id
          trackIds: JSON.stringify([...tracks, ...tracks]),
          imme: 'true',
        },
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      )
    } else if (error.body.code === 521) {
      return {
        status: 200,
        body: error.body,
      }
    }
  }
}
