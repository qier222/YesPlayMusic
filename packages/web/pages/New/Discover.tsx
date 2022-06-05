import CoverWall from '@/web/components/New/CoverWall'
import PageTransition from '@/web/components/New/PageTransition'
import {
  fetchPlaylistWithReactQuery,
  fetchFromCache,
} from '@/web/api/hooks/usePlaylist'
import useTracks, { fetchTracksWithReactQuery } from '@/web/api/hooks/useTracks'
import { useEffect, useMemo, useState } from 'react'
import { sampleSize } from 'lodash-es'
import { FetchPlaylistResponse } from '@/shared/api/Playlists'

interface DiscoverAlbum {
  id: number
  coverUrl: string
  large: boolean
}

const getAlbumsFromAPI = async () => {
  const playlistsIds = [
    2859214503, // 一周欧美上新
    2829816518, // 欧美私人订制
    5327906368, // 乐迷雷达
    5362359247, // 宝藏雷达
    3136952023, // 私人雷达
    60198, // Billboard 排行榜
    180106, // UK 排行榜
    5212729721, // 欧美点唱机
    2724708415, // 私藏推荐精选
    5300458264, // 新歌雷达
    7463185187, // 开发者夹带私货
  ]

  const playlists = (await Promise.all(
    sampleSize(playlistsIds, 5).map(
      id =>
        new Promise(resolve => {
          const cache = fetchFromCache(id)
          if (cache) {
            resolve(cache)
            return
          }
          return fetchPlaylistWithReactQuery({ id })
        })
    )
  )) as FetchPlaylistResponse[]

  const ids: number[] = []
  playlists.forEach(playlist =>
    playlist?.playlist?.trackIds?.forEach(t => ids.push(t.id))
  )
  if (!ids.length) {
    return []
  }

  const tracks = await fetchTracksWithReactQuery({ ids })
  if (!tracks.songs.length) {
    return []
  }

  // 从歌单中抽出歌曲
  const pickedIds: number[] = []
  let albums: DiscoverAlbum[] = []
  tracks.songs.forEach(t => {
    if (pickedIds.includes(t.al.id)) return
    pickedIds.push(t.al.id)
    albums.push({
      id: t.al.id,
      coverUrl: t.al.picUrl,
      large: false,
    })
  })

  // 挑选出大图
  albums = sampleSize(albums, 100)
  const largeCover = sampleSize([...Array(100).keys()], ~~(100 / 3))
  albums.map((album, index) => (album.large = largeCover.includes(index)))

  localStorage.setItem('discoverAlbums', JSON.stringify(albums))
  localStorage.setItem('discoverAlbumsTime', String(Date.now()))

  return albums
}

const Discover = () => {
  const [albums, setAlbums] = useState<DiscoverAlbum[]>([])

  useEffect(() => {
    const get = async () => {
      const albumsInLocalStorageTime =
        localStorage.getItem('discoverAlbumsTime')
      if (
        !albumsInLocalStorageTime ||
        Date.now() - Number(albumsInLocalStorageTime) > 1000 * 60 * 60 * 2
      ) {
        setAlbums(await getAlbumsFromAPI())
      } else {
        setAlbums(JSON.parse(localStorage.getItem('discoverAlbums') || '[]'))
      }
    }
    get()
  }, [])

  return (
    <PageTransition disableEnterAnimation={true}>
      <CoverWall albums={albums} />
    </PageTransition>
  )
}

export default Discover
