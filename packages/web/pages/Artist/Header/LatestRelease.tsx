import { resizeImage } from '@/web/utils/common'
import dayjs from 'dayjs'
import { cx, css } from '@emotion/css'
import { useNavigate, useParams } from 'react-router-dom'
import Image from '@/web/components/Image'
import useArtistAlbums from '@/web/api/hooks/useArtistAlbums'
import { useMemo } from 'react'
import useArtistMV from '@/web/api/hooks/useArtistMV'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

const Album = ({ album }: { album?: Album }) => {
  const navigate = useNavigate()

  if (!album) {
    return <></>
  }

  return (
    <div
      onClick={() => navigate(`/album/${album.id}`)}
      className='group flex rounded-24 bg-white/10 p-2.5 transition-colors duration-400 hover:bg-white/20'
    >
      <Image
        src={resizeImage(album.picUrl, 'sm')}
        className={cx(
          'aspect-square shrink-0',
          css`
            height: 60px;
            width: 60px;
            border-radius: 16px;
          `
        )}
      />
      <div className='flex-shrink-1 ml-2'>
        <div className='line-clamp-1 text-16 font-medium text-night-100 transition-colors duration-400 group-hover:text-night-50'>
          {album.name}
        </div>
        <div className='mt-1 text-14 font-bold text-night-500 transition-colors duration-400 group-hover:text-night-200'>
          {album.type}
          {album.size > 1 ? `· ${album.size} Tracks` : ''}
        </div>
        <div className='mt-1.5 text-12 font-medium text-night-500 transition-colors duration-400 group-hover:text-night-200'>
          {dayjs(album?.publishTime || 0).format('MMM DD, YYYY')}
        </div>
      </div>
    </div>
  )
}

const Video = ({ video }: { video?: any }) => {
  const navigate = useNavigate()

  return (
    <>
      {video && (
        <div
          className='group mt-4 flex rounded-24 bg-white/10 p-2.5 transition-colors duration-400 hover:bg-white/20'
          onClick={() => navigate(`/mv/${video.id}`)}
        >
          <img
            src={video.imgurl16v9}
            className={cx(
              'object-contain',
              css`
                height: 60px;
                border-radius: 16px;
              `
            )}
          />
          <div className='flex-shrink-1 ml-2'>
            <div className='line-clamp-1 text-16 font-medium text-night-100 transition-colors duration-400 group-hover:text-night-50'>
              {video.name}
            </div>
            <div className='mt-1 text-14 font-bold text-night-500  transition-colors duration-400 group-hover:text-night-200'>
              MV
            </div>
            <div className='mt-1.5 text-12 font-medium text-night-500  transition-colors duration-400 group-hover:text-night-200'>
              {dayjs(video.publishTime).format('MMM DD, YYYY')}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const LatestRelease = () => {
  const { t } = useTranslation()

  const params = useParams()

  const { data: albumsRaw, isLoading: isLoadingAlbums } = useArtistAlbums({
    id: Number(params.id) || 0,
    limit: 1000,
  })

  const album = useMemo(() => albumsRaw?.hotAlbums?.[0], [albumsRaw?.hotAlbums])

  const { data: videos, isLoading: isLoadingVideos } = useArtistMV({
    id: Number(params.id) || 0,
  })
  const video = videos?.mvs?.[0]

  return (
    <>
      {!isLoadingVideos && !isLoadingAlbums && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='mx-2.5 lg:mx-0'
        >
          <div className='mb-3 mt-7 text-14 font-bold text-neutral-300'>
            {t`artist.latest-releases`}
          </div>

          <Album album={album} />
          <Video video={video} />
        </motion.div>
      )}
    </>
  )
}

export default LatestRelease
