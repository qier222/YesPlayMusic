const {
  cookieToJson
} = require('../util/index');
const request = require('../util/request');
const clc = require('cli-color');

const table = {
  // 注意 /album 这样的路由必须放在 /album/new 这样的路由后面
  '/top/playlist/highquality': require('../module/top_playlist_highquality'),
  '/album/detail/dynamic': require('../module/album_detail_dynamic'),
  '/recommend/resource': require('../module/recommend_resource'),
  '/playlist/subscribe': require('../module/playlist_subscribe'),
  '/user/cloud/detail': require('../module/user_cloud_detail'),
  '/playlist/catlist': require('../module/playlist_catlist'),
  '/playlist/detail': require('../module/playlist_detail'),
  '/login/cellphone': require('../module/login_cellphone'),
  '/playlist/delete': require('../module/playlist_delete'),
  '/playlist/create': require('../module/playlist_create'),
  '/playlist/tracks': require('../module/playlist_tracks'),
  '/recommend/songs': require('../module/recommend_songs'),
  '/login/qr/create': require('../module/login_qr_create'),
  '/login/qr/check': require('../module/login_qr_check'),
  '/user/cloud/del': require('../module/user_cloud_del'),
  '/toplist/artist': require('../module/toplist_artist'),
  '/artist/sublist': require('../module/artist_sublist'),
  '/login/refresh': require('../module/login_refresh'),
  '/user/playlist': require('../module/user_playlist'),
  '/album/sublist': require('../module/album_sublist'),
  '/artist/album': require('../module/artist_album'),
  '/personalized': require('../module/personalized'),
  '/top/playlist': require('../module/top_playlist'),
  '/user/account': require('../module/user_account'),
  '/login/qr/key': require('../module/login_qr_key'),
  '/daily_signin': require('../module/daily_signin'),
  '/simi/artist': require('../module/simi_artist'),
  '/song/detail': require('../module/song_detail'),
  '/user/detail': require('../module/user_detail'),
  '/personal_fm': require('../module/personal_fm'),
  '/artist/sub': require('../module/artist_sub'),
  '/mv/sublist': require('../module/mv_sublist'),
  '/user/cloud': require('../module/user_cloud'),
  '/album/new': require('../module/album_new'),
  '/album/sub': require('../module/album_sub'),
  '/mv/detail': require('../module/mv_detail'),
  '/artist/mv': require('../module/artist_mv'),
  '/song/url': require('../module/song_url'),
  '/top/song': require('../module/top_song'),
  '/scrobble': require('../module/scrobble'),
  '/likelist': require('../module/likelist'),
  '/fm_trash': require('../module/fm_trash'),
  '/artists': require('../module/artists'),
  '/simi/mv': require('../module/simi_mv'),
  '/toplist': require('../module/toplist'),
  '/logout': require('../module/logout'),
  '/mv/url': require('../module/mv_url'),
  '/mv/sub': require('../module/mv_sub'),
  '/search': require('../module/search'),
  '/lyric': require('../module/lyric'),
  '/cloud': require('../module/cloud'),
  '/album': require('../module/album'),
  '/login': require('../module/login'),
  '/like': require('../module/like'),
}

const handleRequest = (req, res, func) => {
  if (typeof req.query.cookie === 'string') {
    req.query.cookie = cookieToJson(req.query.cookie);
  }
  let query = Object.assign(
    {},
    { cookie: req.cookies },
    req.query,
    req.body,
    req.files,
  )
  return func(query, request)
    .then((answer) => {
      console.log(`${clc.redBright('[NetEase API]')} OK, ${decodeURIComponent(req.originalUrl)}`);
      res.append('Set-Cookie', answer.cookie);
      res.status(answer.status).send(answer.body);
    })
    .catch((answer) => {
      console.log(`${clc.redBright('[NetEase API]')} ERROR 🚫 `, decodeURIComponent(req.originalUrl), {
        status: answer.status,
        body: answer.body,
      });
      if (answer.body.code == '301') answer.body.msg = '需要登录';
      res.append('Set-Cookie', answer.cookie);
      res.status(answer.status).send(answer.body);
    });
}

let defaultExport = {};

for (const [route, func] of Object.entries(table)) {
  defaultExport[route] = (req, res) => {
    return handleRequest(req, res, func);
  };
};

export default defaultExport;
