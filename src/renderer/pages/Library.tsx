import SvgIcon from '@/components/SvgIcon'
import useLyric from '@/hooks/useLyric'
import usePlaylist from '@/hooks/usePlaylist'
import useUser from '@/hooks/useUser'
import useUserPlaylists from '@/hooks/useUserPlaylists'
import { player } from '@/store'
import { resizeImage } from '@/utils/common'
import { sample, chunk } from 'lodash-es'

const LikedTracksCard = ({ className }: { className?: string }) => {
  const navigate = useNavigate()
  const { data: user } = useUser()

  const { data: playlists } = useUserPlaylists({
    uid: user?.account?.id ?? 0,
    offset: 0,
  })

  const { data: likedSongsPlaylist } = usePlaylist({
    id: playlists?.playlist?.[0].id ?? 0,
  })

  // Lyric
  const [trackID, setTrackID] = useState(0)

  useEffect(() => {
    if (trackID === 0) {
      setTrackID(
        sample(likedSongsPlaylist?.playlist.trackIds?.map(t => t.id) ?? []) ?? 0
      )
    }
  }, [likedSongsPlaylist?.playlist.trackIds, trackID])

  const { data: lyric } = useLyric({
    id: trackID,
  })

  const lyricLines = useMemo(() => {
    return (
      sample(
        chunk(
          lyric?.lrc.lyric
            ?.split('\n')
            ?.map(l => l.split(']')[1]?.trim())
            ?.filter(
              l =>
                l &&
                !l.includes('作词') &&
                !l.includes('作曲') &&
                !l.includes('纯音乐，请欣赏')
            ),
          3
        )
      ) ?? []
    )
  }, [lyric])

  const handlePlay = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      if (!likedSongsPlaylist?.playlist.id) {
        toast('无法播放歌单')
        return
      }
      player.playPlaylist(likedSongsPlaylist.playlist.id)
    },
    [likedSongsPlaylist?.playlist.id]
  )

  return (
    <div
      onClick={() =>
        likedSongsPlaylist?.playlist.id &&
        navigate(`/playlist/${likedSongsPlaylist.playlist.id}`)
      }
      className={classNames(
        'relative flex h-full w-full flex-col justify-between rounded-2xl bg-brand-50 py-5 px-6 text-brand-600 ',
        className
      )}
    >
      <div className='text-sm'>
        {lyricLines.map((line, index) => (
          <div key={`${index}-${line}`}>{line}</div>
        ))}
      </div>
      <div>
        <div className='text-2xl font-bold'>我喜欢的音乐</div>
        <div className='mt-0.5 text-[15px]'>
          {likedSongsPlaylist?.playlist.trackCount ?? 0} 首歌
        </div>
      </div>

      <button
        onClick={handlePlay}
        className='btn-pressed-animation absolute bottom-6 right-6 grid h-11 w-11 cursor-default place-content-center rounded-full bg-brand-600 text-brand-50 shadow-lg'
      >
        <SvgIcon name='play-fill' className='ml-0.5 h-6 w-6' />
      </button>
    </div>
  )
}

const OtherCard = ({
  name,
  icon,
  className,
}: {
  name: string
  icon: string
  className?: string
}) => {
  return (
    <div
      className={classNames(
        'flex h-full w-full flex-col justify-between rounded-2xl bg-gray-100 text-lg font-bold',
        className
      )}
    >
      <SvgIcon name={icon} className='ml-3 mt-3 h-12 w-12' />
      <span className='m-4'>{name}</span>
    </div>
  )
}

const Tabs = () => {
  return <div></div>
}

const Library = () => {
  const { data: user } = useUser()

  const avatarUrl = useMemo(
    () => resizeImage(user?.profile?.avatarUrl ?? '', 'sm'),
    [user?.profile?.avatarUrl]
  )

  return (
    <div className='mt-8'>
      <div className='flex items-center text-[2.625rem] font-semibold'>
        <img src={avatarUrl} className='mr-3 mt-1 h-12 w-12 rounded-full' />
        {user?.profile?.nickname}的音乐库
      </div>

      <div className='mt-8 grid grid-cols-[2fr_1fr_1fr] grid-rows-2 gap-4'>
        <LikedTracksCard className='row-span-2' />
        <OtherCard name='云盘' icon='fm' className='' />
        <OtherCard name='本地音乐' icon='music-note' className='' />
        <OtherCard name='最近播放' icon='playlist' className='' />
        <OtherCard name='听歌排行' icon='music-library' className='' />
      </div>
    </div>
  )
}

export default Library
