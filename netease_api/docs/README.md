# NeteaseCloudMusicApi

网易云音乐 NodeJS 版 API

## 灵感来自

[disoul/electron-cloud-music](https://github.com/disoul/electron-cloud-music)

[darknessomi/musicbox](https://github.com/darknessomi/musicbox)

[sqaiyan/netmusic-node](https://github.com/sqaiyan/netmusic-node)

## 工作原理

跨站请求伪造 (CSRF), 伪造请求头 , 调用官方 API

## 功能特性

1. 登录
2. 刷新登录
3. 发送验证码
4. 校验验证码
5. 注册(修改密码)
6. 获取用户信息 , 歌单，收藏，mv, dj 数量
7. 获取用户歌单
8. 获取用户电台
9. 获取用户关注列表
10. 获取用户粉丝列表
11. 获取用户动态
12. 获取用户播放记录
13. 获取精品歌单
14. 获取歌单详情
15. 搜索
16. 搜索建议
17. 获取歌词
18. 歌曲评论
19. 收藏单曲到歌单
20. 专辑评论
21. 歌单评论
22. mv 评论
23. 电台节目评论
24. banner
25. 获取歌曲详情
26. 获取专辑内容
27. 获取歌手单曲
28. 获取歌手 mv
29. 获取歌手专辑
30. 获取歌手描述
31. 获取相似歌手
32. 获取相似歌单
33. 相似 mv
34. 获取相似音乐
35. 获取最近 5 个听了这首歌的用户
36. 获取每日推荐歌单
37. 获取每日推荐歌曲
38. 私人 FM
39. 签到
40. 喜欢音乐
41. 垃圾桶
42. 歌单 ( 网友精选碟 )
43. 新碟上架
44. 热门歌手
45. 最新 mv
46. 推荐 mv
47. 推荐歌单
48. 推荐新音乐
49. 推荐电台
50. 推荐节目
51. 独家放送
52. mv 排行
53. 获取 mv 数据
54. 播放 mv/视频
55. 排行榜
56. 歌手榜
57. 云盘
58. 电台 - 推荐
59. 电台 - 分类
60. 电台 - 分类推荐
61. 电台 - 订阅
62. 电台 - 详情
63. 电台 - 节目
64. 给评论点赞
65. 获取动态
66. 热搜列表(简略)
67. 发送私信
68. 发送私信歌单
69. 新建歌单
70. 收藏/取消收藏歌单
71. 歌单分类
72. 收藏的歌手列表
73. 订阅的电台列表
74. 相关歌单推荐
75. 付费精选接口
76. 音乐是否可用检查接口
77. 登录状态
78. 获取视频播放地址
79. 发送/删除评论
80. 热门评论
81. 视频评论
82. 退出登录
83. 所有榜单
84. 所有榜单内容摘要
85. 收藏视频
86. 收藏 MV
87. 视频详情
88. 相关视频
89. 关注用户
90. 新歌速递
91. 喜欢音乐列表(无序)
92. 收藏的 MV 列表
93. 获取最新专辑
94. 听歌打卡
95. 获取视频标签/分类下的视频
96. 已收藏专辑列表
97. 获取动态评论
98. 歌单收藏者列表
99. 云盘歌曲删除
100. 热门话题
101. 电台 - 推荐类型
102. 电台 - 非热门类型
103. 电台 - 今日优选
104. 心动模式/智能播放
105. 转发动态
106. 删除动态
107. 分享歌曲、歌单、mv、电台、电台节目到动态
108. 通知-私信
109. 通知-评论
110. 通知-@我
111. 通知-通知
112. 设置
113. 云盘数据详情
114. 私信内容
115. 我的数字专辑
116. batch批量请求接口
117. 获取视频标签列表
118. 全部mv
119. 网易出品mv
120. 收藏/取消收藏专辑
121. 专辑动态信息
122. 热搜列表(详细)
123. 更换绑定手机
124. 检测手机号码是否已注册
125. 初始化昵称
126. 更新歌单描述
127. 更新歌单名
128. 更新歌单标签
129. 默认搜索关键词
130. 删除歌单
131. 电台banner
132. 用户电台
133. 热门电台
134. 电台 - 节目详情
135. 电台 - 节目榜
136. 电台 - 新晋电台榜/热门电台榜
137. 类别热门电台
138. 云村热评(官方下架,暂不能用)
139. 电台24小时节目榜
140. 电台24小时主播榜
141. 电台最热主播榜
142. 电台主播新人榜
143. 电台付费精品榜
144. 歌手热门50首歌曲
145. 购买数字专辑
146. 获取 mv 点赞转发评论数数据
147. 获取视频点赞转发评论数数据
148. 调整歌单顺序
149. 调整歌曲顺序
150. 独家放送列表
151. 获取推荐视频
152. 获取视频分类列表 
153. 获取全部视频列表接口
154. 获取历史日推可用日期列表
155. 获取历史日推详细数据
156. 国家编码列表
157. 首页-发现
158. 首页-发现-圆形图标入口列表
159. 全部新碟
160. 数字专辑-新碟上架
161. 数字专辑&数字单曲-榜单
162. 数字专辑-语种风格馆
163. 数字专辑详情
164. 更新头像
165. 歌单封面上传
166. 楼层评论
167. 歌手全部歌曲
168. 精品歌单标签列表
169. 用户等级信息
170. 电台个性推荐
171. 用户绑定信息
172. 用户绑定手机
173. 新版评论
174. 点赞过的视频
175. 收藏视频到视频歌单
176. 删除视频歌单里的视频
177. 最近播放的视频
178. 音乐日历
179. 电台订阅者列表
180. 云贝签到信息
181. 云贝签到
182. 云贝所有任务
183. 云贝todo任务
184. 云贝今日签到信息
185. 云贝完成任务
186. 云贝收入
187. 云贝支出
188. 云贝账户信息
189. 账号信息
190. 最近联系人
191. 私信音乐
192. 抱一抱评论
193. 评论抱一抱列表
194. 收藏的专栏
195. 关注歌手新歌
196. 关注歌手新MV
197. 歌手详情
198. 云盘上传
199. 二维码登录
200. 话题详情
201. 话题详情热门动态
202. 歌单详情动态
203. 绑定手机

## 安装

```shell
$ git clone git@github.com:Binaryify/NeteaseCloudMusicApi.git

$ npm install
```

## 运行

```shell
$ node app.js
```

服务器启动默认端口为 3000, 若不想使用 3000 端口 , 可使用以下命令 : Mac/Linux

```shell
$ PORT=4000 node app.js
```

windows 下使用 git-bash 或者 cmder 等终端执行以下命令 :

```shell
$ set PORT=4000 && node app.js
```

服务器启动默认 host 为localhost,如果需要更改, 可使用以下命令 : Mac/Linux
```shell
$ HOST=127.0.0.1 node app.js
```
windows 下使用 git-bash 或者 cmder 等终端执行以下命令 :

```shell
$ set HOST=127.0.0.1 && node app.js
```

## Vercel 部署
v4.0.8 加入了 Vercel 配置文件,可以直接在 Vercel 下部署了,不需要自己的服务器
### 操作方法
1. fork 此项目
2. 在 Vercel 官网点击 `New Project`
3. 点击 `Import Git Repository` 并选择你 fork 的此项目并点击`import`
4. 点击 `PERSONAL ACCOUNT` 的 `select`
5. 直接点`Continue`
6. `PROJECT NAME`自己填,`FRAMEWORK PRESET` 选 `Other` 然后直接点 `Deploy` 接着等部署完成即可  

## 可以使用代理

在 query 参数中加上 proxy=your-proxy 即可让这一次的请求使用 proxy

```javascript
// 例子
const url = `http://localhost:3000/song/url?id=33894312&proxy=http://121.196.226.246:84`
fetch(url).then(function() {
  // do what you want
})

// 结果
// {"data":[{"id":33894312,"url":"http://m10.music.126.net/20180104125640/930a968b3fb04908b733506b3833e60b/ymusic/0fd6/4f65/43ed/a8772889f38dfcb91c04da915b301617.mp3","br":320000,"size":10691439,"md5":"a8772889f38dfcb91c04da915b301617","code":200,"expi":1200,"type":"mp3","gain":-2.0E-4,"fee":0,"uf":null,"payed":0,"flag":0,"canExtend":false}],"code": 200}
```
v3.3.0 后支持使用 PAC代理,如 `?proxy=http://192.168.0.1/proxy.pac`

## 可以在Node.js调用
v3.31.0后支持Node.js调用,导入的方法为`module`内的文件名,返回内容包含`status`和`body`,`status`为状态码,`body`为请求返回内容,参考`module_example` 文件夹下的 `test.js`
```js
const { login_cellphone, user_cloud } = require('NeteaseCloudMusicApi')
async function main() {
  try {
    const result = await login_cellphone({
      phone: '手机号',
      password: '密码'
    })
    console.log(result)
    const result2 = await user_cloud({
      cookie: result.body.cookie // 凭证
    })
    console.log(result2.body)
      
  } catch (error) {
    console.log(error)
  }
}
main()
```

## 支持 TypeScript
```ts
// test.ts
import { banner } from 'NeteaseCloudMusicApi'
banner({ type:0 }).then(res=>{
  console.log(res)
})
```

## 更新到 v3.0 说明

!>2018.10.14 更新到 3.0.0,使用了模块化机制,因为部分接口参数和 url 做了调整,如还不想升级到 3.0.0,请查看 [v2 的文档](http://binaryify.github.io/NeteaseCloudMusicApi/#/v2), [更新日志](https://github.com/Binaryify/NeteaseCloudMusicApi/blob/master/CHANGELOG.MD), [2.0+下载地址](https://github.com/Binaryify/NeteaseCloudMusicApi/releases/tag/v2.20.5), 同时 2.0+ 将不再维护

## Docker 容器运行

> 注意: 在 docker 中运行的时候, 由于使用了 request 来发请求, 所以会检查几个 proxy 相关的环境变量(如下所列), 这些环境变量 会影响到 request 的代理, 详情请参考[request 的文档](https://github.com/request/request#proxies), 如果这些环境变量 指向的代理不可用, 那么就会造成错误, 所以在使用 docker 的时候一定要注意这些环境变量. 不过, 要是你在 query 中加上了 proxy 参数, 那么环境变量会被覆盖, 就会用你通过 proxy 参数提供的代理了.

request 相关的环境变量

1. http_proxy
2. https_proxy
3. HTTP_PROXY
4. HTTPS_PROXY
5. no_proxy
6. NO_PROXY

```shell
docker pull binaryify/netease_cloud_music_api

docker run -d -p 3000:3000 --name netease_cloud_music_api    binaryify/netease_cloud_music_api


// 或者 
docker run -d -p 3000:3000 binaryify/netease_cloud_music_api

// 去掉或者设置相关的环境变量

docker run -d -p 3000:3000 --name netease_cloud_music_api -e http_proxy= -e https_proxy= -e no_proxy= -e HTTP_PROXY= -e HTTPS_PROXY= -e NO_PROXY= binaryify/netease_cloud_music_api

// 或者
docker run -d -p 3000:3000 -e http_proxy= -e https_proxy= -e no_proxy= -e HTTP_PROXY= -e HTTPS_PROXY= -e NO_PROXY= binaryify/netease_cloud_music_api
```

> 以下是自行 build docker 镜像方式

```
$ git clone https://github.com/Binaryify/NeteaseCloudMusicApi && cd NeteaseCloudMusicApi

$ sudo docker build . -t netease-music-api

$ sudo docker run -d -p 3000:3000 netease-music-api
```

## 接口文档

### 调用前须知
!> 本项目不提供线上 demo，请不要轻易信任使用他人提供的公开服务，以免发生安全问题,泄露自己的账号和密码

!> 为使用方便,降低门槛, 文档示例接口直接使用了 GET 请求,本项目同时支持 GET/POST 请按实际需求使用 (POST请求url必须添加时间戳,使每次请求url不一样,不然请求会被缓存)

!> 由于接口做了缓存处理 ( 缓存 2 分钟,不缓存数据极容易引起网易服务器高频ip错误 , 可在 app.js 设置 , 可能会导致登录后获取不到 cookie), **相同的 url** 会在两分钟内只向网易服务器发一次请求 , 如果遇到不需要缓
存结果的接口 , 可在请求 url 后面加一个时间戳参数使 url 不同 , 例子 :
`/simi/playlist?id=347230&timestamp=1503019930000` (之所以加入缓存机制是因为项目早期没有缓存机制，很多  issues 都是报 IP高频，请按自己需求改造缓存中间件(app.js)，源码不复杂)

!> 如果是跨域请求 , 请在所有请求带上 `xhrFields: { withCredentials: true }` (axios 为 `withCredentials: true`)否则
可能会因为没带上 cookie 导致 301, 具体例子可看 `public/test.html`, 访问`http://localhost:3000/test.html`(默认端口的话) 例子使用 jQuery 和 axios 

!> 301 错误基本都是没登录就调用了需要登录的接口,如果登录了还是提示 301, 基本都是缓存把数据缓存起来了,解决方法是加时间戳或者等待 2 分钟或者重启服务重新登录后再调用接口,可自行改造缓存方法

!> 部分接口如登录接口不能调用太频繁 , 否则可能会触发 503 错误或者 ip 高频错误 ,若需频繁调用 , 需要准备 IP 代理池 (更新:已加入缓存机制,但仍需注意).

!> 本项目仅供学习使用,请尊重版权，请勿利用此项目从事商业行为或进行破坏版权行为

!> 文档可能会有缓存 , 如果文档版本和 github 上的版本不一致,请清除缓存再查看

!> 由于网易限制,此项目在国外服务器或部分国内云服务上使用会受到限制,如 `460 cheating异常`,如需解决 , 可使用大陆服务器或者使用代理 , 感谢 [@hiyangguo](https://github.com/hiyangguo)提出的[解决方法](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/29#issuecomment-298358438):
在 '/util/request.js' 的 'headers' 处增加 `X-Real-IP':'211.161.244.70' // 任意国内 IP`
即可解决

!> 图片加上 `?param=宽y高` 可控制图片尺寸，如 `http://p4.music.126.net/JzNK4a5PjjPIXAgVlqEc5Q==/109951164154280311.jpg?param=200y200`, `http://p4.music.126.net/JzNK4a5PjjPIXAgVlqEc5Q==/109951164154280311.jpg?param=50y50`

!> 分页接口返回字段里有`more`,more为true则为有下一页

### 登录

说明 : 登录有三个接口,建议使用`encodeURIComponent`对密码编码或者使用`POST`请求,避免某些特殊字符无法解析,如`#`(`#`在url中会被识别为hash,而不是query)

#### 1. 手机登录

**必选参数 :**   
`phone`: 手机号码

`password`: 密码



**可选参数 :**   
`countrycode`: 国家码，用于国外手机号登录，例如美国传入：`1`

`md5_password`: md5加密后的密码,传入后 `password` 将失效  

**接口地址 :** `/login/cellphone`

**调用例子 :** `/login/cellphone?phone=xxx&password=yyy` `/login/cellphone?phone=xxx&md5_password=yyy`

#### 2. 邮箱登录

**必选参数 :**   

`email`: 163 网易邮箱   

`password`: 密码

**可选参数 :**  

`md5_password`: md5加密后的密码,传入后 `password` 将失效

**接口地址 :** `/login`

**调用例子 :** `/login?email=xxx@163.com&password=yyy`

完成登录后 , 会在浏览器保存一个 Cookies 用作登录凭证 , 大部分 API 都需要用到这个
Cookies,非跨域情况请求会自动带上 Cookies,跨域情况参考`调用前须知`

v3.30.0后支持手动传入cookie,登录接口返回内容新增 `cookie` 字段,保存到本地后,get请求带上`?cookie=xxx` 或者 post请求body带上 `cookie` 即可,如:`/user/cloud?cookie=xxx` 或者
```
{
    ...,
    cookie:"xxx"
}
```
#### 3. 二维码登录
说明: 二维码登录涉及到3个接口,调用务必带上时间戳,防止缓存
##### 1. 二维码key生成接口  

说明: 调用此接口可生成一个key  

**接口地址 :** `/login/qr/key`
##### 2. 二维码生成接口
说明: 调用此接口传入上一个接口生成的key可生成二维码图片的base64和二维码信息,可使用base64展示图片,或者使用二维码信息内容自行使用第三方二维码生产库渲染二维码  

必选参数: `key`,由第一个接口生成  

可选参数: `qrimg` 传入后会额外返回二维码图片base64编码  

**接口地址 :** `/login/qr/create`  

**调用例子 :** `/login/qr/create?key=xxx`  


##### 3.  二维码检测扫码状态接口
说明: 轮询此接口可获取二维码扫码状态,800为二维码过期,801为等待扫码,802为待确认,803为授权登录成功(803状态码下会返回cookies)

必选参数: `key`,由第一个接口生成  

**接口地址 :** `/login/qr/check`

**调用例子 :** `/login/qr/check?key=xxx`  

调用可参考项目文件例子`/public/qrlogin.html` (访问地址:http://localhost:3000/qrlogin.html)


#### 注意

调用登录接口的速度比调用其他接口慢 , 因为登录过程调用了加密算法

### 刷新登录

说明 : 调用此接口 , 可刷新登录状态

**调用例子 :** `/login/refresh`

### 发送验证码

说明 : 调用此接口 ,传入手机号码, 可发送验证码

**必选参数 :** `phone`: 手机号码  

**可选参数 :**
`ctcode`:  国家区号,默认86即中国

**接口地址 :** `/captcha/sent`

**调用例子 :** `/captcha/sent?phone=13xxx`

### 验证验证码

说明 : 调用此接口 ,传入手机号码和验证码, 可校验验证码是否正确

**必选参数 :** `phone`: 手机号码  

`captcha`: 验证码

**可选参数 :**

`ctcode`:  国家区号,默认86即中国

**接口地址 :** `/captcha/verify`

**调用例子 :** `/captcha/verify?phone=13xxx&captcha=1597`


### 注册(修改密码)

说明 : 调用此接口 ,传入手机号码和验证码,密码,昵称, 可注册网易云音乐账号(同时可修改密码)

**必选参数 :** 

`captcha`: 验证码

`phone` :  手机号码 

`password`: 密码

`nickname`: 昵称

**可选参数 :**  

`countrycode`: 国家码，用于国外手机号，例如美国传入：`1` ,默认86即中国

**接口地址 :** `/register/cellphone`

**调用例子 :** `/register/cellphone?phone=13xxx&password=xxxxx&captcha=1234&nickname=binary1345`

### 检测手机号码是否已注册
说明 : 调用此接口 ,可检测手机号码是否已注册  
**必选参数 :**  
`phone` :  手机号码  

**可选参数 :**  
`countrycode`: 国家码，用于国外手机号，例如美国传入：`1` ,默认86即中国  

**接口地址 :** `/cellphone/existence/check`

**调用例子 :** `/cellphone/existence/check?phone=13xxx`

### 初始化昵称
说明 : 刚注册的账号(需登录),调用此接口 ,可初始化昵称  
**必选参数 :** 
`nickname` :  昵称  

**接口地址 :** `/activate/init/profile`

**调用例子 :** `/activate/init/profile?nickname=testUser2019`

### 更换绑定手机
说明 : 调用此接口 ,可更换绑定手机(流程:先发送验证码到原手机号码,再发送验证码到新手机号码然后再调用此接口)

**必选参数 :** 
`oldcaptcha`: 原手机验证码

`captcha`: 新手机验证码

`phone` :  手机号码  

`ctcode` :  国家区号,默认86即中国

**接口地址 :** `/rebind`

**调用例子 :** `/rebind?phone=xxx&oldcaptcha=1234&captcha=5678`

### 退出登录

说明 : 调用此接口 , 可退出登录

**调用例子 :** `/logout`

### 登录状态

说明 : 调用此接口,可获取登录状态

**接口地址 :** `/login/status`


### 获取用户详情

说明 : 登录后调用此接口 , 传入用户 id, 可以获取用户详情

**必选参数 :** `uid` : 用户 id

**接口地址 :** `/user/detail`

**调用例子 :** `/user/detail?uid=32953014`

### 获取账号信息

说明 : 登录后调用此接口 ,可获取用户账号信息

**接口地址 :** `/user/account`

**调用例子 :** `/user/account`

### 获取用户信息 , 歌单，收藏，mv, dj 数量

说明 : 登录后调用此接口 , 可以获取用户信息

**接口地址 :** `/user/subcount`

**调用例子 :** `/user/subcount`

### 获取用户等级信息

说明 : 登录后调用此接口 , 可以获取用户等级信息,包含当前登录天数,听歌次数,下一等级需要的登录天数和听歌次数,当前等级进度,对应 https://music.163.com/#/user/level 

**接口地址 :** `/user/level`

**调用例子 :** `/user/level`


### 获取用户绑定信息

说明 : 登录后调用此接口 , 可以获取用户绑定信息

**必选参数 :** `uid` : 用户 id  


**接口地址 :** `/user/binding`

**调用例子 :** `/user/binding?uid=32953014`


### 用户绑定手机

说明 : 登录后调用此接口 , 可以更换绑定手机

**必选参数 :**   

`phone` : 手机号码 

`oldcaptcha`: 原手机号码的验证码

`captcha`:新手机号码的验证码

**可选参数 :**  

`countrycode`: 国家地区代码,默认86


**接口地址 :** `/user/replacephone`

**调用例子 :** `/user/replacephone?phone=xxx&captcha=1234&oldcaptcha=2345`


### 更新用户信息

说明 : 登录后调用此接口 , 传入相关信息,可以更新用户信息

**必选参数 :**

```
gender: 性别 0:保密 1:男性 2:女性

birthday: 出生日期,时间戳 unix timestamp

nickname: 用户昵称

province: 省份id

city: 城市id

signature：用户签名
```

**接口地址 :** `/user/update`

**调用例子 :** `/user/update?gender=0&signature=测试签名&city=440300&nickname=binary&birthday=1525918298004&province=440000`

### 更新头像
说明 : 登录后调用此接口,使用`'Content-Type': 'multipart/form-data'`上传图片formData(name为'imgFile'),可更新头像(参考:https://github.com/Binaryify/NeteaseCloudMusicApi/blob/master/public/avatar_update.html),支持命令行调用,参考module_example目录下`avatar_upload.js`

**可选参数 :**

`imgSize` : 图片尺寸,默认为300

`imgX` : 水平裁剪偏移,方形图片可不传,默认为0
`imgY` : 垂直裁剪偏移,方形图片可不传,默认为0

**接口地址 :** `/avatar/upload`

**调用例子 :** `/avatar/upload?imgSize=200`

### 国家编码列表
说明 : 调用此接口,可获取国家编码列表

**接口地址 :** `/countries/code/list`

### 获取用户歌单

说明 : 登录后调用此接口 , 传入用户 id, 可以获取用户歌单

**必选参数 :** `uid` : 用户 id  

**可选参数 :**

`limit` : 返回数量 , 默认为 30  

`offset` : 偏移数量，用于分页 , 如 :( 页数 -1)\*30, 其中 30 为 limit 的值 , 默认为 0

**接口地址 :** `/user/playlist`

**调用例子 :** `/user/playlist?uid=32953014`

返回数据如下图 :
![用户歌单](https://raw.githubusercontent.com/Binaryify/NeteaseCloudMusicApi/master/static/%E7%94%A8%E6%88%B7%E6%AD%8C%E5%8D%95.png)

### 更新歌单

说明 : 登录后调用此接口,可以更新用户歌单

**必选参数 :**  

```
id:歌单id

name:歌单名字

desc:歌单描述

tags:歌单tag ,多个用 `;` 隔开,只能用官方规定标签
```

**接口地址 :** `/playlist/update`

**调用例子 :** `/playlist/update?id=24381616&name=新歌单&desc=描述&tags=欧美`

### 更新歌单描述
说明 : 登录后调用此接口,可以单独更新用户歌单描述

**必选参数 :**  
```
id:歌单id

desc:歌单描述

```
**接口地址 :** `/playlist/desc/update`  

**调用例子 :** `/playlist/desc/update?id=24381616&desc=描述`  

### 更新歌单名
说明 : 登录后调用此接口,可以单独更新用户歌单名

**必选参数 :**  

```
id: 歌单id

name: 歌单名

```
**接口地址 :** `/playlist/name/update`  

**调用例子 :** `/playlist/name/update?id=24381616&name=歌单名` 

### 更新歌单标签
说明 : 登录后调用此接口,可以单独更新用户歌单标签

**必选参数 :**  

```
id: 歌单id

tags: 歌单标签

```
**接口地址 :** `/playlist/tags/update`  

**调用例子 :** `/playlist/tags/update?id=24381616&tags=学习` 


### 歌单封面上传
说明 : 登录后调用此接口,使用`'Content-Type': 'multipart/form-data'`上传图片formData(name为'imgFile'),可更新歌单封面(参考:https://github.com/Binaryify/NeteaseCloudMusicApi/blob/master/public/playlist_cover_update.html)

**必选参数 :**  
`id`: 歌单id 3143833470

**可选参数 :**

`imgSize` : 图片尺寸,默认为300

`imgX` : 水平裁剪偏移,方形图片可不传,默认为0
`imgY` : 垂直裁剪偏移,方形图片可不传,默认为0

**接口地址 :** `/playlist/cover/update`

**调用例子 :** `/playlist/cover/update?id=3143833470&imgSize=200`


### 调整歌单顺序
说明 : 登录后调用此接口,可以根据歌单id顺序调整歌单顺序


**必选参数 :**   

`ids`: 歌单id列表

**接口地址 :** `/playlist/order/update`  

**调用例子 :** `/playlist/order/update?ids=[111,222]` 

### 调整歌曲顺序
说明 : 登录后调用此接口,可以根据歌曲id顺序调整歌曲顺序  


**必选参数 :**   
`pid`: 歌单id  

`ids`: 歌曲id列表

**接口地址 :** `/song/order/update`  

**调用例子 :** `/song/order/update?pid=2039116066&ids=[5268328,1219871]` 

### 获取用户电台

说明 : 登录后调用此接口 , 传入用户 id, 可以获取用户电台

**必选参数 :** `uid` : 用户 id

**接口地址 :** `/user/dj`

**调用例子 :** `/user/dj?uid=32953014`

### 获取用户关注列表

说明 : 登录后调用此接口 , 传入用户 id, 可以获取用户关注列表

**必选参数 :** `uid` : 用户 id

**可选参数 :**  

`limit` : 返回数量 , 默认为 30  

`offset` : 偏移数量，用于分页 ,如 :( 页数 -1)\*30, 其中 30 为 limit 的值 , 默认为 0

**接口地址 :** `/user/follows`

**调用例子 :** `/user/follows?uid=32953014`

### 获取用户粉丝列表

说明 : 登录后调用此接口 , 传入用户 id, 可以获取用户粉丝列表

**必选参数 :** `uid` : 用户 id  

**可选参数 :** 
`limit` : 返回数量 , 默认为 30   

`offset` : 偏移数量，用于分页 ,如 :( 页数 -1)\*30, 其中 30 为 limit 的值 , 默认为 0

**接口地址 :** `/user/followeds`

**调用例子 :** `/user/followeds?uid=32953014` `/user/followeds?uid=416608258&limit=1` `/user/followeds?uid=416608258&limit=1&offset=1`

### 获取用户动态

说明 : 登录后调用此接口 , 传入用户 id, 可以获取用户动态

**必选参数 :** `uid` : 用户 id

**可选参数 :** `limit` : 返回数量 , 默认为 30 

`lasttime` : 返回数据的 `lasttime` ,默认-1,传入上一次返回结果的 lasttime,将会返回下一页的数据

**接口地址 :** `/user/event`

**调用例子 :** `/user/event?uid=32953014`  `/user/event?uid=32953014&limit=1&lasttime=1558011138743`

返回结果的`type`参数对应:
```
18 分享单曲
19 分享专辑
17、28 分享电台节目
22 转发
39 发布视频
35、13 分享歌单
24 分享专栏文章
41、21 分享视频
```

### 转发用户动态
说明 : 登录后调用此接口 ,可以转发用户动态

**必选参数 :** `uid` : 用户 id  

`evId` : 动态 id  

`forwards` : 转发的评论

**接口地址 :** `/event/forward`

**调用例子 :** `/event/forward?evId=6712917601&uid=32953014&forwards=测试内容`


### 删除用户动态
说明 : 登录后调用此接口 ,可以删除用户动态

**必选参数 :** `evId` :  动态 id  

**接口地址 :** `/event/del`

**调用例子 :** `/event/del?evId=6712917601`

### 分享歌曲、歌单、mv、电台、电台节目到动态
说明 : 登录后调用此接口 ,可以分享歌曲、歌单、mv、电台、电台节目到动态

**必选参数 :** `id` :   资源 id  （歌曲，歌单，mv，电台，电台节目对应 id）

**可选参数 :** `type`: 资源类型，默认歌曲 song，可传 `song`,`playlist`,`mv`,`djradio`,`djprogram`

`msg`: 内容，140 字限制，支持 emoji，@用户名（`/user/follows`接口获取的用户名，用户名后和内容应该有空格），图片暂不支持

**接口地址 :** `/share/resource`

**调用例子 :** `/share/resource?id=1297494209&msg=测试` `/share/resource?type=djradio&id=336355127` `/share/resource?type=djprogram&id=2061034798` `/share/resource?type=djprogram&id=2061034798&msg=测试@binaryify 测试` 

### 获取动态评论

说明 : 登录后调用此接口 , 可以获取动态下评论

**必选参数 :** `threadId` : 动态 id，可通过 `/event`，`/user/event` 接口获取

**接口地址 :** `/comment/event`

**调用例子 :** `/comment/event?threadId=A_EV_2_6559519868_32953014`

### 关注/取消关注用户

说明 : 登录后调用此接口 , 传入用户 id, 和操作 t,可关注/取消关注用户

**必选参数 :**

`id` : 用户 id

`t` : `1`为关注,其他为取消关注

**接口地址 :** `/follow`

**调用例子 :** `/follow?id=32953014&t=1`

### 获取用户播放记录

说明 : 登录后调用此接口 , 传入用户 id, 可获取用户播放记录

**必选参数 :** `uid` : 用户 id

**可选参数 :** `type` : type=1 时只返回 weekData, type=0 时返回 allData

**接口地址 :** `/user/record`

**调用例子 :** `/user/record?uid=32953014&type=1`

### 获取热门话题

说明 : 调用此接口 , 可获取热门话题

**可选参数 :** `limit`: 取出评论数量 , 默认为 20

`offset`: 偏移数量 , 用于分页 , 如 :( 评论页数 -1)\*20, 其中 20 为 limit 的值

**接口地址 :** `/hot/topic`

**调用例子 :** `/hot/topic?limit=30&offset=30`

### 获取话题详情

说明 : 调用此接口 , 可获取话题详情

**接口地址 :** `/topic/detail`

**调用例子 :** `/topic/detail?actid=111551188`
### 获取话题详情热门动态

说明 : 调用此接口 , 可获取话题详情热门动态

**接口地址 :** `/topic/detail/event/hot`

**调用例子 :** `/topic/detail/event/hot?actid=111551188`


### 云村热评(官方下架,暂不能用)
说明 : 登录后调用此接口 , 可获取云村热评

**接口地址 :** `/comment/hotwall/list`

**调用例子 :** `/comment/hotwall/list`

### 心动模式/智能播放
说明 : 登录后调用此接口 , 可获取心动模式/智能播放列表
**必选参数 :** `id` : 歌曲 id

`pid` : 歌单 id

**可选参数 :**
`sid` : 要开始播放的歌曲的 id

**接口地址 :** `/playmode/intelligence/list`

**调用例子 :** `/playmode/intelligence/list?id=33894312&pid=24381616` , `/playmode/intelligence/list?id=33894312&pid=24381616&sid=36871368`

### 获取动态消息

说明 : 调用此接口 , 可获取各种动态 , 对应网页版网易云，朋友界面里的各种动态消息
，如分享的视频，音乐，照片等！

**必选参数 :** 
`pagesize` : 每页数据,默认20

`lasttime` : 返回数据的 `lasttime` ,默认-1,传入上一次返回结果的 lasttime,将会返回下一页的数据

**接口地址 :** `/event`

**调用例子 :** `/event?pagesize=30&lasttime=1556740526369`

### 歌手分类列表

说明 : 调用此接口,可获取歌手分类列表  

**可选参数 :**

`limit` : 返回数量 , 默认为 30

`offset` : 偏移数量，用于分页 , 如
: 如 :( 页数 -1)\*30, 其中 30 为 limit 的值 , 默认为 0
`initial`: 按首字母索引查找参数,如 `/artist/list?type=1&area=96&initial=b` 返回内容将以 name 字段开头为 b 或者拼音开头为 b 为顺序排列, 热门传-1,#传0

`type` 取值:

```
-1:全部
1:男歌手
2:女歌手
3:乐队
```

`area` 取值:
```
-1:全部
7华语
96欧美
8:日本
16韩国
0:其他
```
    

**接口地址 :** `/artist/list`

**调用例子 :** `/artist/list?type=1&area=96&initial=b` `/artist/list?type=2&area=2&initial=b`


### 收藏/取消收藏歌手

说明 : 调用此接口,可收藏歌手

**必选参数 :**

`id` : 歌手 id

`t`:操作,1 为收藏,其他为取消收藏

**接口地址 :** `/artist/sub`

**调用例子 :** `/artist/sub?id=6452&t=1`


### 歌手热门50首歌曲

说明 : 调用此接口,可获取歌手热门50首歌曲

**必选参数 :**

`id` : 歌手 id

**接口地址 :** `/artist/top/song`

**调用例子 :** `/artist/top/song?id=6452`

### 歌手全部歌曲
说明 : 调用此接口,可获取歌手全部歌曲
**必选参数 :**

`id` : 歌手 id

**可选参数 :**

`order` : `hot` ,`time` 按照热门或者时间排序

`limit`: 取出歌单数量 , 默认为 50

`offset`: 偏移数量 , 用于分页 , 如 :( 评论页数 -1)\*50, 其中 50 为 limit 的值

**接口地址 :** `/artist/songs`

**调用例子 :** `/artist/songs?id=6452`

### 收藏的歌手列表

说明 : 调用此接口,可获取收藏的歌手列表

**接口地址 :** `/artist/sublist`

**调用例子 :** `/artist/sublist`

### 收藏的专栏

说明 : 调用此接口,可获取收藏的专栏  

**可选参数 :**  

`limit`: 取出歌单数量 , 默认为 50

`offset`: 偏移数量 , 用于分页 , 如 :( 评论页数 -1)\*50, 其中 50 为 limit 的值

**接口地址 :** `/topic/sublist`

**调用例子 :** `/topic/sublist?limit=2&offset=1`

### 收藏视频

说明 : 调用此接口,可收藏视频

**必选参数 :**

`id` : 视频 id

`t` : 1 为收藏,其他为取消收藏

**接口地址 :** `/video/sub`

**调用例子 :** `/video/sub`

### 收藏/取消收藏 MV

说明 : 调用此接口,可收藏/取消收藏 MV

**必选参数 :**

`mvid` : MV id

`t` : 1 为收藏,其他为取消收藏

**接口地址 :** `/mv/sub`

**调用例子 :** `/mv/sub`

### 收藏的 MV 列表

说明 : 调用此接口,可获取收藏的 MV 列表

**接口地址 :** `/mv/sublist`

**调用例子 :** `/mv/sublist`

### 歌单分类

说明 : 调用此接口,可获取歌单分类,包含 category 信息

**接口地址 :** `/playlist/catlist`

**调用例子 :** `/playlist/catlist`

### 热门歌单分类

说明 : 调用此接口,可获取歌单分类,包含 category 信息

**接口地址 :** `/playlist/hot`

**调用例子 :** `/playlist/hot`

### 歌单 ( 网友精选碟 )

说明 : 调用此接口 , 可获取网友精选碟歌单

**可选参数 :** `order`: 可选值为 'new' 和 'hot', 分别对应最新和最热 , 默认为
'hot'

`cat`:`cat`: tag, 比如 " 华语 "、" 古风 " 、" 欧美 "、" 流行 ", 默认为
"全部",可从歌单分类接口获取(/playlist/catlist)  

`limit`: 取出歌单数量 , 默认为 50

`offset`: 偏移数量 , 用于分页 , 如 :( 评论页数 -1)\*50, 其中 50 为 limit 的值

**接口地址 :** `/top/playlist`

**调用例子 :** `/top/playlist?limit=10&order=new`

### 精品歌单标签列表
说明 : 调用此接口 , 可获取精品歌单标签列表

**接口地址 :** `/playlist/highquality/tags`

**调用例子 :** `/playlist/highquality/tags`

### 获取精品歌单

说明 : 调用此接口 , 可获取精品歌单

**可选参数 :** `cat`: tag, 比如 " 华语 "、" 古风 " 、" 欧美 "、" 流行 ", 默认为
"全部",可从精品歌单标签列表接口获取(`/playlist/highquality/tags`)

`limit`: 取出歌单数量 , 默认为 20

`before`: 分页参数,取上一页最后一个歌单的 `updateTime` 获取下一页数据

**接口地址 :** `/top/playlist/highquality`

**调用例子 :** `/top/playlist/highquality?before=1503639064232&limit=3`

### 相关歌单推荐

说明 : 调用此接口,传入歌单 id 可获取相关歌单(对应页面 [https://music.163.com/#/playlist?id=1](https://music.163.com/#/playlist?id=1))

**必选参数 :** `id` : 歌单 id

**接口地址 :** `/related/playlist`

**调用例子 :** `/related/playlist?id=1`

### 获取歌单详情

说明 : 歌单能看到歌单名字, 但看不到具体歌单内容 , 调用此接口 , 传入歌单 id, 可
以获取对应歌单内的所有的音乐(未登录状态只能获取不完整的歌单,登录后是完整的)，但是返回的trackIds是完整的，tracks 则是不完整的，可拿全部 trackIds 请求一次 `song/detail` 接口获取所有歌曲的详情 ([https://github.com/Binaryify/NeteaseCloudMusicApi/issues/452](https://github.com/Binaryify/NeteaseCloudMusicApi/issues/452))

**必选参数 :** `id` : 歌单 id

**可选参数 :** `s` : 歌单最近的 s 个收藏者,默认为8

**接口地址 :** `/playlist/detail`

**调用例子 :** `/playlist/detail?id=24381616`

### 歌单详情动态

说明 : 调用后可获取歌单详情动态部分,如评论数,是否收藏,播放数

**必选参数 :** `id` : 歌单 id

**接口地址 :** `/playlist/detail/dynamic`

**调用例子 :** `/playlist/detail/dynamic?id=24381616`

### 获取音乐 url

说明 : 使用歌单详情接口后 , 能得到的音乐的 id, 但不能得到的音乐 url, 调用此接口, 传入的音乐 id( 可多个 , 用逗号隔开 ), 可以获取对应的音乐的 url,未登录状态或者非会员返回试听片段(返回字段包含被截取的正常歌曲的开始时间和结束时间)

> 注 : 部分用户反馈获取的 url 会 403,[hwaphon](https://github.com/hwaphon)找到的解决方案是当获取到音乐的 id 后，将 https://music.163.com/song/media/outer/url?id=id.mp3 以 src 赋予 Audio 即可播放

**必选参数 :** `id` : 音乐 id

**可选参数 :** `br`: 码率,默认设置了 999000 即最大码率,如果要 320k 则可设置为 320000,其他类推

**接口地址 :** `/song/url`

**调用例子 :** `/song/url?id=33894312` `/song/url?id=405998841,33894312`


### 音乐是否可用

说明: 调用此接口,传入歌曲 id, 可获取音乐是否可用,返回 `{ success: true, message: 'ok' }` 或者 `{ success: false, message: '亲爱的,暂无版权' }`

**必选参数 :** `id` : 歌曲 id

**可选参数** : `br`: 码率,默认设置了 999000 即最大码率,如果要 320k 则可设置为 320000,其他类推

**接口地址 :** `/check/music`

**调用例子 :** `/check/music?id=33894312`

### 搜索

说明 : 调用此接口 , 传入搜索关键词可以搜索该音乐 / 专辑 / 歌手 / 歌单 / 用户 ,
关键词可以多个 , 以空格隔开 , 如 " 周杰伦 搁浅 "( 不需要登录 ), 搜索获取的
mp3url 不能直接用 , 可通过 `/song/url` 接口传入歌曲 id 获取具体的播放链接

**必选参数 :** `keywords` : 关键词

**可选参数 :** `limit` : 返回数量 , 默认为 30 `offset` : 偏移数量，用于分页 , 如
: 如 :( 页数 -1)\*30, 其中 30 为 limit 的值 , 默认为 0

`type`: 搜索类型；默认为 1 即单曲 , 取值意义 : 1: 单曲, 10: 专辑, 100: 歌手, 1000:
歌单, 1002: 用户, 1004: MV, 1006: 歌词, 1009: 电台, 1014: 视频, 1018:综合

**接口地址 :** `/search` 或者 `/cloudsearch`(更全)

**调用例子 :** `/search?keywords= 海阔天空` `/cloudsearch?keywords= 海阔天空`

### 默认搜索关键词
说明 : 调用此接口 , 可获取默认搜索关键词

**接口地址 :** `/search/default`

### 热搜列表(简略)

说明 : 调用此接口,可获取热门搜索列表

**接口地址 :** `/search/hot`

**调用例子 :** `/search/hot`

### 热搜列表(详细)

说明 : 调用此接口,可获取热门搜索列表

**接口地址 :** `/search/hot/detail`

**调用例子 :** `/search/hot/detail`

### 搜索建议

说明 : 调用此接口 , 传入搜索关键词可获得搜索建议 , 搜索结果同时包含单曲 , 歌手 ,
歌单 ,mv 信息

**必选参数 :** `keywords` : 关键词

**可选参数 :** `type` : 如果传 'mobile' 则返回移动端数据

**接口地址 :** `/search/suggest`

**调用例子 :** `/search/suggest?keywords= 海阔天空` `/search/suggest?keywords= 海阔天空&type=mobile`

### 搜索多重匹配

说明 : 调用此接口 , 传入搜索关键词可获得搜索结果

**必选参数 :** `keywords` : 关键词

**接口地址 :** `/search/multimatch`

**调用例子 :** `/search/multimatch?keywords= 海阔天空`

### 新建歌单

说明 : 调用此接口 , 传入歌单名字可新建歌单

**必选参数 :** `name` : 歌单名

**可选参数 :**   

`privacy` : 是否设置为隐私歌单，默认否，传'10'则设置成隐私歌单  

`type` : 歌单类型,默认'NORMAL',传 'VIDEO'则为视频歌单

**接口地址 :** `/playlist/create`

**调用例子 :** `/playlist/create?name=测试歌单`,`/playlist/create?name=test&type=VIDEO`

### 删除歌单

说明 : 调用此接口 , 传入歌单id可删除歌单

**必选参数 :** `id` : 歌单id,可多个,用逗号隔开

**接口地址 :** `/playlist/delete`

**调用例子 :** `/playlist/delete?id=2947311456` , `/playlist/delete?id=5013464397,5013427772`


### 收藏/取消收藏歌单

说明 : 调用此接口 , 传入类型和歌单 id 可收藏歌单或者取消收藏歌单

**必选参数 :**

`t` : 类型,1:收藏,2:取消收藏
`id` : 歌单 id

**接口地址 :** `/playlist/subscribe`

**调用例子 :** `/playlist/subscribe?t=1&id=106697785` `/playlist/subscribe?t=2&id=106697785`



### 歌单收藏者
说明 : 调用此接口 , 传入歌单 id 可获取歌单的所有收藏者  
**必选参数 :**

`id` : 歌单 id

**可选参数 :** `limit`: 取出评论数量 , 默认为 20

`offset`: 偏移数量 , 用于分页 , 如 :( 评论页数 -1)\*20, 其中 20 为 limit 的值

**接口地址 :** `/playlist/subscribers`

**调用例子 :** `/playlist/subscribers?id=544215255&limit=30`


### 对歌单添加或删除歌曲

说明 : 调用此接口 , 可以添加歌曲到歌单或者从歌单删除某首歌曲 ( 需要登录 )

**必选参数 :**

`op`: 从歌单增加单曲为 add, 删除为 del

`pid`: 歌单 id
`tracks`: 歌曲 id,可多个,用逗号隔开

**接口地址 :** `/playlist/tracks`

**调用例子 :** `/playlist/tracks?op=add&pid=24381616&tracks=347231` ( 对应把歌曲添加到 ' 我 ' 的歌单 , 测试的时候请把这里的 pid 换成你自己的, id 和 tracks 不对可能会报 502 错误)

### 收藏视频到视频歌单
说明 : 调用此接口 , 可收藏视频到视频歌单 ( 需要登录 )

**必选参数 :**

`pid` : 歌单 id

`ids` : 视频id,支持多个,用`,`隔开

**接口地址 :** `/playlist/track/add`

**调用例子 :** `/playlist/track/add?pid=5271999357&ids=186041`

### 删除视频歌单里的视频
说明 : 调用此接口 , 可删除视频歌单里的视频 ( 需要登录 )
**必选参数 :**

`pid` : 歌单 id

`ids` : 视频id,支持多个,用`,`隔开

**接口地址 :** `/playlist/track/delete`

**调用例子 :** `/playlist/track/delete?pid=5271999357&ids=186041`

### 最近播放的视频
说明 : 调用此接口 , 可获取最近播放的视频 ( 需要登录 )

**接口地址 :** `/playlist/video/recent`

**调用例子 :** `/playlist/video/recent`

### 获取歌词

说明 : 调用此接口 , 传入音乐 id 可获得对应音乐的歌词 ( 不需要登录 )

**必选参数 :** `id`: 音乐 id

**接口地址 :** `/lyric`

**调用例子 :** `/lyric?id=33894312`

返回数据如下图 :
![获取歌词](https://raw.githubusercontent.com/Binaryify/NeteaseCloudMusicApi/master/static/%E6%AD%8C%E8%AF%8D.png)

### 新歌速递

说明 : 调用此接口 , 可获取新歌速递

**必选参数 :**

`type`: 地区类型 id,对应以下:

```
全部:0

华语:7

欧美:96

日本:8

韩国:16
```

**接口地址 :** `/top/song`

**调用例子 :** `/top/song?type=96`

### 首页-发现
说明 : 调用此接口 , 可获取APP首页信息

**接口地址 :** `/homepage/block/page` 

**可选参数 :** `refresh`: 是否刷新数据,默认为true


### 首页-发现-圆形图标入口列表
说明 : 调用此接口 , 可获取APP首页圆形图标入口列表

**接口地址 :** `/homepage/dragon/ball`


### 歌曲评论

说明 : 调用此接口 , 传入音乐 id 和 limit 参数 , 可获得该音乐的所有评论 ( 不需要登录 )

**必选参数 :** `id`: 音乐 id

**可选参数 :** `limit`: 取出评论数量 , 默认为 20

`offset`: 偏移数量 , 用于分页 , 如 :( 评论页数 -1)\*20, 其中 20 为 limit 的值  

`before`: 分页参数,取上一页最后一项的 `time` 获取下一页数据(获取超过5000条评论的时候需要用到)

**接口地址 :** `/comment/music`

**调用例子 :** `/comment/music?id=186016&limit=1` 对应晴天评论

返回数据如下图 :
![获取评论](https://raw.githubusercontent.com/Binaryify/NeteaseCloudMusicApi/master/static/comment.png)

### 楼层评论

说明 : 调用此接口 , 传入资源 parentCommentId 和资源类型 type和资源id 参数, 可获得该资源的歌曲楼层评论

**必选参数 :**   
`parentCommentId`: 楼层评论 id

`id` : 资源 id

`tpye`: 数字 , 资源类型 , 对应歌曲 , mv, 专辑 , 歌单 , 电台, 视频对应以下类型

```
0: 歌曲

1: mv

2: 歌单

3: 专辑

4: 电台

5: 视频
```


**可选参数 :** `limit`: 取出评论数量 , 默认为 20  

`time`: 分页参数,取上一页最后一项的 `time` 获取下一页数据

**接口地址 :** `/comment/floor`

**调用例子 :** `/comment/floor?parentCommentId=1438569889&id=29764564&type=0` 

### 专辑评论

说明 : 调用此接口 , 传入音乐 id 和 limit 参数 , 可获得该专辑的所有评论 ( 不需要
登录 )

**必选参数 :** `id`: 专辑 id

**可选参数 :** `limit`: 取出评论数量 , 默认为 20

`offset`: 偏移数量 , 用于分页 , 如 :( 评论页数 -1)\*20, 其中 20 为 limit 的值  

`before`: 分页参数,取上一页最后一项的 `time` 获取下一页数据(获取超过5000条评论的时候需要用到)  

**接口地址 :** `/comment/album`

**调用例子 :** `/comment/album?id=32311`

### 歌单评论

说明 : 调用此接口 , 传入音乐 id 和 limit 参数 , 可获得该歌单的所有评论 ( 不需要
登录 )

**必选参数 :** `id`: 歌单 id

**可选参数 :** `limit`: 取出评论数量 , 默认为 20

`offset`: 偏移数量 , 用于分页 , 如 :( 评论页数 -1)\*20, 其中 20 为 limit 的值  

`before`: 分页参数,取上一页最后一项的 `time` 获取下一页数据(获取超过5000条评论的时候需要用到)

**接口地址 :** `/comment/playlist`

**调用例子 :** `/comment/playlist?id=705123491`

### mv 评论

说明 : 调用此接口 , 传入音乐 id 和 limit 参数 , 可获得该 mv 的所有评论 ( 不需要
登录 )

**必选参数 :** `id`: mv id

**可选参数 :** `limit`: 取出评论数量 , 默认为 20

`offset`: 偏移数量 , 用于分页 , 如 :( 评论页数 -1)\*20, 其中 20 为 limit 的值  

`before`: 分页参数,取上一页最后一项的 `time` 获取下一页数据(获取超过5000条评论的时候需要用到)

**接口地址 :** `/comment/mv`

**调用例子 :** `/comment/mv?id=5436712`

### 电台节目评论

说明 : 调用此接口 , 传入音乐 id 和 limit 参数 , 可获得该 电台节目 的所有评论 (
不需要登录 )

**必选参数 :** `id`: 电台节目的 id

**可选参数 :** `limit`: 取出评论数量 , 默认为 20

`offset`: 偏移数量 , 用于分页 , 如 :( 评论页数 -1)\*20, 其中 20 为 limit 的值  

`before`: 分页参数,取上一页最后一项的 `time` 获取下一页数据(获取超过5000条评论的时候需要用到)

**接口地址 :** `/comment/dj`

**调用例子 :** `/comment/dj?id=794062371`

### 视频评论

说明 : 调用此接口 , 传入音乐 id 和 limit 参数 , 可获得该 视频 的所有评论 (
不需要登录 )

**必选参数 :** `id`: 视频的 id

**可选参数 :** `limit`: 取出评论数量 , 默认为 20

`offset`: 偏移数量 , 用于分页 , 如 :( 评论页数 -1)\*20, 其中 20 为 limit 的值  

`before`: 分页参数,取上一页最后一项的 `time` 获取下一页数据(获取超过5000条评论的时候需要用到)

**接口地址 :** `/comment/video`

**调用例子 :** `/comment/video?id=89ADDE33C0AAE8EC14B99F6750DB954D`

### 热门评论

说明 : 调用此接口 , 传入 type, 资源 id 可获得对应资源热门评论 ( 不需要登录 )

**必选参数 :**

`id` : 资源 id

`tpye`: 数字 , 资源类型 , 对应歌曲 , mv, 专辑 , 歌单 , 电台, 视频对应以下类型

```
0: 歌曲

1: mv

2: 歌单

3: 专辑

4: 电台

5: 视频
```

**可选参数 :** `limit`: 取出评论数量 , 默认为 20

`offset`: 偏移数量 , 用于分页 , 如 :( 评论页数 -1)\*20, 其中 20 为 limit 的值  

`before`: 分页参数,取上一页最后一项的 `time` 获取下一页数据(获取超过5000条评论的时候需要用到)

**接口地址 :** `/comment/hot`

**调用例子 :** `/comment/hot?id=186016&type=0`

### 新版评论接口
说明 : 调用此接口 , 传入资源类型和资源id,以及排序方式,可获取对应资源的评论

**必选参数 :**   
`id` : 资源 id, 如歌曲 id,mv id  

`tpye`: 数字 , 资源类型 , 对应歌曲 , mv, 专辑 , 歌单 , 电台, 视频对应以下类型
```
0: 歌曲

1: mv

2: 歌单

3: 专辑

4: 电台

5: 视频

6: 动态
```
**可选参数 :**   
`pageNo`:分页参数,第N页,默认为1

`pageSize`:分页参数,每页多少条数据,默认20

`sortType`: 排序方式,1:按推荐排序,2:按热度排序,3:按时间排序

`cursor`: 当`sortType`为3时且页数不是第一页时需传入,值为上一条数据的time

**接口地址 :** `/comment/new`

**调用例子 :** `/comment/new?type=0&id=1407551413&sortType=3`, `/comment/new?type=0&id=1407551413&sortType=3&cursor=1602072870260&pageSize=20&pageNo=2` 

### 给评论点赞

说明 : 调用此接口 , 传入 type, 资源 id, 和评论 id cid 和 是否点赞参数 t 即可给对
应评论点赞 ( 需要登录 )

**必选参数 :** `id` : 资源 id, 如歌曲 id,mv id

`cid` : 评论 id

`t` : 是否点赞 ,1 为点赞 ,0 为取消点赞

`tpye`: 数字 , 资源类型 , 对应歌曲 , mv, 专辑 , 歌单 , 电台, 视频对应以下类型

```
0: 歌曲

1: mv

2: 歌单

3: 专辑

4: 电台

5: 视频

6: 动态
```

**接口地址 :** `/comment/like`

**调用例子 :** `/comment/like?id=29178366&cid=12840183&t=1&type=0` 对应给 [https://music.163.com/#/song?id=29178366](https://music.163.com/#/song?id=29178366) 最热门的评论点赞


注意： 动态点赞不需要传入 id 参数，需要传入动态的 `threadId`  参数,如：`/comment/like?type=6&cid=1419532712&threadId=A_EV_2_6559519868_32953014&t=0`， `threadId` 可通过 `/event`，`/user/event` 接口获取

### 抱一抱评论

说明 : 调用此接口,可抱一抱评论

**必选参数 :**   

`uid`: 用户id  

`cid`: 评论id

`sid`: 资源id

**接口地址 :** `/hug/comment`

**调用例子 :** `/hug/comment?uid=285516405&cid=1167145843&sid=863481066` 

### 评论抱一抱列表

说明 : 调用此接口,可获取评论抱一抱列表

**必选参数 :**   

`uid`: 用户id  

`cid`: 评论id

`sid`: 资源id

**可选参数 :**   

`page`:  页数

`cursor`: 上一页返回的cursor,默认-1,第一页不需要传

`idCursor`: 上一页返回的idCursor,默认-1,第一页不需要传

`pageSize` : 每页页数,默认100

**接口地址 :** `/comment/hug/list`

**调用例子 :** `/comment/hug/list?uid=285516405&cid=1167145843&sid=863481066&pageSize=2&page=1` 


### 发送/删除评论

说明 : 调用此接口,可发送评论或者删除评论

**接口地址 :** `/comment`

1. 发送评论

   **必选参数**

   `t`:1 发送, 2 回复

   `tpye`: 数字,资源类型,对应歌曲,mv,专辑,歌单,电台,视频对应以下类型

   ```
   0: 歌曲

   1: mv

   2: 歌单

   3: 专辑

   4: 电台

   5: 视频

   6: 动态
   ```

   `id`:对应资源 id

   `content` :要发送的内容

   `commentId` :回复的评论id (回复评论时必填)

   **调用例子** : `/comment?t=1&type=1&id=5436712&content=test` (往广岛之恋 mv 发送评论: test)

   注意：如给动态发送评论，则不需要传 id，需要传动态的 `threadId`,如：`/comment?t=1&type=6&threadId=A_EV_2_6559519868_32953014&content=test`

2. 删除评论

   **必选参数**

   `t`:0 删除

   `tpye`: 数字,资源类型,对应歌曲,mv,专辑,歌单,电台,视频对应以下类型  
   

   ```
   0: 歌曲

   1: mv

   2: 歌单

   3: 专辑

   4: 电台


   5: 视频

   6: 动态
   
   ```

   `id`:对应资源 id
   `content` :内容 id,可通过 `/comment/mv` 等接口获取

   **调用例子** : `/comment?t=0&type=1&id=5436712&commentId=1535550516319` (在广岛之恋 mv 删除评论)
    

    注意：如给动态删除评论，则不需要传 id，需要传动态的 `threadId`,如：`/comment?t=0&type=6&threadId=A_EV_2_6559519868_32953014&commentId=1419516382`


### banner

说明 : 调用此接口 , 可获取 banner( 轮播图 ) 数据

**可选参数 :**

`type`:资源类型,对应以下类型,默认为 0 即PC

```
0: pc

1: android

2: iphone

3: ipad
```

**接口地址 :** `/banner`

**调用例子 :** `/banner`, `/banner?type=2`

### 资源点赞( MV,电台,视频)

说明 : 调用此接口 , 可对 MV,电台,视频点赞

**必选参数 :**

`type`:资源类型,对应以下类型

```
1: mv

4: 电台

5: 视频

6: 动态
```

`t`: 操作,1 为点赞,其他未取消点赞

`id`: 资源 id

**接口地址 :** `/resource/like`

**调用例子 :** `/resource/like?t=1&type=1&id=5436712`

注意：如给动态点赞，不需要传入 id，需要传入 `threadId`,可通过 `event`,`/user/event` 接口获取，如：
`/resource/like?t=1&type=6&threadId=A_EV_2_6559519868_32953014`

### 获取点赞过的视频

说明 : 调用此接口, 可获取获取点赞过的视频  

**接口地址 :** `/playlist/mylike`

**调用例子 :** `/playlist/mylike`  

### 获取歌曲详情

说明 : 调用此接口 , 传入音乐 id(支持多个 id, 用 `,` 隔开), 可获得歌曲详情(注意:歌曲封面现在需要通过专辑内容接口获取)

**必选参数 :** `ids`: 音乐 id, 如 `ids=347230`

**接口地址 :** `/song/detail`

**调用例子 :** `/song/detail?ids=347230`,`/song/detail?ids=347230,347231`

返回数据如下图 :
![获取歌曲详情](https://raw.githubusercontent.com/Binaryify/NeteaseCloudMusicApi/master/static/songDetail.png)

### 获取专辑内容

说明 : 调用此接口 , 传入专辑 id, 可获得专辑内容

**必选参数 :** `id`: 专辑 id

**接口地址 :** `/album`

**调用例子 :** `/album?id=32311`

返回数据如下图 :
![获取专辑内容](https://raw.githubusercontent.com/Binaryify/NeteaseCloudMusicApi/master/static/%E4%B8%93%E8%BE%91.png)


### 专辑动态信息
说明 : 调用此接口 , 传入专辑 id, 可获得专辑动态信息,如是否收藏,收藏数,评论数,分享数

**必选参数 :** `id`: 专辑 id

**接口地址 :** `/album/detail/dynamic`

**调用例子 :** `/album/detail/dynamic?id=32311`

### 收藏/取消收藏专辑

说明 : 调用此接口,可收藏/取消收藏专辑

**必选参数 :**

`id` : 专辑 id

`t` : 1 为收藏,其他为取消收藏

**接口地址 :** `/album/sub`

**调用例子 :** `/album/sub?t=1` `/album/sub?t=0`

### 获取已收藏专辑列表
说明 : 调用此接口 , 可获得已收藏专辑列表

**可选参数 :**  
`limit`: 取出数量 , 默认为 25

`offset`: 偏移数量 , 用于分页 , 如 :( 页数 -1)\*25, 其中 25 为 limit 的值 , 默认
为 0

**接口地址 :** `/album/sublist`

**调用例子 :** `/album/sublist` ( 周杰伦 )

### 获取歌手单曲

说明 : 调用此接口 , 传入歌手 id, 可获得歌手部分信息和热门歌曲

**必选参数 :** `id`: 歌手 id, 可由搜索接口获得

**接口地址 :** `/artists`

**调用例子 :** `/artists?id=6452`

返回数据如下图 :
![获取歌手单曲](https://raw.githubusercontent.com/Binaryify/NeteaseCloudMusicApi/master/static/artists.png)

### 获取歌手 mv

说明 : 调用此接口 , 传入歌手 id, 可获得歌手 mv 信息 , 具体 mv 播放地址可调
用`/mv`传入此接口获得的 mvid 来拿到 , 如 :
`/artist/mv?id=6452`,`/mv?mvid=5461064`

**必选参数 :** `id`: 歌手 id, 可由搜索接口获得

**接口地址 :** `/artist/mv`

**调用例子 :** `/artist/mv?id=6452`

### 获取歌手专辑

说明 : 调用此接口 , 传入歌手 id, 可获得歌手专辑内容

**必选参数 :** `id`: 歌手 id

**可选参数 :** `limit`: 取出数量 , 默认为 50

`offset`: 偏移数量 , 用于分页 , 如 :( 页数 -1)\*50, 其中 50 为 limit 的值 , 默认
为 0

**接口地址 :** `/artist/album`

**调用例子 :** `/artist/album?id=6452&limit=30` ( 周杰伦 )

返回数据如下图 :
![获取专辑内容](https://raw.githubusercontent.com/Binaryify/NeteaseCloudMusicApi/master/static/artist_album.png)

### 获取歌手描述

说明 : 调用此接口 , 传入歌手 id, 可获得歌手描述

**必选参数 :** `id`: 歌手 id

**接口地址 :** `/artist/desc`

**调用例子 :** `/artist/desc?id=6452` ( 周杰伦 )

### 获取歌手详情

说明 : 调用此接口 , 传入歌手 id, 可获得获取歌手详情

**必选参数 :** `id`: 歌手 id

**接口地址 :** `/artist/detail`

**调用例子 :** `/artist/detail?id=11972054` (Billie Eilish)

### 获取相似歌手

说明 : 调用此接口 , 传入歌手 id, 可获得相似歌手

**必选参数 :** `id`: 歌手 id

**接口地址 :** `/simi/artist`

**调用例子 :** `/simi/artist?id=6452` ( 对应和周杰伦相似歌手 )

### 获取相似歌单

说明 : 调用此接口 , 传入歌曲 id, 可获得相似歌单

**必选参数 :** `id`: 歌曲 id

**接口地址 :** `/simi/playlist`

**调用例子 :** `/simi/playlist?id=347230` ( 对应 ' 光辉岁月 ' 相似歌单 )

### 相似 mv

说明 : 调用此接口 , 传入 `mvid` 可获取相似 mv

**必选参数 :** `mvid`: mv id

**接口地址 :** `/simi/mv`

**调用例子 :** `/simi/mv?mvid=5436712`

### 获取相似音乐

说明 : 调用此接口 , 传入歌曲 id, 可获得相似歌曲

**必选参数 :** `id`: 歌曲 id

**接口地址 :** `/simi/song`

**调用例子 :** `/simi/song?id=347230` ( 对应 ' 光辉岁月 ' 相似歌曲 )

### 获取最近 5 个听了这首歌的用户

说明 : 调用此接口 , 传入歌曲 id, 最近 5 个听了这首歌的用户

**必选参数 :** `id`: 歌曲 id

**接口地址 :** `/simi/user`

**调用例子 :** `/simi/user?id=347230` ( 对应 ' 光辉岁月 ' 相似歌曲 )

### 获取每日推荐歌单

说明 : 调用此接口 , 可获得每日推荐歌单 ( 需要登录 )

**接口地址 :** `/recommend/resource`

**调用例子 :** `/recommend/resource`

返回数据如下图 :
![每日推荐歌单](https://raw.githubusercontent.com/Binaryify/NeteaseCloudMusicApi/master/static/%E6%8E%A8%E8%8D%90%E6%AD%8C%E5%8D%95.png)

### 获取每日推荐歌曲

说明 : 调用此接口 , 可获得每日推荐歌曲 ( 需要登录 )

**接口地址 :** `/recommend/songs`

**调用例子 :** `/recommend/songs`

返回数据如下图 :
![每日推荐歌曲](https://raw.githubusercontent.com/Binaryify/NeteaseCloudMusicApi/master/static/%E6%8E%A8%E8%8D%90%E6%AD%8C%E6%9B%B2.png)

### 获取历史日推可用日期列表

说明 : 调用此接口 , 可获得历史日推可用日期列表  

**接口地址 :** `/history/recommend/songs`

**调用例子 :** `/history/recommend/songs`

### 获取历史日推详情数据

说明 : 调用此接口 ,传入当日日期, 可获得当日历史日推数据  

**必选参数 :** `date`: 日期,通过历史日推可用日期列表接口获取,不能任意日期

**接口地址 :** `/history/recommend/songs/detail`

**调用例子 :** `/history/recommend/songs/detail?date=2020-06-21`

### 私人 FM

说明 : 私人 FM( 需要登录 )

**接口地址 :** `/personal_fm`

**调用例子 :** `/personal_fm`

返回数据如下图 :

![私人 FM](https://raw.githubusercontent.com/Binaryify/NeteaseCloudMusicApi/master/static/personal_fm.png)

### 签到

说明 : 调用此接口 , 传入签到类型 ( 可不传 , 默认安卓端签到 ), 可签到 ( 需要登录
), 其中安卓端签到可获得 3 点经验 , web/PC 端签到可获得 2 点经验

**可选参数 :** `type`: 签到类型 , 默认 0, 其中 0 为安卓端签到 ,1 为 web/PC 签到

**接口地址 :** `/daily_signin`

**调用例子 :** `/daily_signin`

返回数据如下图 :

![签到成功](https://raw.githubusercontent.com/Binaryify/NeteaseCloudMusicApi/master/static/signinSuccess.png)

![签到失败](https://raw.githubusercontent.com/Binaryify/NeteaseCloudMusicApi/master/static/signinError.png)

### 喜欢音乐

说明 : 调用此接口 , 传入音乐 id, 可喜欢该音乐

**必选参数 :** `id`: 歌曲 id

**可选参数 :** `like`: 布尔值 , 默认为 true 即喜欢 , 若传 false, 则取消喜欢

**接口地址 :** `/like`

**调用例子 :** `/like?id=347230`

返回数据如下图 :

![喜欢成功](https://raw.githubusercontent.com/Binaryify/NeteaseCloudMusicApi/master/static/like.png)

喜欢成功则返回数据的 code 为 200, 其余为失败

![喜欢成功截图](https://raw.githubusercontent.com/Binaryify/NeteaseCloudMusicApi/master/static/likeSuccess.png)

### 喜欢音乐列表

说明 : 调用此接口 , 传入用户 id, 可获取已喜欢音乐id列表(id数组)

**必选参数 :** `uid`: 用户 id

**接口地址 :** `/likelist`

**调用例子 :** `/likelist?uid=32953014`

### 垃圾桶

说明 : 调用此接口 , 传入音乐 id, 可把该音乐从私人 FM 中移除至垃圾桶

**必选参数 :** `id`: 歌曲 id

**接口地址 :** `/fm_trash`

**调用例子 :** `/fm_trash?id=347230`

返回数据如下图 :

![移除成功](https://raw.githubusercontent.com/Binaryify/NeteaseCloudMusicApi/master/static/fm_trash.png)

### 新碟上架

说明 : 调用此接口 , 可获取新碟上架列表 , 如需具体音乐信息需要调用获取专辑列表接
口 `/album` , 然后传入 id, 如 `/album?id=32311&limit=30`

**可选参数 :**    

 `limit`: 取出数量 , 默认为 50

`offset`: 偏移数量 , 用于分页 , 如 :( 页数 -1)\*50, 其中 50 为 limit 的值 , 默认
为 0

`area`: ALL:全部,ZH:华语,EA:欧美,KR:韩国,JP:日本

`type` : new:全部 hot:热门,默认为 new

`year` : 年,默认本年

`month` : 月,默认本月

**接口地址 :** `/top/album`

**调用例子 :** `/top/album?offset=0&limit=30&year=2019&month=6`

### 全部新碟
说明 : 登录后调用此接口 ,可获取全部新碟  

**可选参数 :**

`limit` : 返回数量 , 默认为 30

`offset` : 偏移数量，用于分页 , 如 :( 页数 -1)\*30, 其中 30 为 limit 的值 , 默认为 0  

`area` : ALL:全部,ZH:华语,EA:欧美,KR:韩国,JP:日本

**接口地址 :** `/album/new`

**调用例子 :** `/album/new?area=KR&limit=10`

### 最新专辑

说明 : 调用此接口 ，获取云音乐首页新碟上架数据

**接口地址 :** `/album/newest`

**调用例子 :** `/album/newest`

### 听歌打卡

说明 : 调用此接口 , 传入音乐 id, 来源 id，歌曲时间 time，更新听歌排行数据

**必选参数 :** `id`: 歌曲 id, `sourceid`: 歌单或专辑 id

**可选参数 :** `time`: 歌曲播放时间,单位为秒

**接口地址 :** `/scrobble`

**调用例子 :** `/scrobble?id=518066366&sourceid=36780169&time=291`

### 热门歌手

说明 : 调用此接口 , 可获取热门歌手数据

**可选参数 :** `limit`: 取出数量 , 默认为 50

`offset`: 偏移数量 , 用于分页 , 如 :( 页数 -1)\*50, 其中 50 为 limit 的值 , 默认
为 0

**接口地址 :** `/top/artists`

**调用例子 :** `/top/artists?offset=0&limit=30`

返回数据如下图 :

![热门歌手](https://raw.githubusercontent.com/Binaryify/NeteaseCloudMusicApi/master/static/top_artists.png)

### 全部 mv
说明 : 调用此接口 , 可获取全部 mv

**可选参数 :**   
`area`: 地区,可选值为全部,内地,港台,欧美,日本,韩国,不填则为全部
`type`: 类型,可选值为全部,官方版,原生,现场版,网易出品,不填则为全部  

`order`: 排序,可选值为上升最快,最热,最新,不填则为上升最快  

`limit`: 取出数量 , 默认为 30  

`offset`: 偏移数量 , 用于分页 , 如 :( 页数 -1)\*50, 其中 50 为 limit 的值 , 默认
为 0  

**接口地址 :** `/mv/all`

**调用例子 :** `/mv/all?area=港台`

### 最新 mv
说明 : 调用此接口 , 可获取最新 mv

**可选参数 :** `area`: 地区,可选值为全部,内地,港台,欧美,日本,韩国,不填则为全部

**可选参数 :** `limit`: 取出数量 , 默认为 30

**接口地址 :** `/mv/first`

**调用例子 :** `/mv/first?limit=10`

### 网易出品mv

说明 : 调用此接口 , 可获取网易出品 mv

**可选参数 :** `limit`: 取出数量 , 默认为 30

`offset`: 偏移数量 , 用于分页 , 如 :( 页数 -1)\*30, 其中 30 为 limit 的值 , 默认
为 0

**接口地址 :** `/mv/exclusive/rcmd`

**调用例子 :** `/mv/exclusive/rcmd?limit=10`

### 推荐 mv

说明 : 调用此接口 , 可获取推荐 mv

**接口地址 :** `/personalized/mv`

**调用例子 :** `/personalized/mv`

### 推荐歌单

说明 : 调用此接口 , 可获取推荐歌单

**可选参数 :** `limit`: 取出数量 , 默认为 30 (不支持 offset)

**接口地址 :** `/personalized`

**调用例子 :** `/personalized?limit=1`

### 推荐新音乐

说明 : 调用此接口 , 可获取推荐新音乐

**可选参数 :** `limit`: 取出数量 , 默认为 10 (不支持 offset)

**接口地址 :** `/personalized/newsong`

**调用例子 :** `/personalized/newsong`

### 推荐电台

说明 : 调用此接口 , 可获取推荐电台

**接口地址 :** `/personalized/djprogram`

**调用例子 :** `/personalized/djprogram`

### 推荐节目

说明 : 调用此接口 , 可获取推荐电台

**接口地址 :** `/program/recommend`

**调用例子 :** `/program/recommend`

### 独家放送(入口列表)

说明 : 调用此接口 , 可获取独家放送

**接口地址 :** `/personalized/privatecontent`

**调用例子 :** `/personalized/privatecontent`

### 独家放送列表

说明 : 调用此接口 , 可获取独家放送列表  

**可选参数 :**

`limit` : 返回数量 , 默认为 60

`offset` : 偏移数量，用于分页 , 如 :( 页数 -1)\*60, 其中 60 为 limit 的值 , 默认为 0

**接口地址 :** `/personalized/privatecontent/list`

**调用例子 :** `/personalized/privatecontent/list?limit=1&offset=2`

### mv 排行

说明 : 调用此接口 , 可获取 mv 排行

**可选参数 :** `limit`: 取出数量 , 默认为 30  

`area`: 地区,可选值为内地,港台,欧美,日本,韩国,不填则为全部  

`offset`: 偏移数量 , 用于分页 , 如 :( 页数 -1)\*30, 其中 30 为 limit 的值 , 默认
为 0

**接口地址 :** `/top/mv`

**调用例子 :** `/top/mv?limit=10`

### 获取 mv 数据

说明 : 调用此接口 , 传入 mvid ( 在搜索音乐的时候传 type=1004 获得 ) , 可获取对应
MV 数据 , 数据包含 mv 名字 , 歌手 , 发布时间 , mv 视频地址等数据 , 其中 mv 视频
网易做了防盗链处理 , 可能不能直接播放 , 需要播放的话需要调用 ' mv 地址' 接口

**必选参数 :** `mvid`: mv 的 id

**接口地址 :** `/mv/detail`

**调用例子 :** `/mv/detail?mvid=5436712`

返回数据如下图 :

![mv 数据](https://raw.githubusercontent.com/Binaryify/NeteaseCloudMusicApi/master/static/mv.png)

### 获取 mv 点赞转发评论数数据
说明 : 调用此接口 , 传入 mvid ( 在搜索音乐的时候传 type=1004 获得 ) , 可获取对应
MV 点赞转发评论数数据  

**必选参数 :** `mvid`: mv 的 id

**接口地址 :** `/mv/detail/info`

**调用例子 :** `/mv/detail/info?mvid=5436712`

### mv 地址

说明 : 调用此接口 , 传入 mv id,可获取 mv 播放地址

**必选参数 :** `id`: mv id

**可选参数 :** `r`: 分辨率,默认1080,可从 `/mv/detail` 接口获取分辨率列表

**接口地址 :** `/mv/url`

**调用例子 :**

`/mv/url?id=5436712` `/mv/url?id=10896407&r=1080`

### 获取视频标签列表 
说明 : 调用此接口 , 可获取视频标签列表  

**接口地址 :** `/video/group/list`

**调用例子 :** `/video/group/list`

### 获取视频分类列表 
说明 : 调用此接口 , 可获取视频分类列表  

**接口地址 :** `/video/category/list`

**调用例子 :** `/video/category/list`

### 获取视频标签/分类下的视频
说明 : 调用此接口 , 传入标签/分类`id`,可获取到相关的视频,分页参数只能传入offset 

**必选参数 :** `id`: videoGroup 的 id  

**可选参数 :** `offset`: 默认0

**接口地址 :** `/video/group`

**调用例子 :** `/video/group?id=9104`

### 获取全部视频列表 
说明 : 调用此接口,可获取视频分类列表,分页参数只能传入offset 

**可选参数 :** `offset`: 默认0

**接口地址 :** `/video/timeline/all`

**调用例子 :** `/video/timeline/all`

### 获取推荐视频
说明 : 调用此接口, 可获取推荐视频,分页参数只能传入offset 

**可选参数 :** `offset`: 默认0

**接口地址 :** `/video/timeline/recommend`

**调用例子 :** `/video/timeline/recommend?offset=10`

### 相关视频

说明 : 调用此接口 , 可获取相关视频

**必选参数 :** `id`: 视频 的 id

**接口地址 :** `/related/allvideo`

**调用例子 :** `/related/allvideo?id=89ADDE33C0AAE8EC14B99F6750DB954D`


### 视频详情

说明 : 调用此接口 , 可获取视频详情

**必选参数 :** `id`: 视频 的 id

**接口地址 :** `/video/detail`

**调用例子 :** `/video/detail?id=89ADDE33C0AAE8EC14B99F6750DB954D`

### 获取视频点赞转发评论数数据
说明 : 调用此接口 , 传入 vid ( 视频id ) , 可获取对应视频点赞转发评论数数据
**必选参数 :** `vid`: 视频id

**接口地址 :** `/video/detail/info`

**调用例子 :** `/video/detail/info?vid=89ADDE33C0AAE8EC14B99F6750DB954D`

### 获取视频播放地址

说明 : 调用此接口 , 传入视频 id,可获取视频播放地址

**必选参数 :** `id`: 视频 的 id

**接口地址 :** `/video/url`

**调用例子 :** `/video/url?id=89ADDE33C0AAE8EC14B99F6750DB954D`


### 所有榜单

说明 : 调用此接口,可获取所有榜单
**接口地址 :** `/toplist`

**调用例子 :** `/toplist`

### 排行榜详情
说明: 请使用[歌单详情](#获取歌单详情)接口,传入排行榜id获取排行榜详情数据(排行榜也是歌单的一种)

~~说明 : 调用此接口 , 传入榜单 id, 可获取不同排行榜数据(v3.34.0之后不再支持idx参数)~~

~~**必选参数 :** `id`: 榜单id,通过所有榜单接口获取~~

~~**接口地址 :** `/top/list`~~

~~**调用例子 :** `/top/list?id=2809577409`~~


### 所有榜单内容摘要

说明 : 调用此接口,可获取所有榜单内容摘要  

**接口地址 :** `/toplist/detail`

**调用例子 :** `/toplist/detail`

### 歌手榜

说明 : 调用此接口 , 可获取排行榜中的歌手榜

**可选参数 :**
```
type : 地区
1: 华语
2: 欧美
3: 韩国
4: 日本
```
**接口地址 :** `/toplist/artist`

**调用例子 :** `/toplist/artist`

### 云盘

说明 : 登录后调用此接口 , 可获取云盘数据 , 获取的数据没有对应 url, 需要再调用一
次 `/song/url` 获取 url

**可选参数 :**

`limit` : 返回数量 , 默认为 200

`offset` : 偏移数量，用于分页 , 如 :( 页数 -1)\*200, 其中 200 为 limit 的值 , 默认为 0

**接口地址 :** `/user/cloud`

**调用例子 :** `/user/cloud`

### 云盘数据详情
说明 : 登录后调用此接口 , 传入云盘歌曲 id，可获取云盘数据详情

**必选参数 :** `id`: 歌曲id,可多个,用逗号隔开

**接口地址 :** `/user/cloud/detail`

**调用例子 :** `/user/cloud/detail?id=5374627`


### 云盘歌曲删除
说明 : 登录后调用此接口 , 可删除云盘歌曲

**必选参数 :** `id`: 歌曲id,可多个,用逗号隔开

**接口地址 :** `/user/cloud/del`

**调用例子 :** `/user/cloud/del`

### 云盘上传
说明 : 登录后调用此接口,使用`'Content-Type': 'multipart/form-data'`上传mp3 formData(name为'songFile'),可上传歌曲到云盘  

参考: https://github.com/Binaryify/NeteaseCloudMusicApi/blob/master/public/cloud.html  

访问地址: http://localhost:3000/cloud.html)  

支持命令行调用,参考module_example目录下`song_upload.js`

**接口地址 :** `/cloud`

**调用例子 :** `/cloud`

### 电台banner
说明 : 调用此接口,可获取电台banner

**接口地址 :** `/dj/banner`

**调用例子 :** `/dj/banner`

### 电台个性推荐
说明 : 调用此接口,可获取电台个性推荐列表
**可选参数 :**

`limit` : 返回数量,默认为 6,总条数最多6条

**接口地址 :** `/dj/personalize/recommend`

**调用例子 :** `/dj/personalize/recommend?limit=5`

### 电台订阅者列表
说明 : 调用此接口,可获取电台订阅者列表
**必选参数 :** `id`: 电台id

**可选参数 :**
`time` : 分页参数,默认-1,传入上一次返回结果的 time,将会返回下一页的数据 

`limit` : 返回数量,默认为 20

**接口地址 :** `/dj/subscriber`

**调用例子 :** `/dj/subscriber?id=335425050` , `/dj/subscriber?id=335425050&time=1602761825390`

### 用户电台

说明 : 调用此接口, 传入用户id可获取用户创建的电台

**必选参数 :** `uid`: 用户id

**接口地址 :** `/user/audio`

**调用例子 :** `/user/audio?uid=32953014`

### 热门电台
说明 : 调用此接口,可获取热门电台

**可选参数 :**

`limit` : 返回数量 , 默认为 30

`offset` : 偏移数量，用于分页 , 如 :( 页数 -1)\*30, 其中 30 为 limit 的值 , 默认为 0
**接口地址 :** `/dj/hot`

**调用例子 :** `/dj/hot`

### 电台 - 节目榜

说明 : 登录后调用此接口 , 可获得电台节目榜

**可选参数 :**

`limit` : 返回数量 , 默认为 100

`offset` : 偏移数量，用于分页 , 如 :( 页数 -1)\*100, 其中 100 为 limit 的值 , 默认为 0

**接口地址 :** `/dj/program/toplist`

**调用例子 :** `/dj/program/toplist?limit=1`

### 电台 - 付费精品
说明 : 调用此接口,可获取付费精品电台

**可选参数 :**

`limit` : 返回数量 , 默认为 100 (不支持 offset)

**接口地址 :** `/dj/toplist/pay`

**调用例子 :** `/dj/toplist/pay?limit=30`


### 电台 - 24小时节目榜
说明 : 调用此接口,可获取24小时节目榜

**可选参数 :**

`limit` : 返回数量 , 默认为 100 (不支持 offset)

**接口地址 :** `/dj/program/toplist/hours`

**调用例子 :** `/dj/program/toplist/hours?limit=1`

### 电台 - 24小时主播榜
说明 : 调用此接口,可获取24小时主播榜

**可选参数 :**

`limit` : 返回数量 , 默认为 100 (不支持 offset)

**接口地址 :** `/dj/toplist/hours`

**调用例子 :** `/dj/toplist/hours?limit=30`

### 电台 - 主播新人榜
说明 : 调用此接口,可获取主播新人榜

**可选参数 :**

`limit` : 返回数量 , 默认为 100 (不支持 offset)

**接口地址 :** `/dj/toplist/newcomer`

**调用例子 :** `/dj/toplist/newcomer?limit=30`


### 电台 - 最热主播榜
说明 : 调用此接口,可获取最热主播榜

**可选参数 :**

`limit` : 返回数量 , 默认为 100 (不支持 offset)

**接口地址 :** `/dj/toplist/popular`

**调用例子 :** `/dj/toplist/popular?limit=30`

### 电台 - 新晋电台榜/热门电台榜

说明 : 登录后调用此接口 , 可获得新晋电台榜/热门电台榜

**可选参数 :**

`limit` : 返回数量 , 默认为 100

`offset` : 偏移数量，用于分页 , 如 :( 页数 -1)\*100, 其中 100 为 limit 的值 , 默认为 0

`type`: 榜单类型, `new` 为新晋电台榜,`hot`为热门电台榜

**接口地址 :** `/dj/toplist`

**调用例子 :** `/dj/toplist?type=hot` `/dj/toplist?type=new&limit=1`

### 电台 - 类别热门电台

**可选参数 :**

`limit` : 返回数量 , 默认为 30

`offset` : 偏移数量，用于分页 , 如 :( 页数 -1)\*30, 其中 30 为 limit 的值 , 默认为 0

`cateId`: 类别 id,可通过 `/dj/category/recommend` 接口获取

**接口地址 :** `/dj/radio/hot`

**调用例子 :** `/dj/radio/hot?cateId=2001`(创作|翻唱) `/dj/radio/hot?cateId=10002` (3D|电子)

### 电台 - 推荐

说明 : 登录后调用此接口 , 可获得推荐电台

**接口地址 :** `/dj/recommend`

**调用例子 :** `/dj/recommend`

### 电台 - 分类

说明 : 登录后调用此接口 , 可获得电台类型

**接口地址 :** `/dj/catelist`

**调用例子 :** `/dj/catelist`

### 电台 - 分类推荐

说明 : 登录后调用此接口 , 传入分类,可获得对应类型电台列表

**必选参数 :** `type`: 电台类型 , 数字 , 可通过`/dj/catelist`获取 , 对应关系为
id 对应 此接口的 type, name 对应类型

**接口地址 :** `/dj/recommend/type`

**调用例子 :** `/dj/recommend/type?type=1`(明星做主播) `/dj/recommend/type?type=2001` (创作|翻唱)

### 电台 - 订阅

说明 : 登录后调用此接口 , 传入`rid`, 可订阅 dj,dj 的 `rid` 可通过搜索指定
type='1009' 获取其 id, 如`/search?keywords= 代码时间 &type=1009`

**必选参数 :** `rid`: 电台 的 id

**接口地址 :** `/dj/sub`

**调用例子 :** `/dj/sub?rid=336355127&t=1` ( 对应关注 ' 代码时间 ')
`/dj/sub?rid=336355127&t=0` ( 对应取消关注 ' 代码时间 ')

### 电台的订阅列表

说明 : 登录后调用此接口 , 可获取订阅的电台列表

**接口地址 :** `/dj/sublist`

**调用例子 :** `/dj/sublist`

### 电台 - 付费精选

说明 : 可以获取付费精选的电台列表 , 传入 `limit` 和 `offset` 可以进行分页

**可选参数 :**

`limit` : 返回数量 , 默认为 30

`offset` : 偏移数量，用于分页 ,  如 :( 页数 -1)\*30, 其中 30 为 limit 的值 , 默认为 0

**接口地址 :** `/dj/paygift`

**调用例子 :** `/dj/paygift?limit=10&offset=20`

### 电台 - 非热门类型

说明 : 登录后调用此接口, 可获得电台非热门类型


**接口地址 :** `/dj/category/excludehot`

**调用例子 :** `/dj/category/excludehot`

### 电台 - 推荐类型

说明 : 登录后调用此接口, 可获得电台推荐类型


**接口地址 :** `/dj/category/recommend`

**调用例子 :** `/dj/category/recommend`

### 电台 - 今日优选

说明 : 登录后调用此接口, 可获得电台今日优选


**接口地址 :** `/dj/today/perfered`

**调用例子 :** `/dj/today/perfered`

### 电台 - 详情

说明 : 登录后调用此接口 , 传入`rid`, 可获得对应电台的详情介绍

**必选参数 :** `rid`: 电台 的 id

**接口地址 :** `/dj/detail`

**调用例子 :** `/dj/detail?rid=336355127` ( 对应 ' 代码时间 ' 的详情介绍 )

### 电台 - 节目

说明 : 登录后调用此接口 , 传入`rid`, 可查看对应电台的电台节目以及对应的 id, 需要
注意的是这个接口返回的 mp3Url 已经无效 , 都为 null, 但是通过调用 `/song/url` 这
个接口 , 传入节目 id 仍然能获取到节目音频 , 如 `/song/url?id=478446370` 获取代
码时间的一个节目的音频

**必选参数 :** `rid`: 电台 的 id

**可选参数 :**

`limit` : 返回数量 , 默认为 30

`offset` : 偏移数量，用于分页 , 如 :( 页数 -1)\*30, 其中 30 为 limit 的值 , 默认为 0

`asc` : 排序方式,默认为 `false` (新 => 老 ) 设置 `true` 可改为 老 => 新 

**接口地址 :** `/dj/program`

**调用例子 :** `/dj/program?rid=336355127&limit=40` ( 对应 ' 代码时间 ' 的节目列表 )

### 电台 - 节目详情
说明 : 调用此接口传入电台节目id,可获得电台节目详情

**必选参数 :** `id`: 电台节目 的 id

**接口地址 :** `/dj/program/detail`

**调用例子 :** `/dj/program/detail?id=1367665101`

### 通知 - 私信

说明 : 登录后调用此接口 ,可获取私信

**可选参数 :**

`limit` : 返回数量 , 默认为 30

`offset` : 偏移数量，用于分页 , 如 :( 页数 -1)\*30, 其中 30 为 limit 的值 , 默认为 0

**接口地址 :** `/msg/private`

**调用例子 :** `/msg/private?limit=3`

### 发送私信

说明 : 登录后调用此接口 , 传入用户 id 和要发送的信息, 可以发送私信,返回内容为历史私信,包含带歌单的私信信息(注:不能发送私信给自己)

**必选参数 :**

`user_ids` : 用户 id,多个需用逗号隔开

`msg` : 要发送的信息

**接口地址 :** `/send/text`

**调用例子 :** `/send/text?user_ids=32953014&msg=test`,`/send/text?user_ids=32953014,475625142&msg=test`

### 发送私信(带歌曲)

说明 : 登录后调用此接口 , 传入用户 id 和要发送的信息,音乐id, 可以发送音乐私信,返回内容为历史私信

**必选参数 :**

`user_ids` : 用户 id,多个需用逗号隔开

`id` : 要发送音乐的id

`msg` : 要发送的信息

**接口地址 :** `/send/song`

**调用例子 :** `/send/song?user_ids=1&id=351318&msg=测试`

### 发送私信(带专辑)

说明 : 登录后调用此接口 , 传入用户 id 和要发送的信息,专辑id, 可以发送专辑私信,返回内容为消息id

**必选参数 :**

`user_ids` : 用户 id,多个需用逗号隔开

`id` : 要发送专辑的id

`msg` : 要发送的信息

**接口地址 :** `/send/album`

**调用例子 :** `/send/album?user_ids=1&id=351318&msg=测试`

### 发送私信(带歌单)

说明 : 登录后调用此接口 , 传入用户 id 和要发送的信息和歌单 id, 可以发送带歌单的私信(注:不能发送重复的歌单)

**必选参数 :**

`user_ids` : 用户 id,多个需用逗号隔开

`msg` : 要发送的信息

**接口地址 :** `/send/playlist`

**调用例子 :** `/send/playlist?msg=test&user_ids=475625142&playlist=705123491`,`/send/playlist?msg=test2&user_ids=475625142,32953014&playlist=705123493`

### 最近联系人
说明 : 登录后调用此接口 ,可获取最接近联系人

**接口地址 :** `/msg/recentcontact`

**调用例子 :** `/msg/recentcontact`

### 私信内容
说明 : 登录后调用此接口 , 可获取私信内容

**必选参数 :**
`uid` : 用户 id

**可选参数 :**
`limit` : 返回数量 , 默认为 30

`before` : 分页参数,取上一页最后一项的 `time` 获取下一页数据

**接口地址 :** 
`/msg/private/history`

**调用例子 :**
`/msg/private/history?uid=9003` (云音乐小秘书)

### 通知 - 评论

说明 : 登录后调用此接口 ,可获取评论

**必选参数 :** `uid`: 用户 的 id，只能和登录账号的 id 一致

**可选参数 :**

`limit` : 返回数量 , 默认为 30

`before` : 分页参数,取上一页最后一个歌单的 `updateTime` 获取下一页数据


**接口地址 :** `/msg/comments`

**调用例子 :** `/msg/comments?uid=32953014`

### 通知 - @我

说明 : 登录后调用此接口 ,可获取@我数据

**可选参数 :**

`limit` : 返回数量 , 默认为 30

`offset` : 偏移数量，用于分页 , 如 :( 页数 -1)\*30, 其中 30 为 limit 的值 , 默认为 0

**接口地址 :** `/msg/forwards`

**调用例子 :** `/msg/forwards?limit=3`


### 通知 - 通知

说明 : 登录后调用此接口 ,可获取通知

**可选参数 :**

`limit` : 返回数量 , 默认为 30

`lasttime` : 返回数据的 `time` ,默认-1,传入上一次返回结果的 time,将会返回下一页的数据


**接口地址 :** `/msg/notices`

**调用例子 :** `/msg/notices?limit=3`

### 设置
说明 : 登录后调用此接口 ,可获取用户设置

**接口地址 :** `/setting`

**调用例子 :** `/setting`

### 数字专辑-新碟上架
说明 : 调用此接口 ,可获取数字专辑-新碟上架  

**可选参数 :**

`limit` : 返回数量 , 默认为 30

`offset` : 偏移数量，用于分页 , 如 :( 页数 -1)\*30, 其中 30 为 limit 的值 , 默认为 0  
**接口地址 :** `/album/list`

**调用例子 :** `/album/list?limit=10`

### 数字专辑&数字单曲-榜单
说明 : 调用此接口 ,可获取数字专辑&数字单曲-榜单  

**可选参数 :**

`limit` : 返回数量 , 默认为 30

`offset` : 偏移数量，用于分页 , 如 :( 页数 -1)\*30, 其中 30 为 limit 的值 , 默认为 0  

`albumType` : 为数字专辑,1为数字单曲

`type` : daily:日榜,week:周榜,year:年榜,total:总榜  

**接口地址 :** `/album_songsaleboard`

**调用例子 :** `/album/songsaleboard?type=year&year=2020&albumType=0`

### 数字专辑-语种风格馆

说明 : 调用此接口 ,可获取语种风格馆数字专辑列表  

**可选参数 :**

`limit` : 返回数量 , 默认为 30

`offset` : 偏移数量，用于分页 , 如 :( 页数 -1)\*30, 其中 30 为 limit 的值 , 默认为 0  

`area` 地区 Z_H:华语,E_A:欧美,KR:韩国,JP:日本  

**接口地址 :** `/album/list/style`

**调用例子 :** `/album/list/style?area=Z_H&offset=2`

### 数字专辑详情
说明 : 调用此接口 ,传入数字专辑id可获取数字专辑详情(和歌单详情有差异)

**接口地址 :** `/album/detail`

**调用例子 :** `/album/detail?id=84547195`


### 我的数字专辑
说明 : 登录后调用此接口 ,可获取我的数字专辑

**接口地址 :** `/digitalAlbum/purchased`

**调用例子 :** `/digitalAlbum/purchased?limit=10`

### 购买数字专辑
说明 : 登录后调用此接口 ,可获取购买数字专辑的地址,把地址生成二维码后,可扫描购买专辑

**必选参数 :**

`id` : 专辑的 id

`payment` : 支付方式， 0 为支付宝 3 为微信

`quantity` : 购买的数量

**接口地址 :** `/digitalAlbum/ordering`

**调用例子 :** `/digitalAlbum/ordering?id=86286082&payment=3&quantity=1`

### 音乐日历
说明 : 登录后调用此接口,传入开始和结束时间,可获取音乐日历

**接口地址 :** `/calendar`

**调用例子 :** `/calendar?startTime=1606752000000&endTime=1609430399999`

### 云贝
说明 : 登录后调用此接口可获取云贝签到信息(连续签到天数,第二天全部可获得的云贝)

**接口地址 :** `/yunbei`

**调用例子 :** `/yunbei`

### 云贝今日签到信息
说明 : 登录后调用此接口可获取云贝今日签到信息(今日签到获取的云贝数)

**接口地址 :** `/yunbei/today`

**调用例子 :** `/yunbei/today`

### 云贝签到
说明 : 登录后调用此接口可进行云贝签到

**接口地址 :** `/yunbei/sign`

**调用例子 :** `/yunbei/sign`

### 云贝账户信息
说明 :登录后调用此接口可获取云贝账户信息(账户云贝数)

**接口地址 :** `/yunbei/info`

**调用例子 :** `/yunbei/info`

### 云贝所有任务
说明 :登录后调用此接口可获取云贝所有任务

**接口地址 :** `/yunbei/tasks`

**调用例子 :** `/yunbei/tasks`

### 云贝todo任务
说明 :登录后调用此接口可获取云贝todo任务

**接口地址 :** `/yunbei/tasks/todo`

**调用例子 :** `/yunbei/tasks/todo`

### 云贝完成任务
**必选参数 :**

`userTaskId` : 任务id

**可选参数 :** 

`depositCode`: 任务depositCode  

**接口地址 :** `/yunbei/task/finish`

**调用例子 :** `/yunbei/task/finish?userTaskId=5146243240&depositCode=0`

### 云贝收入
说明 :登录后调用此接口可获取云贝收入  

**可选参数 :** `limit`: 取出评论数量 , 默认为 10

`offset`: 偏移数量 , 用于分页 , 如 :( 评论页数 -1)\*10, 其中 10 为 limit 的值  

**接口地址 :** `/yunbei/tasks/receipt`

**调用例子 :** `/yunbei/tasks/receipt?limit=1`

### 云贝支出
说明 :登录后调用此接口可获取云贝支出  

**可选参数 :** `limit`: 取出评论数量 , 默认为 10

`offset`: 偏移数量 , 用于分页 , 如 :( 评论页数 -1)\*10, 其中 10 为 limit 的值  
**接口地址 :** `/yunbei/tasks/expense`

**调用例子 :** `/yunbei/tasks/expense?limit=1`

### 关注歌手新歌
说明 :登录后调用此接口可获取关注歌手新歌

**可选参数 :** `limit`: 取出评论数量 , 默认为 20

`before`: 上一页数据返回的publishTime的数据 

**接口地址 :** `/artist/new/song`

**调用例子 :** `/artist/new/song?limit=1` `/artist/new/song?limit=1&before=1602777625000`


### 关注歌手新MV
说明 :登录后调用此接口可获取关注歌手新MV 

**可选参数 :** `limit`: 取出评论数量 , 默认为 20

`before`: 上一页数据返回的publishTime的数据

**接口地址 :** `/artist/new/mv`

**调用例子 :** `/artist/new/mv?limit=1` `/artist/new/mv?limit=1&before=1602777625000`


### batch批量请求接口
说明 : 登录后调用此接口 ,传入接口和对应原始参数(原始参数非文档里写的参数,需参考源码),可批量请求接口

**接口地址 :** `/batch`

**调用例子 :** 使用GET方式:`/batch?/api/v2/banner/get={"clientType":"pc"}` 使用POST方式传入参数:`{ "/api/v2/banner/get": {"clientType":"pc"} }`



## 离线访问此文档

此文档同时也是 Progressive Web Apps(PWA), 加入了 serviceWorker, 可离线访问

## 关于此文档

此文档由 [docsify](https://github.com/QingWei-Li/docsify/) 生成 docsify 是一个动
态生成文档网站的工具。不同于 GitBook、Hexo 的地方是它不会生成将 .md 转成 .html
文件，所有转换工作都是在运行时进行。

## License

[The MIT License (MIT)](https://github.com/Binaryify/NeteaseCloudMusicApi/blob/master/LICENSE)
