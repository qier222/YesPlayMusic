const express = require('express')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const fs = require('fs')
const path = require('path')

import { join } from 'path'
import logger from '@main/core/logger'

const packagePath = join(__dirname, '../../node_modules/NeteaseCloudMusicApi')
const { cookieToJson } = require(`${packagePath}/util/index`)
const request = require(`${packagePath}/util/request`)

// const table = {
//   // 注意 /album 这样的路由必须放在 /album/new 这样的路由后面
//   '/top/playlist/highquality': require(`${packagePath}/module/top_playlist_highquality`),
//   '/album/detail/dynamic': require(`${packagePath}/module/album_detail_dynamic`),
//   '/recommend/resource': require(`${packagePath}/module/recommend_resource`),
//   '/playlist/subscribe': require(`${packagePath}/module/playlist_subscribe`),
//   '/user/cloud/detail': require(`${packagePath}/module/user_cloud_detail`),
//   '/playlist/catlist': require(`${packagePath}/module/playlist_catlist`),
//   '/playlist/detail': require(`${packagePath}/module/playlist_detail`),
//   '/login/cellphone': require(`${packagePath}/module/login_cellphone`),
//   '/playlist/delete': require(`${packagePath}/module/playlist_delete`),
//   '/playlist/create': require(`${packagePath}/module/playlist_create`),
//   '/playlist/tracks': require(`${packagePath}/module/playlist_tracks`),
//   '/recommend/songs': require(`${packagePath}/module/recommend_songs`),
//   '/login/qr/create': require(`${packagePath}/module/login_qr_create`),
//   '/login/qr/check': require(`${packagePath}/module/login_qr_check`),
//   '/user/cloud/del': require(`${packagePath}/module/user_cloud_del`),
//   '/toplist/artist': require(`${packagePath}/module/toplist_artist`),
//   '/artist/sublist': require(`${packagePath}/module/artist_sublist`),
//   '/login/refresh': require(`${packagePath}/module/login_refresh`),
//   '/user/playlist': require(`${packagePath}/module/user_playlist`),
//   '/album/sublist': require(`${packagePath}/module/album_sublist`),
//   '/login/status': require(`${packagePath}/module/login_status`),
//   '/artist/album': require(`${packagePath}/module/artist_album`),
//   '/personalized': require(`${packagePath}/module/personalized`),
//   '/top/playlist': require(`${packagePath}/module/top_playlist`),
//   '/user/account': require(`${packagePath}/module/user_account`),
//   '/login/qr/key': require(`${packagePath}/module/login_qr_key`),
//   '/daily_signin': require(`${packagePath}/module/daily_signin`),
//   '/simi/artist': require(`${packagePath}/module/simi_artist`),
//   '/song/detail': require(`${packagePath}/module/song_detail`),
//   '/user/detail': require(`${packagePath}/module/user_detail`),
//   '/personal_fm': require(`${packagePath}/module/personal_fm`),
//   '/artist/sub': require(`${packagePath}/module/artist_sub`),
//   '/mv/sublist': require(`${packagePath}/module/mv_sublist`),
//   '/user/cloud': require(`${packagePath}/module/user_cloud`),
//   '/album/new': require(`${packagePath}/module/album_new`),
//   '/album/sub': require(`${packagePath}/module/album_sub`),
//   '/mv/detail': require(`${packagePath}/module/mv_detail`),
//   '/artist/mv': require(`${packagePath}/module/artist_mv`),
//   '/song/url': require(`${packagePath}/module/song_url`),
//   '/top/song': require(`${packagePath}/module/top_song`),
//   '/scrobble': require(`${packagePath}/module/scrobble`),
//   '/likelist': require(`${packagePath}/module/likelist`),
//   '/fm_trash': require(`${packagePath}/module/fm_trash`),
//   '/artists': require(`${packagePath}/module/artists`),
//   '/simi/mv': require(`${packagePath}/module/simi_mv`),
//   '/toplist': require(`${packagePath}/module/toplist`),
//   '/logout': require(`${packagePath}/module/logout`),
//   '/mv/url': require(`${packagePath}/module/mv_url`),
//   '/mv/sub': require(`${packagePath}/module/mv_sub`),
//   '/search': require(`${packagePath}/module/search`),
//   '/lyric': require(`${packagePath}/module/lyric`),
//   '/cloud': require(`${packagePath}/module/cloud`),
//   '/album': require(`${packagePath}/module/album`),
//   '/login': require(`${packagePath}/module/login`),
//   '/like': require(`${packagePath}/module/like`),
// }

const handleRequest = (req, res, func) => {
  if (typeof req.query.cookie === 'string') {
    req.query.cookie = cookieToJson(req.query.cookie)
  }
  let query = Object.assign(
    {},
    { cookie: req.cookies },
    req.query,
    req.body,
    req.files
  )
  return func(query, request)
    .then(answer => {
      logger.debug(`[NetEase API] OK, ${decodeURIComponent(req.originalUrl)}`)
      // res.append('Set-Cookie', answer.cookie) // 在客户端手动存储cookie
      res.status(answer.status).send(answer.body)
    })
    .catch(answer => {
      console.log(
        `[NetEase API] ERROR 🚫 `,
        decodeURIComponent(req.originalUrl),
        {
          status: answer.status,
          body: answer.body,
        }
      )
      if (answer?.body?.code == '301') answer.body.msg = '需要登录'
      res.status(answer.status ?? 500).send(answer.body ?? answer)
    })
}

let routes = {}
// for (const [route, func] of Object.entries(table)) {
//   routes[route] = (req, res) => {
//     return handleRequest(req, res, func)
//   }
// }

fs.readdirSync(
  path.join(__dirname, '../../node_modules/NeteaseCloudMusicApi/module')
)
  .reverse()
  .forEach(file => {
    if (!file.endsWith('.js')) return
    let func = require(path.join(
      __dirname,
      '../../node_modules/NeteaseCloudMusicApi/module',
      file
    ))
    const route = '/' + file.replace(/\.js$/i, '').replace(/_/g, '/')

    routes[route] = (req, res) => {
      return handleRequest(req, res, func)
    }
  })

export function createNeteaseMusicApi() {
  // Integrate API
  const app = express()

  // CORS & Preflight request
  app.use((req, res, next) => {
    if (req.path !== '/' && !req.path.includes('.')) {
      res.set({
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Origin': req.headers.origin || '*',
        'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
        'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
        'Content-Type': 'application/json; charset=utf-8',
      })
    }
    req.method === 'OPTIONS' ? res.status(204).end() : next()
  })

  // cookie parser
  app.use((req, res, next) => {
    req.cookies = {}
    ;(req.headers.cookie || '').split(/\s*;\s*/).forEach(pair => {
      let crack = pair.indexOf('=')
      if (crack < 1 || crack == pair.length - 1) return
      req.cookies[decodeURIComponent(pair.slice(0, crack)).trim()] =
        decodeURIComponent(pair.slice(crack + 1)).trim()
    })
    next()
  })

  // body parser
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))

  app.use(fileUpload())

  // router
  Object.keys(routes).forEach(route => {
    app.use(route, routes[route])
  })

  const port = process.env.ELECTRON_NETEASE_API_PORT || 37481
  const host = '127.0.0.1'

  app.server = app.listen(port, host, () => {
    logger.info(
      `NetEase API server running @ http://${host ? host : 'localhost'}:${port}`
    )
  })

  return app
}
