import axios, { AxiosInstance } from 'axios'

const baseURL = String(
  import.meta.env.DEV ? '/yesplaymusic' : `http://127.0.0.1:42710/yesplaymusic`
)

const request: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
})

export async function cacheAudio(id: number, audio: string) {
  const file = await axios.get(audio, { responseType: 'arraybuffer' })
  if (file.status !== 200 && file.status !== 206) return

  const formData = new FormData()
  const blob = new Blob([file.data], { type: 'multipart/form-data' })
  formData.append('file', blob)

  request.post(`/audio/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    params: {
      url: audio,
    },
  })
}
