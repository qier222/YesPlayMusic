# 更新日志
### 4.0.8 | 2021.2.27
- 加入vercel 配置文件,支持 vercel 部署

### 4.0.7 | 2021.2.27
- 更新红心接口,修复红心接口460错误问题 [#1151](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/1151)

- 更新发送验证码接口

- 注册接口添加 countrycode 参数 [#1152](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/1152)

- 新增绑定手机接口 [#1152](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/1152)

- 更新 song/detail 接口 [#1143](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/1143)

- 用户粉丝接口修改分页参数 [#1161](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/1161)

### 4.0.6 | 2021.2.20
- 修复 eapi 接口无法正确解密response的问题 [#1138](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/1138)

### 4.0.5 | 2021.2.19
- 修复红心接口默认不红心的问题 [#1126](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/1126)

### 4.0.4 | 2021.2.18
- 移除云村热评接口(官方下架) [#1111](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/1111)
- 更新 app version

### 4.0.3 | 2021.1.28
- 修复云盘接口中文音乐信息乱码的问题 [#1108](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/1108)

### 4.0.2 | 2021.1.18
- 修复未绑定手机号对歌单添加或删除歌曲无响应的问题 [#1099](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/1099)

### 4.0.1 | 2021.1.09
- 新增歌单详情动态接口 [#1088](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/1088)

### 4.0.0 | 2021.1.03
- 新增云盘上传接口,新增二维码登录相关接口和相关demo(http://localhost:3000/qrlogin.html, http://localhost:3000/cloud.html),更新 d.ts

- 升级部分接口加密方法("linuxapi" 都替换到了"api")

- 更新 `login/status` 接口(返回字段和之前不一样)

### 3.47.5 | 2020.12.20
- 更新appver [#1060](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/1060)

### 3.47.4 | 2020.12.03
- 修复收藏的专栏接口无法调用的问题 [#1042](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/1042)

### 3.47.3 | 2020.11.22
- 新增歌手详情接口 [#1035](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/1035)

### 3.47.2 | 2020.11.15
- 新增关注歌手新歌/新MV接口 [#1028](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/1028)

### 3.47.1 | 2020.11.14
- 修复使用post请求取消喜欢音乐会失败的问题 [#1024](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/1024)

- 新增抱一抱评论和评论抱一抱列表接口 [#1016](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/1016)

- 新增收藏的专栏接口[#1026](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/1026)

### 3.46.1 | 2020.11.7
- 修复私信音乐接口出现风险提示的问题

### 3.46.0 | 2020.11.7
- 添加私信音乐接口 [#1016](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/1016)

- 添加最近联系人接口

- 修复用户动态数量不准确问题 [#1010](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/1010)

- 修复 cloudsearch 接口分页问题 [#1015](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/1015)

### 3.45.3 | 2020.11.1
- `相似歌手`,`首页-发现-圆形图标入口列表`接口增加匿名token[#877](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/877) [#988](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/988)

- 修复`音乐 url`接口POST方式手动传入cookie报错问题 [#1005](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/1005)

### 3.45.2 | 2020.10.26
- 云贝完成任务接口增加`depositCode`参数

### 3.45.1 | 2020.10.25
- 修复代理配置失效的问题 [#992](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/992)

- 修复新碟上架不返回周数据的问题,修复推荐新音乐接口返回数量问题,并添加limit参数支持 [#981](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/981)

- 添加`云贝`相关接口 [#985](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/985)

- 添加`用户账号信息`接口

- 替换接口文件所有http url 为 https

### 3.44.0 | 2020.10.17
- 更新`电台详情`,`电台节目详情`接口 [#977](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/977)

#### Breaking change
- `电台详情`接口更新后数据结构有变化

### 3.43.0 | 2020.10.16
- 新增`电台订阅者列表`接口 [#971](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/971)

### 3.42.4 | 2020.10.07
- 修复新评论接口分页参数问题

### 3.42.3 | 2020.10.05
- 修复新评论接口分页参数问题

### 3.42.2 | 2020.10.05
- 更新歌单详情接口

### 3.42.1 | 2020.10.04
- 新增`用户绑定信息`,`用户绑定手机`,`新版评论`,`点赞过的视频`,`收藏视频到视频歌单`,`删除视频歌单里的视频`,`最近播放的视频`,`音乐日历`等接口

- 创建歌单接口增加`type`参数,可创建视频歌单

### 3.41.2 | 2020.09.20
- 更新`获取音乐 url`接口,未登录状态返回试听片段 [#897](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/897)

### 3.41.1 | 2020.09.19
- 新增`电台个性推荐接口` [#824](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/824)

### 3.41.0 | 2020.09.19
- 新增`精品歌单标签列表`接口 [#921](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/921)

- 新增`用户等级信息`接口 [#929](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/929)

- 增加新接口的 d.ts 文件,修复登录接口的 d.ts 的 countrycode 为非可选属性的错误

### 3.40.1 | 2020.09.13
- 更新 TypeScript 声明 [#928](https://github.com/Binaryify/NeteaseCloudMusicApi/pull/928)

### 3.40.0 | 2020.09.12
- 新增 TypeScript 声明文件 [#908](https://github.com/Binaryify/NeteaseCloudMusicApi/pull/908)
- 更改随机 UA 相关逻辑[#922](https://github.com/Binaryify/NeteaseCloudMusicApi/pull/922)

### 3.39.0 | 2020.08.23
- 新增`cloudsearch`接口[#893](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/893)
- `mv 地址`接口修改分辨率参数 [#883](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/883)
- 修复新碟上架接口分页问题 [#892](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/892)

### 3.38.0 | 2020.08.09
- 新增`楼层评论`,`歌手全部歌曲`接口 [#864](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/864) [#867](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/867)
- 支持收藏VIP或付费歌曲到歌单 [#860](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/860)
- 支持手动传入`realIP` [#863](https://github.com/Binaryify/NeteaseCloudMusicApi/pull/863)

### 3.37.2 | 2020.08.04
- 修复依赖问题

### 3.37.0 | 2020.08.03
- 新增`更新头像`,`歌单封面上传`接口和相关例子 [#403](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/403) [#857](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/857)
- 加入`axios`依赖

### 3.36.0 | 2020.07.26
- 新增`全部新碟`,`数字专辑-新碟上架`,`数字专辑&数字单曲-榜单`,`数字专辑-语种风格馆`,`数字专辑详情`接口 [#852](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/852)
- 更新`新碟上架`接口,修改传入参数,返回数据结构有变化

### 3.35.0 | 2020.07.18
- 新增`首页-发现`,`首页-发现-圆形图标入口列表`接口 [#851](https://github.com/Binaryify/NeteaseCloudMusicApi/pull/851)

### 3.34.2 | 2020.07.13
- 修复`获取用户播放记录`接口参数错误问题 [#849](https://github.com/Binaryify/NeteaseCloudMusicApi/pull/849)

- 增加`国家编码列表`接口 [#841](https://github.com/Binaryify/NeteaseCloudMusicApi/pull/841)

### 3.34.1 | 2020.07.06
- 登录接口增加 `md5_password` 参数 [#839](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/839)

### 3.34.0 | 2020.06.25
- 排行榜接口废弃idx参数,只支持id参数,修复返回数据异常问题 [#830](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/830)
- 新增`获取历史日推可用日期列表`,`获取历史日推详细数据` 接口

### 3.33.2 | 2020.06.23
- 更新每日推荐接口 [#826](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/826)

### 3.33.1 | 2020.06.15
- 修复直接调用时传入 cookie 不生效的问题 [#822](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/822)

### 3.33.0 | 2020.06.10
- 歌手榜支持地区参数 [#818](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/818)
- 新增视频分类列表,推荐视频,获取全部视频列表接口 [#816](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/816)
- 内置 apicache,修复不能在 NodeJS v13 版本使用的问题 [#817](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/817)

### 3.32.3 | 2020.06.07
- 修复 Nodejs 下 cookie 使用格式问题 [#812](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/812)

### 3.32.2 | 2020.06.05
- 新增独家放送列表接口 [#808](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/808)

### 3.32.1 | 2020.06.03
- 新增歌曲排序接口

### 3.32.0 | 2020.06.03
- 更新排行榜接口,支持传入榜单id
- 新增榜单顺序调整接口 [#806](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/806)
- 完善错误提示信息

### 3.31.1 | 2020.05.19
- 修复`cookie`没返回的问题 [#778](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/778)

### 3.31.0 | 2020.05.18
- 支持 `Node.js` 调用,参考`module_example` 文件夹下的 `test.js`

### 3.30.0 | 2020.05.17
- 登录接口返回内容增加`cookie`字段,支持手动传入cookie

### 3.29.1 | 2020.05.13
- 调整通知接口分页参数 [#761](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/761)

### 3.29.0 | 2020.05.11
- 支持批量删除歌单 [#760](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/760)

### 3.28.0 | 2020.05.05
- 新增获取 mv 点赞转发评论数数据接口
- 新增获取视频点赞转发评论数数据接口

### 3.27.0 | 2020.04.20
- 新增购买专辑接口 by [TimonPeng](https://github.com/Binaryify/NeteaseCloudMusicApi/pull/740)

### 3.26.0 | 2020.04.08
#### Breaking change
- 更新歌手分类列表接口参数,因`cat`参数失效,调整为`type`和`area`参数

### 3.25.4 | 2020.03.18
- 更新歌词,歌手分类列表接口

- 更新文档

### 3.25.3 | 2019.11.08
- 升级依赖,去除多余依赖

- 优化 `test.html`

### 3.25.2 | 2019.11.07
- 修复邮箱登录状态码错误,增加相关提示 [#633](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/633)

### 3.25.0 | 2019.11.06
- 新增 `云村热评` 接口[#626](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/626)

- 新增 `歌手热门50首歌曲` 接口 

- 新增`电台24小时节目榜`,`电台24小时主播榜`, `电台最热主播榜`,`电台主播新人榜`,`电台付费精品榜` 接口 [#606](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/606)

- 调整 `歌手分类列表 ` 接口参数 [#624](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/624)

### 3.24.2 | 2019.10.28
- 修改默认绑定 HOST [#620](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/620)

### 3.24.1 | 2019.10.25
- 修改默认绑定 HOST [#615](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/615)

### 3.24.0 | 2019.10.22
- 新增`类别热门电台` 接口 [#607](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/607)

### 3.23.0 | 2019.10.16
- 修复电台 banner 接口无数据问题[#601](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/601)

- 更新排行榜 [#602](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/602)

- 新增`电台排行榜`,`新晋电台榜`,`热门电台榜`接口 [#604](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/604)

### 3.22.4 | 2019.09.26
- 修复私信历史记录分页参数问题,更新文档 [#599](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/599)

### 3.22.3 | 2019.09.24
- 手机号码检测： 添加国家码作为参数，方便检测国外手机号码 [#598](https://github.com/Binaryify/NeteaseCloudMusicApi/pull/598)

### 3.22.2 | 2019.09.18
- 排行榜参数更新,更新文档[#592](https://github.com/Binaryify/NeteaseCloudMusicApi/pull/592)

### 3.22.1 | 2019.09.12
- 支持回复评论[#589](https://github.com/Binaryify/NeteaseCloudMusicApi/pull/589)


### 3.22.0 | 2019.08.25
- 支持 CORS 预检 [#564](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/564) [#578](https://github.com/Binaryify/NeteaseCloudMusicApi/pull/578)

### 3.21.1 | 2019.08.21
- 修复推荐歌单和网易出品mv参数错误,更新文档 [#571](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/571) [#572](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/572) 

### 3.21.0 | 2019.08.20
- 新增`歌单删除接口`[#570](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/570)

### 3.20.0 | 2019.08.06
- 新增`更新歌单描述`,`更新歌单名`,`更新歌单标签`,`默认搜索关键词` 接口,更新文档[#547](https://github.com/Binaryify/NeteaseCloudMusicApi/pull/547)

### 3.19.0 | 2019.07.24
- 新增`检测手机号码是否已注册`和`初始化昵称`接口[#540](https://github.com/Binaryify/NeteaseCloudMusicApi/pull/540)

### 3.18.6 | 2019.07.15
- 修复注册异常的问题 [#532](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/532)

### 3.18.5 | 2019.07.14
- 修复部分歌曲无法获得播放链接的问题 [#531](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/531)

### 3.18.3 | 2019.07.04
- 修复全部 mv`/mv/all` 接口分页参数错误的问题 [#524](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/524)

### 3.18.2 | 2019.07.03
- 修复听歌打卡接口 `/scrobble` 失效问题

### 3.18.1 | 2019.06.30
- 评论接口增加 `before` 参数以获取超过5000条评论数据 [#521](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/521)

- 修复 `/msg/comments` 传入参数和文档描述不一致问题


### 3.18.0 | 2019.06.29
- 新增 `更换绑定手机接口`

#### Breaking change
1. 调整注册接口由 `/captch/register` 修改为 `/register/cellphone`

2. 调整发送短信接口由 `/captch/sent` 修改为 `/captcha/sent`

3. 调整短信验证接口由 `/captch/verify` 修改为 `/captcha/verify`

### 3.17.0 | 2019.06.29
- 新增 `专辑动态信息` `热搜列表(详细)` 接口,更新文档

### 3.16.0 | 2019.06.27
- 新增 `收藏/取消收藏专辑` 接口

- 调整歌曲评论接口使用客户端版本接口

### 3.15.0 | 2019.06.16
- 新增`获取视频标签列表`,`网易出品`,`全部mv`接口, `最新 mv` 和 `mv 排行` 接口加入地区参数,更新文档

### 3.14.0 | 2019.06.10
- 获取用户粉丝列表接口修改请求参数，更新文档

### 3.13.1 | 2019.06.09
- 修复获取用户粉丝列表接口只能获取1000个的问题

### 3.13.0 | 2019.05.19
- 新增eapi算法 (via:[#491](https://github.com/Binaryify/NeteaseCloudMusicApi/pull/491))

- 新增batch批量请求接口  (via:[#491](https://github.com/Binaryify/NeteaseCloudMusicApi/pull/491))

- 用户动态增加分页参数

### 3.12.0 | 2019.05.10
- 增加`私信内容、我的数字专辑`接口

### 3.11.0 | 2019.05.09
- 增加`通知-私信、通知-评论、通知-@我、通知-通知、设置、云盘数据详情`接口

### 3.10.2 | 2019.05.09
- 增加`分享歌曲、歌单、mv、电台、电台节目到动态`接口

### 3.10.1 | 2019.05.08
- 增加转发动态接口

- 增加删除动态接口

### 3.9.0 | 2019.05.03
- 新增 云盘歌曲删除, 热门话题, 电台 - 推荐类型, 电台 - 非热门类型, 电台 - 今日优选, 心动模式/智能播放等接口

- 更新文档:banner接口 增加 `type` 参数; 获取动态消息接口增加 `pagesize` 和 `lasttime` 参数; 电台 - 付费精选接口修改默认`limit`为 30

### 3.8.1 | 2019.04.24
- 修复歌词接口出错问题

### 3.8.0 | 2019.04.14
- 增加注册,发送验证码,校验验证码接口 via:[https://github.com/Binaryify/NeteaseCloudMusicApi/pull/460](https://github.com/Binaryify/NeteaseCloudMusicApi/pull/460) @[KongValley](https://github.com/KongValley)

### 3.7.1 | 2019.04.09
- 修复登录460问题

### 3.7.0 | 2019.03.20
- 修复喜欢音乐接口参数判断问题

- 增加歌单收藏者列表接口

### 3.6.0 | 2019.03.15
- 调整动态评论获取接口 url，使之和其他评论获取接口更统一

### 3.5.0 | 2019.03.14
- 增加获取动态评论接口

- 支持给动态点赞

- 支持给动态评论点赞

- 支持给动态发送/删除评论

### 3.4.0 | 2019.01.29
- 增加已收藏专辑列表接口

### 3.3.0 | 2019.01.27
- 增加视频标签下的视频获取接口

- 增加 pac 代理支持

### 3.2.0 | 2019.01.19
- 增加获取首页新碟上架数据以及更新听歌排行

- 更新搜索建议接口

### 3.1.0 | 2019.01.06
- 修复评论接口返回 460 Cheating 的问题

- 新增`已收藏MV`接口,更新文档

### 3.0.9 | 2018.12.15
- 修复关注异常的问题 #399

### 3.0.8 | 2018.12.12
- 更新文档 #386 #394

- 优化电台节目接口

### 3.0.7 | 2018.11.21
- 修复歌单详情列表,排行榜,所有榜单失效的问题,更新文档 #380 #381

### 3.0.4 | 2018.11.15
- 修复 `/song/url` 接口无法返回多个音乐数据的问题

### 3.0.3 | 2018.11.09
- 修复取消喜欢歌曲失败问题 [#360](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/360)

- 补充已喜欢音乐列表接口说明文档 [#370](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/370)

- 默认关闭 debug 模式 [#365](https://github.com/Binaryify/NeteaseCloudMusicApi/pull/365)

- 更新 Dockerfile 文件 [#367](https://github.com/Binaryify/NeteaseCloudMusicApi/pull/367)


### 3.0.1 | 2018.10.21

- 合并 PR([#351](https://github.com/Binaryify/NeteaseCloudMusicApi/pull/351))

- 文档增加 `/top/song` 接口

- `/banner` 换成 linux api，返回结构有所变动

- `/check/music` 已知 bug 修复

### 3.0.0 | 2018.10.14

#### 整体

- 完善文档,增加之前没写进文档的接口说明

- 重写 createRequest 返回 Promise 对象

- 模块化路由

- 模块化, 剥离 res,req, 方便导出调用

- 增加 cookie-parser

##### 参数修改

- `/song/detail` 增加多 id 支持

- `/toplist/detail` 移除参数

- `/resource/like` 增加参数 `type`

- `/top/playlist/highquality` 增加分页参数 `before`

##### 统一参数

- `/artist/sub` 与 `artist/unsub` 合并, 用`query.t`

- `/follow` 中 `query.type` 换成 `query.t`

- `/comment` 中 `query.action` 换成 `query.t`

##### URL 重命名

- `/video` 改为 `video/url`

- `/mv` 改为 `mv/detail`

- `/music/url` 改为 `/song/url`

##### 转发逻辑修改

- `/toplist/artist` 换成 weapi

- `/mv/url` 去除了 pipe

##### BUG 修复

- `/playlist/create`, `/playlist/update` 被判欺骗,增加 cookie

##### 路由增删

- 删除 `/recommend/dislike`

- 增加 `/video/sub` (收藏视频), `/mv/sub` (收藏 MV)

- 增加 `/video/detail` (视频详情)

- 增加 `/related/allvideo` (相关视频)

### 2.20.5 | 2018.09.29

修复非法参数 403 #335, 修复代理错误 #334

### 2.20.4 | 2018.09.27

修复点赞失效的问题

### 2.20.3 | 2018.09.26

- 增加退出登录接口
- 修正 /check/music 的检查逻辑
- 优化 Cookies 设置
- 重构单元测试

  [by @nondanee](https://github.com/nondanee)

- 增加 301 需要登录提示信息

- 更新文档

### 2.20.2 | 2018.09.22

增加热门评论和视频评论接口,更新文档

### 2.20.1 | 2018.09.17

优化版本检查功能

### 2.20.0 | 2018.09.06

新增版本检查功能

### 2.19.0 | 2018.08.29

新增获取视频数据接口,新增发送/删除评论接口,修复登录状态接口问题,完善文档 #301,感谢 @izhenyuls

### 2.17.0 | 2018.08.28

新增登录状态查询接口 #302 ,完善文档,完善路由注册 #297

### 2.16.0 | 2018.08.09

- Fixed #288,#289,#290

解决歌曲 URL 请求被判 Cheating,修复私信接收异常 #291

### 2.15.0 | 2018.07.30

新增相关歌单推荐和付费精选接口,增加歌手列表接口按首字母索引查找参数

### 2.14.0 | 2018.07.03

修复无法使用邮箱问题

### 2.13.0 | 2018.06.05

增加自动注册路由的功能,简化路由注册逻辑

### 2.12.0 | 2018.05.27

更新文档,优化歌单详情接口

### 2.11.1 | 2018.05.24

更新文档,优化`/dj/program`接口

### 2.11.0 | 2018.05.21

增加收藏歌手列表&订阅电台列表

### 2.10.0 | 2018.05.17

歌单操作调整为批量操作

### 2.9.9 | 2018.05.16

Bug 修复

### 2.9.8 | 2018.05.10

新增歌手分类列表,收藏/取消收藏歌手接口,新增更新用户信息,更新歌单接口

### 2.9.6 | 2018.05.08

新增发送私信相关接口,新增新建歌单,收藏/取消收藏歌单接口

### 2.9.4 | 2018.05.04

新增热搜接口,更新 banner 接口

### 2.9.2 | 2018.02.28

修复登录失败会崩溃的问题

### 2.9.1 | 2018.01.26

docker 构建文件的一些增强以及增加访问日志和调试输出

### 2.8.9 | 2018.01.24

修复歌单详情数据不完整的问题,更新依赖

### 2.8.8 | 2018.01.22

修复排行榜数据不完整的问题 , 优化部分代码 , 更新文档部分描述

### 2.8.6 | 2018.01.16

修复歌单详情接口数据不完整的问题

### 2.8.5 | 2018.01.16

修复评论点赞失败的问题

### 2.8.4 | 2018.01.15

优化 cookie 设置

### 2.8.3 | 2018.01.12

优化部分功能和文档

### 2.8.2 | 2018.01.05

增加 Dockerfile，支持以 Docker 容器模式运行

### 2.8.1 | 2018.01.04

添加了 proxy 功能

### 2.8.0 | 2018.01.04

用 'request' 重写了请求函数

### 2.7.9 | 2017.12.11

更新排行榜接口 , 新增云音乐 ACG 音乐榜 , 云音乐嘻哈榜

### 2.7.7 | 2017.11.27

更新 / 修复排行榜接口 , 更新 / 修复推荐歌单接口

### 2.7.7 | 2017.11.27

更新 / 修复排行榜接口 , 更新 / 修复推荐歌单接口

### 2.7.2 | 2017.9.7

修复搜索接口 offset 参数失效问题

### 2.7.0 | 2017.8.21

优化刷新登录代码

### 2.6.5 | 2017.7.16

优化 CORS 设置

### 2.6.4 | 2017.7.16

添加缓存机制和随机 UA 机制 感谢[@u3u](https://github.com/u3u)
[issue:77](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/77) 优化请求
代码 感谢 [@huhuime](https://github.com/huhuime)
[issue:83](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/83)

### 2.6.2 | 2017.7.16

修复垃圾桶接口

### 2.6.1 | 2017.7.16

修复红心接口

### 2.6.0 | 2017.6.25

修复签到接口

### 2.5.9 | 2017.6.14

增加启动说明页

### 2.5.8 | 2017.6.1

修复若干细节问题

### 2.5.7 | 2017.5.22

修复若干问题

### 2.5.6 | 2017.5.14

增加动态消息接口

### 2.5.5 | 2017.5.10

修复 mv 排行榜接口崩溃问题

### 2.5.4 | 2017.5.5

新增点赞接口 , 更新文档

### 2.5.3 | 2017.5.2

修复歌手单曲数据空白问题和文档获取歌手单曲 url 描述问题 , 更新文档

### 2.5.0 | 2017.4.29

增加 mv/ 专辑 / 歌单评论接口 , 增加云盘相关接口 , 增加获取用户动态 / 信息接口 ,
增加关注 / 粉丝列表接口 , 增加收藏歌单接口 , 增加相似 mv/ 歌曲 / 用户接口 , 增加
banner 接口 , 增加刷新登录接口 , 增加电台相关接口 , 补充评论接口 , 更新文档

### 2.4.6 | 2017.4.21

增加播放 mv 接口 , 更新文档

### 2.4.5 | 2017.4.20

增加歌手专辑 , 歌手单曲等接口 , 修复 /album 接口描述错误 , 更新文档

### 2.4.0 | 2017.4.20

增加歌单（网友精选碟 ), 新碟上架 , 热门歌手等接口 , 更新文档

### 2.3.4 | 2017.4.20

增加歌曲详情接口 , 更新文档

### 2.3.0 | 2017.4.15

增加排行榜接口 , 更新文档

### 2.2.0 |2017.4.14

增加私人 FM, 喜欢歌曲 , 垃圾桶 , 每日签到等接口 , 更新文档

### 2.1.3 | 2017.4.6

改善文档

### 2.1.0 | 2017.4.6

增加获取评论接口以及对应单元测试 , 增加更新日志

### 2.0.0 | 2017.4.1

版本升级到 2.0. 增加使用文档 , 完成项目重构 , 增加更完善的单元测试 , 升级 api 到
v2+, 支持登录并获取用户信息和创建的歌单 , 可通过获取音乐 url 接口获取用户歌单里
的的音乐 , 获取每日推荐歌单和每日推荐音乐
