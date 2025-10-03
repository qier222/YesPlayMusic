export interface RequestBaseConfig {
  cookie?: string
  realIP?: string // IPv4/IPv6 filled in X-Real-IP
  proxy?: string // HTTP proxy
}

export interface MultiPageConfig {
  limit?: string | number
  offset?: string | number
}

export interface ImageUploadConfig {
  imgFile: {
    name: string
    data: string | Buffer
  }
  imgSize?: number
  imgX?: number
  imgY?: number
}

export interface APIBaseResponse {
  code: number
  cookie: string
  [index: string]: unknown
}

export interface Response<Body = APIBaseResponse> {
  status: number // The Http Response Code
  body: Body // API Response body
  cookie: string[]
}

export const enum SubAction {
  sub = 1,
  unsub = 0,
}

export function activate_init_profile(
  params: { nickname: string } & RequestBaseConfig,
): Promise<Response>

export function album(
  params: { id: string | number } & RequestBaseConfig,
): Promise<Response>

export function album_detail(
  params: { id: string | number } & RequestBaseConfig,
): Promise<Response>

export function album_detail_dynamic(
  params: { id: string | number } & RequestBaseConfig,
): Promise<Response>

export const enum AlbumListArea {
  all = 'ALL',
  zh = 'ZH',
  ea = 'EA',
  kr = 'KR',
  jp = 'JP',
}

export const enum ListOrder {
  hot = 'hot',
  new = 'new',
}

export function album_list(
  params: { area?: AlbumListArea; type: string } & MultiPageConfig &
    RequestBaseConfig,
): Promise<Response>

export const enum AlbumListStyleArea {
  zh = 'Z_H',
  ea = 'E_A',
  kr = 'KR',
  jp = 'JP',
}

