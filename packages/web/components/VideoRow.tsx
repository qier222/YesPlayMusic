import useUserVideos from '../api/hooks/useUserVideos'
import uiStates from '../states/uiStates'

const VideoRow = ({ videos }: { videos: Video[] }) => {
  return (
    <div className='grid grid-cols-3 gap-6'>
      {videos.map(video => (
        <div
          key={video.vid}
          onClick={() => (uiStates.playingVideoID = Number(video.vid))}
        >
          <img
            src={video.coverUrl}
            className='aspect-video w-full rounded-24 border border-white/5 object-contain'
          />
          <div className='line-clamp-2 mt-2 text-12 font-medium text-neutral-600'>
            {video.creator?.at(0)?.userName} - {video.title}
          </div>
        </div>
      ))}
    </div>
  )
}

export default VideoRow
