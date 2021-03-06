import { banner, lyric } from 'NeteaseCloudMusicApi'
banner({ type: 0 }).then((res) => {
  console.log(res)
})
lyric({
  id: '33894312',
}).then((res) => {
  console.log(res)
})