export function album_list_style(
  params: { area?: AlbumListStyleArea } & MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function album_new(
  params: { area?: AlbumListArea } & MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function album_newest(params: RequestBaseConfig): Promise<Response>

export const enum AlbumSongsaleboardType {
  daily = 'daily',
  week = 'week',
  year = 'year',
  total = 'total',
}

export const enum AlbumSongsaleboardAlbumType {
  album = 0,
  single = 1,
}

export function album_songsaleboard(
  params: {
    albumType?: AlbumSongsaleboardAlbumType // 0 为数字专辑,1 为数字单曲
    type?: AlbumSongsaleboardType
    year?: string | number // 年份，默认本年。 type 为 year 时有效
  } & RequestBaseConfig,
): Promise<Response>

export function album_sub(
  params: {
    id: string | number
    t: SubAction
  } & RequestBaseConfig,
): Promise<Response>

export function album_sublist(
  params: MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function artist_album(
  params: { id: string | number } & MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function artist_desc(
  params: { id: string | number } & RequestBaseConfig,
): Promise<Response>

export const enum ArtistListArea {
  zh = 'Z_H',
  ea = 'E_A',
  kr = 'KR',
  jp = 'JP',
}

export const enum ArtistArea {
  all = '-1',
  zh = '7',
  ea = '96',
  ja = '8',
  kr = '16',
  other = '0',
}

export const enum ArtistType {
  male = '1',
  female = '2',
  band = '3',
}

export function artist_list(
  params: {
    area: ArtistArea
    initial?:
      | 'a'
      | 'b'
      | 'c'
      | 'd'
      | 'e'
      | 'f'
      | 'g'
      | 'h'
      | 'i'
      | 'j'
      | 'k'
      | 'l'
      | 'm'
      | 'n'
      | 'o'
      | 'p'
      | 'q'
      | 'r'
      | 's'
      | 't'
      | 'u'
      | 'v'
      | 'w'
      | 'x'
      | 'y'
      | 'z'
      | 'A'
      | 'B'
      | 'C'
      | 'D'
      | 'E'
      | 'F'
      | 'G'
      | 'H'
      | 'I'
      | 'J'
      | 'K'
      | 'L'
      | 'M'
      | 'N'
      | 'O'
      | 'P'
      | 'Q'
      | 'R'
      | 'S'
      | 'T'
      | 'U'
      | 'V'
      | 'W'
      | 'X'
      | 'Y'
      | 'Z'
    type?: ArtistType
  } & MultiPageConfig &
    RequestBaseConfig,
): Promise<Response>

export function artist_mv(
  params: { id: string | number } & MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export const enum ArtistSongsOrder {
  hot = 'hot',
  time = 'time',
}

export function artist_songs(
  params: {
    id: string | number
    order?: ArtistSongsOrder
  } & MultiPageConfig &
    RequestBaseConfig,
): Promise<Response>

export function artist_sub(
  params: { id: string | number; t: SubAction } & RequestBaseConfig,
): Promise<Response>

export function artist_sublist(
  params: MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function artist_top_song(
  params: {
    id: string | number
  } & RequestBaseConfig,
): Promise<Response>

export function artists(
  params: { id: string | number } & RequestBaseConfig,
): Promise<Response>

export function audio_match(
  params: {
    duration: string | number
    audioFP: string | number
  } & RequestBaseConfig,
): Promise<Response>

export function avatar_upload(
  params: ImageUploadConfig & RequestBaseConfig,
): Promise<Response>

export const enum BannerType {
  pc = 0,
  android = 1,
  iphone = 2,
  ipad = 3,
}

export function banner(
  params: { type?: BannerType } & RequestBaseConfig,
): Promise<Response>

export function batch(
  params: { [index: string]: unknown } & RequestBaseConfig,
): Promise<Response>

export function captcha_sent(
  params: { phone: string; ctcode?: number | string } & RequestBaseConfig,
): Promise<Response>

export function captcha_verify(
  params: {
    ctcode?: number | string
    phone: number | string
    captcha: string
  } & RequestBaseConfig,
): Promise<Response>

export function cellphone_existence_check(
  params: {
    phone: number | string
    countrycode: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function check_music(
  params: { id: string | number; br: string | number } & RequestBaseConfig,
): Promise<Response>

export const enum SearchType {
  single = 1,
  album = 10,
  artist = 100,
  playlist = 1000,
  user = 1002,
  mv = 1004,
  lyric = 1006,
  dj = 1009,
  video = 1014,
  complex = 1018,
}

export function cloudsearch(
  params: {
    keywords: string
    type?: SearchType
  } & MultiPageConfig &
    RequestBaseConfig,
): Promise<Response>

export const enum CommentType {
  song = 0,
  mv = 1,
  playlist = 2,
  album = 3,
  dj = 4,
  video = 5,
  event = 6,
}

export const enum CommentAction {
  add = 1,
  delete = 0,
  reply = 2,
}

export function comment(
  params: {
    id: string | number
    type: CommentType
    t: CommentAction.delete
    commentId: string | number
  } & RequestBaseConfig,
): Promise<Response>

export function comment(
  params: {
    type: CommentType.event
    t: CommentAction.delete
    threadId: string
    commentId: string | number
  } & RequestBaseConfig,
): Promise<Response>

export function comment(
  params: {
    id: string | number
    type: CommentType
    t: CommentAction.add
    content: string | number
  } & RequestBaseConfig,
): Promise<Response>

export function comment(
  params: {
    type: CommentType.event
    t: CommentAction.add
    threadId: string
    content: string | number
  } & RequestBaseConfig,
): Promise<Response>

export function comment(
  params: {
    id: string | number
    type: CommentType
    t: CommentAction.reply
    content: string | number
    commentId: string | number
  } & RequestBaseConfig,
): Promise<Response>

export function comment(
  params: {
    type: CommentType.event
    t: CommentAction.reply
    threadId: string
    content: string | number
    commentId: string | number
  } & RequestBaseConfig,
): Promise<Response>

export function comment_album(
  params: {
    id: string | number
    before?: string | number
  } & MultiPageConfig &
    RequestBaseConfig,
): Promise<Response>

export function comment_dj(
  params: {
    id: string | number
    before?: string | number
  } & MultiPageConfig &
    RequestBaseConfig,
): Promise<Response>

export function comment_event(
  params: {
    threadId: string
    before?: string | number
  } & MultiPageConfig &
    RequestBaseConfig,
): Promise<Response>

export function comment_floor(
  params: {
    id: string | number
    parentCommentId: string | number
    type: CommentType
    limit?: string | number
    time?: string | number
  } & RequestBaseConfig,
): Promise<Response>

export function comment_hot(
  params: {
    id: string | number
    type: CommentType
    before?: string | number
  } & MultiPageConfig &
    RequestBaseConfig,
): Promise<Response>

export function comment_hotwall_list(
  params: RequestBaseConfig,
): Promise<Response>

export function comment_like(
  params: {
    id: string | number
    type: CommentType
    t: SubAction
    cid: string | number
    threadId?: string
  } & RequestBaseConfig,
): Promise<Response>

export function comment_music(
  params: {
    id: string | number
    before?: string | number
  } & MultiPageConfig &
    RequestBaseConfig,
): Promise<Response>

export function comment_mv(
  params: {
    id: string | number
    before?: string | number
  } & MultiPageConfig &
    RequestBaseConfig,
): Promise<Response>

export function comment_playlist(
  params: {
    id: string | number

    before?: string | number
  } & MultiPageConfig &
    RequestBaseConfig,
): Promise<Response>

export function comment_video(
  params: {
    id: string | number
    before?: string | number
  } & MultiPageConfig &
    RequestBaseConfig,
): Promise<Response>

export function countries_code_list(
  params: RequestBaseConfig,
): Promise<Response>

export const enum DailySigninType {
  android = 0,
  pc = 1,
}

export function daily_signin(
  params: { type?: DailySigninType } & RequestBaseConfig,
): Promise<Response>

export function digitalAlbum_ordering(
  params: {
    payment: string
    id: string | number
    quantity: string
  } & RequestBaseConfig,
): Promise<Response>

export function digitalAlbum_purchased(
  params: MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function dj_banner(params: RequestBaseConfig): Promise<Response>

export function dj_category_excludehot(
  params: RequestBaseConfig,
): Promise<Response>

export function dj_category_recommend(
  params: RequestBaseConfig,
): Promise<Response>

export function dj_catelist(params: RequestBaseConfig): Promise<Response>

export function dj_detail(
  params: { rid: string | number } & RequestBaseConfig,
): Promise<Response>

export function dj_hot(
  params: MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function dj_paygift(
  params: MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function dj_personalize_recommend(
  params: { limit?: string | number } & RequestBaseConfig,
): Promise<Response>

export function dj_program(
  params: {
    rid: string | number
    asc: 'true' | 1 | 'false' | 0
  } & MultiPageConfig &
    RequestBaseConfig,
): Promise<Response>

export function dj_program_detail(
  params: { id: string | number } & RequestBaseConfig,
): Promise<Response>

export function dj_program_toplist(
  params: MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function dj_program_toplist_hours(
  params: { limit?: string | number } & RequestBaseConfig,
): Promise<Response>

export function dj_radio_hot(
  params: {
    cateId: string | number
  } & MultiPageConfig &
    RequestBaseConfig,
): Promise<Response>

export function dj_recommend(params: RequestBaseConfig): Promise<Response>

/*
  有声书 10001
  知识技能 453050
  商业财经 453051
  人文历史 11
  外语世界 13
  亲子宝贝 14
  创作|翻唱 2001
  音乐故事 2
  3D|电子 10002
  相声曲艺 8
  情感调频 3
  美文读物 6
  脱口秀 5
  广播剧 7
  二次元 3001
  明星做主播 1
  娱乐|影视 4
  科技科学 453052
  校园|教育 4001
  旅途|城市 12
*/

export function dj_recommend_type(
  params: { type: number } & RequestBaseConfig,
): Promise<Response>

export function dj_sub(
  params: { t: SubAction; rid: string | number } & RequestBaseConfig,
): Promise<Response>

export function dj_sublist(
  params: MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function dj_today_perfered(
  params: { page?: string | number } & RequestBaseConfig,
): Promise<Response>

export function dj_toplist(
  params: { type?: ListOrder } & MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function dj_toplist_hours(
  params: { limit?: string | number } & RequestBaseConfig,
): Promise<Response>

export function dj_toplist_newcomer(
  params: MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function dj_toplist_pay(
  params: { limit?: string | number } & RequestBaseConfig,
): Promise<Response>

export function dj_toplist_popular(
  params: { limit?: string | number } & RequestBaseConfig,
): Promise<Response>

export function event(
  params: { pagesize?: number; lasttime?: number } & RequestBaseConfig,
): Promise<Response>

export function event_del(
  params: { evId: string | number } & RequestBaseConfig,
): Promise<Response>

export function event_forward(
  params: {
    forwords: string
    evId: string | number
    uid: string | number
  } & RequestBaseConfig,
): Promise<Response>

export function fm_trash(
  params: { id: string | number; time?: string | number } & RequestBaseConfig,
): Promise<Response>

export function follow(
  params: { t: SubAction; id: string | number } & RequestBaseConfig,
): Promise<Response>

export function history_recommend_songs(
  params: RequestBaseConfig,
): Promise<Response>

export function history_recommend_songs_detail(
  params: { date?: string } & RequestBaseConfig,
): Promise<Response>

export function homepage_block_page(
  params: {
    refresh?: 'true' | 'false' | boolean
    cursor?: string
  } & RequestBaseConfig,
): Promise<Response>

export function homepage_dragon_ball(
  params: RequestBaseConfig,
): Promise<Response>

export function hot_topic(
  params: MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function like(
  params: {
    like?: 'true' | 'false' | boolean
    id: string | number
    alg?: string
    time?: string | number
  } & RequestBaseConfig,
): Promise<Response>

export function likelist(
  params: { uid: string | number } & RequestBaseConfig,
): Promise<Response>

export function login(
  params: { email: string; password: string } & RequestBaseConfig,
): Promise<Response>

export function login(
  params: { email: string; md5_password: string } & RequestBaseConfig,
): Promise<Response>

export function login_cellphone(
  params: {
    phone: number | string
    countrycode?: number | string
    password: string
  } & RequestBaseConfig,
): Promise<Response>

export function login_cellphone(
  params: {
    phone: number | string
    countrycode?: number | string
    md5_password: string
  } & RequestBaseConfig,
): Promise<Response>

export function login_cellphone(
  params: {
    phone: number | string
    countrycode?: number | string
    captcha: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function login_refresh(params: RequestBaseConfig): Promise<Response>

export function login_status(params: RequestBaseConfig): Promise<Response>

export function logout(params: RequestBaseConfig): Promise<Response>

export function lyric(
  params: { id: string | number } & RequestBaseConfig,
): Promise<Response>

export function lyric_new(
  params: { id: string | number } & RequestBaseConfig,
): Promise<Response>

export function msg_comments(
  params: {
    uid: string | number
    before?: string | number
    limit?: string | number
  } & RequestBaseConfig,
): Promise<Response>

export function msg_forwards(
  params: MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function msg_notices(
  params: {
    limit?: string | number
    lasttime?: string | number
  } & RequestBaseConfig,
): Promise<Response>

export function msg_private(
  params: MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function msg_private_history(
  params: {
    before?: string | number
    limit?: string | number
    uid: string | number
  } & RequestBaseConfig,
): Promise<Response>

export const enum MvArea {
  all = '全部',
  zh = '内地',
  hk = '港台',
  ea = '欧美',
  kr = '韩国',
  jp = '日本',
}

export const enum MvType {
  all = '全部',
  offical = '官方版',
  raw = '原生',
  live = '现场版',
  netease = '网易出品',
}

export const enum MvOrder {
  trend = '上升最快',
  hot = '最热',
  new = '最新',
}

export function mv_all(
  params: {
    area?: MvArea
    type?: MvType
    order?: MvOrder
  } & MultiPageConfig &
    RequestBaseConfig,
): Promise<Response>

export function mv_detail(
  params: { mvid?: string | number } & RequestBaseConfig,
): Promise<Response>

export function mv_detail_info(
  params: { mvid: string | number } & RequestBaseConfig,
): Promise<Response>

export function mv_exclusive_rcmd(
  params: MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function mv_first(
  params: { area?: MvArea; limit?: string | number } & RequestBaseConfig,
): Promise<Response>

export function mv_sub(
  params: { t: SubAction; mvid: string | number } & RequestBaseConfig,
): Promise<Response>

export function mv_sublist(
  params: MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function mv_url(
  params: { id?: string | number; r?: string | number } & RequestBaseConfig,
): Promise<Response>

export function personal_fm(params: RequestBaseConfig): Promise<Response>

export function personalized(
  params: { limit?: string | number } & RequestBaseConfig,
): Promise<Response>

export function personalized_djprogram(
  params: RequestBaseConfig,
): Promise<Response>

export function personalized_mv(params: RequestBaseConfig): Promise<Response>

export function personalized_newsong(
  params: {
    area?: string | number
    limit?: string | number
  } & RequestBaseConfig,
): Promise<Response>

export function personalized_privatecontent(
  params: RequestBaseConfig,
): Promise<Response>

export function personalized_privatecontent_list(
  params: MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function playlist_catlist(params: RequestBaseConfig): Promise<Response>

export function playlist_cover_update(
  params: { id: string } & ImageUploadConfig & RequestBaseConfig,
): Promise<Response>

export function playlist_create(
  params: {
    name: string
    privacy: 0 | 10
    type?: PlaylistType
  } & RequestBaseConfig,
): Promise<Response>

export function playlist_delete(
  params: { id: string | number } & RequestBaseConfig,
): Promise<Response>

export function playlist_desc_update(
  params: { id: string | number; desc: string } & RequestBaseConfig,
): Promise<Response>

export function playlist_detail(
  params: { id: string | number; s?: string | number } & RequestBaseConfig,
): Promise<Response>

export function playlist_highquality_tags(
  params: RequestBaseConfig,
): Promise<Response>

export function playlist_hot(params: RequestBaseConfig): Promise<Response>

export function playlist_name_update(
  params: { id: string | number; name: string } & RequestBaseConfig,
): Promise<Response>

export function playlist_order_update(
  params: { ids: string } & RequestBaseConfig,
): Promise<Response>

export function playlist_subscribe(
  params: { t: SubAction; id: string | number } & RequestBaseConfig,
): Promise<Response>

export function playlist_subscribers(
  params: { id?: string | number } & MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function playlist_tags_update(
  params: { id: string | number; tags: string } & RequestBaseConfig,
): Promise<Response>

export function playlist_tracks(
  params: {
    op: 'add' | 'del'
    pid: string | number
    tracks: string
  } & RequestBaseConfig,
): Promise<Response>

export function playlist_update(
  params: {
    id: string | number
    name: string
    desc?: string
    tags?: string
  } & RequestBaseConfig,
): Promise<Response>

export function playmode_intelligence_list(
  params: {
    id: string | number
    pid: string | number
    sid?: string | number
    count?: string | number
  } & RequestBaseConfig,
): Promise<Response>

export function program_recommend(
  params: { type: string } & MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function rebind(
  params: {
    captcha: string
    phone: string
    oldcaptcha: string
    ctcode?: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function recommend_resource(params: RequestBaseConfig): Promise<Response>

export function recommend_songs(params: RequestBaseConfig): Promise<Response>

export function register_cellphone(
  params: {
    captcha: string
    phone: string
    password: string
    nickname: string
  } & RequestBaseConfig,
): Promise<Response>

export function related_allvideo(
  params: { id: string | number } & RequestBaseConfig,
): Promise<Response>

export function related_playlist(
  params: { id: string | number } & RequestBaseConfig,
): Promise<Response>

export const enum ResourceType {
  mv = 1,
  dj = 4,
  video = 5,
  event = 6,
}
type PlaylistType = 'NROMAL' | 'VIDEO'

export function resource_like(
  params: {
    t: SubAction
    type: ResourceType
    id?: string | number
    threadId?: string
  } & RequestBaseConfig,
): Promise<Response>

export function scrobble(
  params: {
    id: string | number
    sourceid: string | number
    time: string | number
  } & RequestBaseConfig,
): Promise<Response>

export function search(
  params: {
    keywords: string
    type?: SearchType
  } & MultiPageConfig &
    RequestBaseConfig,
): Promise<Response>

export function search_default(params: RequestBaseConfig): Promise<Response>

export function search_hot(params: RequestBaseConfig): Promise<Response>

export function search_hot_detail(params: RequestBaseConfig): Promise<Response>

export function search_multimatch(
  params: { type?: number; keywords: string } & RequestBaseConfig,
): Promise<Response>

export const enum SearchSuggestType {
  mobile = 'mobile',
  web = 'web',
}

export function search_suggest(
  params: { keywords: string; type?: SearchSuggestType } & RequestBaseConfig,
): Promise<Response>

export function send_playlist(
  params: {
    playlist: string | number
    msg: string
    user_ids: string
  } & RequestBaseConfig,
): Promise<Response>

export function send_text(
  params: { msg: string; user_ids: string } & RequestBaseConfig,
): Promise<Response>

export function setting(params: RequestBaseConfig): Promise<Response>

export const enum ShareResourceType {
  song = 'song',
  playlist = 'playlist',
  mv = 'mv',
  djprogram = 'djprogram',
  djradio = 'djradio',
}

export function share_resource(
  params: {
    type?: ShareResourceType
    msg?: string
    id?: string | number
  } & RequestBaseConfig,
): Promise<Response>

export function simi_artist(
  params: { id: string | number } & RequestBaseConfig,
): Promise<Response>

export function simi_mv(
  params: { mvid: string | number } & RequestBaseConfig,
): Promise<Response>

export function simi_playlist(
  params: { id: string | number } & MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function simi_song(
  params: { id: string | number } & MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function simi_user(
  params: { id: string | number } & MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function song_detail(
  params: { ids: string } & RequestBaseConfig,
): Promise<
  Response<{
    songs: SongDetail[]
    privileges: unknown[]
    code: number
  }>
>

type SongDetail = {
  name: string
  id: number
  pst: number
  t: number
  ar: SongDetailArtist[]
  alia: string[]
  pop: number
  st: number
  rt: string | null
  fee: SongDetailFee
  v: number
  crbt: string | null
  cf: string
  al: SongDetailAlbum
  dt: number
  h: SongDetailQuality | null
  m: SongDetailQuality | null
  l: SongDetailQuality | null
  sq: SongDetailQuality | null
  hr: SongDetailQuality | null
  a: unknown | null
  cd: string
  no: number
  rtUrl: unknown | null
  ftype: number
  rtUrls: unknown[]
  djId: number
  copyright: SongDetailCopyright
  s_id: number
  mark: number
  originCoverType: SongDetailOriginCoverType
  originSongSimpleData: unknown | null
  tagPicList: unknown | null
  resourceState: boolean
  version: number
  songJumpInfo: unknown | null
  entertainmentTags: unknown | null
  awardTags: unknown | null
  single: number
  noCopyrightRcmd: unknown | null
  mv: number
  rtype: number
  rurl: unknown | null
  mst: number
  cp: number
  publishTime: number
}

type SongDetailArtist = {
  id: number
  name: string
  tns: unknown[]
  alias: unknown[]
}

type SongDetailFee = 0 | 1 | 4 | 8

type SongDetailAlbum = {
  id: number
  name: string
  picUrl: string
  tns: unknown[]
  pic: number
}

type SongDetailQuality = {
  br: number
  fid: number
  size: number
  vd: number
  sr: number
}

type SongDetailCopyright = 0 | 1 | 2

type SongDetailOriginCoverType = 0 | 1 | 2

export function song_order_update(
  params: { pid: string | number; ids: string } & RequestBaseConfig,
): Promise<Response>

export function song_url(
  params: { id: string | number; br?: string | number } & RequestBaseConfig,
): Promise<Response>

export const enum SoundQualityType {
  standard = 'standard',
  exhigh = 'exhigh',
  lossless = 'lossless',
  hires = 'hires',
  jyeffect = 'jyeffect',
  jymaster = 'jymaster',
  sky = 'sky',
}

export function song_url_v1(
  params: { id: string | number; level: SoundQualityType } & RequestBaseConfig,
): Promise<Response>

export function top_album(
  params: {
    area?: AlbumListArea
    type?: ListOrder
    year?: string
    mouth?: string
  } & MultiPageConfig &
    RequestBaseConfig,
): Promise<Response>

export function top_artists(
  params: MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function top_list(
  params: { id: string | number } & RequestBaseConfig,
): Promise<Response>

export function top_mv(
  params: { area?: MvArea } & MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function top_playlist(
  params: { cat?: string; order?: ListOrder } & MultiPageConfig &
    RequestBaseConfig,
): Promise<Response>

export function top_playlist_highquality(
  params: {
    cat?: string
    before?: string | number
    limit?: string | number
  } & RequestBaseConfig,
): Promise<Response>

export const enum TopSongType {
  all = 0,
  zh = 7,
  ea = 96,
  kr = 16,
  ja = 8,
}

export function top_song(
  params: { type: TopSongType } & RequestBaseConfig,
): Promise<Response>

export function toplist(params: RequestBaseConfig): Promise<Response>

export const enum ToplistArtistType {
  zh = 1,
  ea = 2,
  kr = 3,
  ja = 4,
}

export function toplist_artist(
  params: { type?: ToplistArtistType } & RequestBaseConfig,
): Promise<Response>

export function toplist_detail(params: RequestBaseConfig): Promise<Response>

export function user_audio(
  params: { uid: string | number } & RequestBaseConfig,
): Promise<Response>

export function user_cloud(
  params: MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function user_cloud_del(
  params: { id: string | number } & RequestBaseConfig,
): Promise<Response>

export function user_cloud_detail(
  params: { id: string | number } & RequestBaseConfig,
): Promise<Response>

export function user_detail(
  params: { uid: string | number } & RequestBaseConfig,
): Promise<Response>

export function user_dj(
  params: { uid: string | number } & MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function user_event(
  params: {
    lasttime?: string | number
    limit?: string | number
    uid: string | number
  } & RequestBaseConfig,
): Promise<Response>

export function user_followeds(
  params: {
    uid: string | number
    lasttime?: string | number
    limit?: string | number
  } & RequestBaseConfig,
): Promise<Response>

export function user_follows(
  params: { uid: string | number } & MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function user_level(params: RequestBaseConfig): Promise<Response>

export function user_playlist(
  params: { uid: string | number } & MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export const enum UserRecordType {
  all = 0,
  weekly = 1,
}

export function user_record(
  params: { uid: string | number; type?: UserRecordType } & RequestBaseConfig,
): Promise<Response>

export function user_subcount(params: RequestBaseConfig): Promise<Response>

export function user_update(
  params: {
    birthday: string
    city: string
    gender: string
    nickname: string
    province: string
    signature: string
  } & RequestBaseConfig,
): Promise<Response>

export function video_category_list(
  params: MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function video_detail(
  params: { id: string } & RequestBaseConfig,
): Promise<Response>

export function video_detail_info(
  params: { vid: string } & RequestBaseConfig,
): Promise<Response>

export function video_group(
  params: { id: string; offset?: string | number } & RequestBaseConfig,
): Promise<Response>

export function video_group_list(params: RequestBaseConfig): Promise<Response>

export function video_sub(
  params: { t?: SubAction; id: string } & RequestBaseConfig,
): Promise<Response>

export function video_timeline_all(
  params: { offset?: string | number } & RequestBaseConfig,
): Promise<Response>

export function video_timeline_recommend(
  params: { offset?: string | number } & RequestBaseConfig,
): Promise<Response>

export function video_url(
  params: { id: string | number; res?: number } & RequestBaseConfig,
): Promise<Response>

export function weblog(
  params: { data?: { [index: string]: unknown } } & RequestBaseConfig,
): Promise<Response>

export function playlist_mylike(
  params: {
    time?: number | string
    limit: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function playlist_track_add(
  params: { pid?: number | string; ids: number | string } & RequestBaseConfig,
): Promise<Response>

export function playlist_track_delete(
  params: { pid?: number | string; ids: number | string } & RequestBaseConfig,
): Promise<Response>

export function comment_new(
  params: {
    type?: number | string
    id: number | string
    pageNo?: number | string
    pageSize?: number | string
    sortType?: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function calendar(
  params: {
    startTime?: number | string
    endTime: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function playlist_video_recent(
  params: RequestBaseConfig,
): Promise<Response>

export function user_binding(
  params: { uid?: number | string } & RequestBaseConfig,
): Promise<Response>

export function user_replacephone(
  params: {
    phone: number | string
    captcha: number | string
    oldcaptcha: number | string
    countrycode?: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function user_safe(params: RequestBaseConfig): Promise<Response>

export function dj_subscriber(
  params: {
    id: number | string
    limit?: number | string
    time?: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function user_account(params: RequestBaseConfig): Promise<Response>

export function yunbei(params: RequestBaseConfig): Promise<Response>

export function yunbei_info(params: RequestBaseConfig): Promise<Response>

export function yunbei_sign(params: RequestBaseConfig): Promise<Response>

export function yunbei_receipt(
  params: MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function yunbei_expense(
  params: MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function yunbei_tasks(params: RequestBaseConfig): Promise<Response>

export function yunbei_today(params: RequestBaseConfig): Promise<Response>

export function yunbei_tasks_todo(params: RequestBaseConfig): Promise<Response>

export function yunbei_task_finish(
  params: {
    userTaskId: number | string
    depositCode?: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function msg_recentcontact(params: RequestBaseConfig): Promise<Response>

export function hug_comment(
  params: {
    uid: number | string
    cid: number | string
    sid: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function comment_hug_list(
  params: {
    page: number | string
    cursor: number | string
    idCursor: number | string
    pageSize?: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function topic_sublist(
  params: MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function topic_sublist(
  params: MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function artist_new_mv(
  params: {
    limit?: number | string
    startTimestamp?: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function artist_new_song(
  params: {
    limit?: number | string
    startTimestamp?: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function artist_detail(
  params: {
    id: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function cloud(
  params: {
    songFile: {
      name: string
      data: Buffer
    }
  } & RequestBaseConfig,
): Promise<Response>

export function topic_detail(
  params: {
    actid?: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function topic_detail_event_hot(
  params: {
    actid?: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function login_qr_key(params: RequestBaseConfig): Promise<Response>

export function login_qr_create(
  params: {
    key?: number | string
    qrimg?: boolean | string
  } & RequestBaseConfig,
): Promise<Response>

export function login_qr_check(
  params: {
    key?: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function playlist_detail_dynamic(
  params: { id: string | number } & RequestBaseConfig,
): Promise<Response>

export function user_bindingcellphone(
  params: {
    phone: number | string
    captcha: number | string
    countrycode?: number | string
    password?: string
  } & RequestBaseConfig,
): Promise<Response>

export function listen_together_status(
  params: RequestBaseConfig,
): Promise<Response>

export function user_comment_history(
  params: {
    limit?: number | string
    uid: number | string
    time?: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function cloud_match(
  params: {
    uid: number | string
    sid: number | string
    asid: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function yunbei_rcmd_song(
  params: {
    id: number | string
    reason?: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function yunbei_rcmd_song_history(
  params: {
    size?: number | string
    cursor?: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function song_purchased(
  params: MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function mlog_url(
  params: {
    id?: number | string
    res?: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function mlog_to_video(
  params: {
    id?: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function vip_growthpoint(params: RequestBaseConfig): Promise<Response>

export function vip_growthpoint_details(
  params: MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function vip_tasks(params: RequestBaseConfig): Promise<Response>

export function vip_growthpoint_get(
  params: {
    ids?: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function artist_fans(
  params: { id: number | string } & MultiPageConfig & RequestBaseConfig,
): Promise<Response>

export function digitalAlbum_detail(
  params: {
    id: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function digitalAlbum_sales(
  params: {
    ids: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function musician_data_overview(
  params: RequestBaseConfig,
): Promise<Response>

export function musician_play_trend(
  params: {
    startTime: number | string
    endTime: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function musician_tasks(params: RequestBaseConfig): Promise<Response>

export function musician_cloudbean(params: RequestBaseConfig): Promise<Response>

export function musician_cloudbean_obtain(
  params: {
    id: number | string
    period: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function vip_info(
  params: {
    uid?: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function vip_info_v2(
  params: {
    uid?: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function musician_sign(params: RequestBaseConfig): Promise<Response>

export function song_download_url(
  params: {
    id: number | string
    br?: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function playlist_track_all(
  params: {
    id: number | string
    s?: number | string
  } & MultiPageConfig &
    RequestBaseConfig,
): Promise<Response>

export function artist_video(
  params: {
    id: number | string
    size?: number | string
    cursor?: number | string
    order?: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function sign_happy_info(params: RequestBaseConfig): Promise<Response>

export function record_recent_song(
  params: {
    limit?: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function record_recent_video(
  params: {
    limit?: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function record_recent_voice(
  params: {
    limit?: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function record_recent_playlist(
  params: {
    limit?: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function record_recent_album(
  params: {
    limit?: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function record_recent_dj(
  params: {
    limit?: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function signin_progress(
  params: {
    moduleId?: string
  } & RequestBaseConfig,
): Promise<Response>

export function nickname_check(
  params: {
    nickname: string
  } & RequestBaseConfig,
): Promise<Response>

export function musician_tasks_new(params: RequestBaseConfig): Promise<Response>

export function playlist_update_playcount(
  params: {
    id?: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function vip_timemachine(
  params: {
    startTime?: number | string
    endTime?: number | string
    limit?: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function song_wiki_summary(
  params: {
    id: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function sheet_list(
  params: {
    id: number | string
    abTest?: 'a' | 'b'
  } & RequestBaseConfig,
): Promise<Response>

export function sheet_preview(
  params: {
    id: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function style_list(params: RequestBaseConfig): Promise<Response>

export function style_preference(params: RequestBaseConfig): Promise<Response>

export function style_detail(
  params: {
    tagId: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function style_song(
  params: {
    tagId: number | string
    size?: number | string
    cursor?: number | string
    sort?: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function style_album(
  params: {
    tagId: number | string
    size?: number | string
    cursor?: number | string
    sort?: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function style_playlist(
  params: {
    tagId: number | string
    size?: number | string
    cursor?: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function style_artist(
  params: {
    tagId: number | string
    size?: number | string
    cursor?: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function pl_count(params: RequestBaseConfig): Promise<Response>

export function get_userids(
  params: {
    nicknames: string
  } & RequestBaseConfig,
): Promise<Response>

export function voicelist_list_search(
  params: {
    limit?: string | number
    offset?: string | number
    name?: string
    displayStatus?: string
    type?: string
    voiceFeeType?: string | number
    radioId?: string
  } & RequestBaseConfig,
): Promise<Response>

export function voice_delete(
  params: {
    ids: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function djRadio_top(
  params: {
    djRadioId?: number | string
    sortIndex?: number | string
    dataGapDays?: number | string
    dataType?: number | string
  } & RequestBaseConfig,
): Promise<Response>

export function voice_lyric(
  params: {
    id: number | string
  } & RequestBaseConfig,
): Promise<Response>
