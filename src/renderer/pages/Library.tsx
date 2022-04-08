import CoverRow, { Subtitle } from '@/renderer/components/CoverRow'
import SvgIcon from '@/renderer/components/SvgIcon'
import useUserAlbums from '@/renderer/hooks/useUserAlbums'
import useLyric from '@/renderer/hooks/useLyric'
import usePlaylist from '@/renderer/hooks/usePlaylist'
import useUser from '@/renderer/hooks/useUser'
import useUserPlaylists from '@/renderer/hooks/useUserPlaylists'
import { player } from '@/renderer/store'
import { resizeImage } from '@/renderer/utils/common'
import { sample, chunk } from 'lodash-es'
import useUserArtists from '@/renderer/hooks/useUserArtists'

const LikedTracksCard = ({ className }: { className?: string }) => {
  const navigate = useNavigate()

  const { data: playlists } = useUserPlaylists()

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
        'relative flex h-full w-full flex-col justify-between rounded-2xl bg-brand-50 py-5 px-6 text-brand-600 dark:bg-brand-800 dark:text-brand-50',
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
        className='btn-pressed-animation absolute bottom-6 right-6 grid h-11 w-11 cursor-default place-content-center rounded-full bg-brand-600 text-brand-50 shadow-lg dark:bg-white dark:text-brand-600'
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
        'flex h-full w-full flex-col justify-between rounded-2xl bg-gray-100 text-lg font-bold dark:bg-gray-800 dark:text-gray-200',
        className
      )}
    >
      <SvgIcon name={icon} className='ml-3 mt-3 h-12 w-12' />
      <span className='m-4'>{name}</span>
    </div>
  )
}

const Playlists = () => {
  const { data: playlists } = useUserPlaylists()
  return (
    <div>
      <CoverRow
        playlists={playlists?.playlist?.slice(1) ?? []}
        subtitle={Subtitle.CREATOR}
      />
    </div>
  )
}

const Albums = () => {
  const { data: albums } = useUserAlbums({
    limit: 1000,
  })

  return (
    <div>
      <CoverRow albums={albums?.data ?? []} subtitle={Subtitle.ARTIST} />
    </div>
  )
}

const Artists = () => {
  const { data: artists } = useUserArtists()

  return (
    <div>
      <CoverRow artists={artists?.data ?? []} subtitle={Subtitle.ARTIST} />
    </div>
  )
}

const MVs = () => {
  return <div>施工中</div>
}

const Podcasts = () => {
  return <div>施工中</div>
}
interface TabsType {
  playlist: string
  album: string
  artist: string
  mv: string
  podcast: string
}

const TabHeader = ({
  activeTab,
  tabs,
  setActiveTab,
}: {
  activeTab: keyof TabsType
  tabs: TabsType
  setActiveTab: (tab: keyof TabsType) => void
}) => {
  return (
    <div className='mt-10 flex text-lg dark:text-white'>
      {Object.entries(tabs).map(([id, name]) => (
        <div
          key={id}
          onClick={() => setActiveTab(id as keyof TabsType)}
          className={classNames(
            'btn-pressed-animation mr-3  rounded-lg px-3.5 py-1.5 font-medium',
            activeTab === id
              ? 'bg-black/[.04] dark:bg-white/10'
              : 'btn-hover-animation after:bg-black/[.04] dark:after:bg-white/10'
          )}
        >
          {name}
        </div>
      ))}
    </div>
  )
}

const Tabs = () => {
  const tabs = {
    playlist: '全部歌单',
    album: '专辑',
    artist: '艺人',
    mv: 'MV',
    podcast: '播客',
  }

  const [activeTab, setActiveTab] = useState<keyof TabsType>('playlist')

  return (
    <>
      <TabHeader
        activeTab={activeTab}
        tabs={tabs}
        setActiveTab={setActiveTab}
      />
      <div className='mt-6'>
        {activeTab === 'playlist' && <Playlists />}
        {activeTab === 'album' && <Albums />}
        {activeTab === 'artist' && <Artists />}
        {activeTab === 'mv' && <MVs />}
        {activeTab === 'podcast' && <Podcasts />}
      </div>
    </>
  )
}

const Library = () => {
  const { data: user } = useUser()

  const avatarUrl = useMemo(
    () => resizeImage(user?.profile?.avatarUrl ?? '', 'sm'),
    [user?.profile?.avatarUrl]
  )

  return (
    <div className='mt-8'>
      <div className='flex items-center text-[2.625rem] font-semibold dark:text-white'>
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

      <Tabs />
    </div>
  )
}

export default Library
