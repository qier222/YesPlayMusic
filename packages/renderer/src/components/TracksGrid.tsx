import ArtistInline from '@/components/ArtistsInline'
import Skeleton from '@/components/Skeleton'
import { resizeImage } from '@/utils/common'

const TrackListGrid = ({
  track,
  isSkeleton = false,
}: {
  track: Track
  isSkeleton: boolean
}) => {
  return (
    <div
      className={classNames(
        'group grid w-full rounded-xl after:scale-[.98] after:rounded-xl',
        'grid-cols-1 py-1.5 px-2'
      )}
    >
      <div className="grid grid-cols-[3rem_auto] items-center">
        {/* Cover */}
        <div>
          {!isSkeleton && (
            <img
              src={resizeImage(track.al.picUrl, 'xs')}
              className="box-content h-9 w-9 rounded-md border border-black border-opacity-[.03]"
            />
          )}
          {isSkeleton && (
            <Skeleton className="mr-4 h-9 w-9 rounded-md border border-gray-100" />
          )}
        </div>

        {/* Track name & Artists */}
        <div className="flex flex-col justify-center">
          {!isSkeleton && (
            <div
              v-if="!isSkeleton"
              className="line-clamp-1 break-all text-base font-semibold"
            >
              {track.name}
            </div>
          )}
          {isSkeleton && (
            <Skeleton className="text-base">PLACEHOLDER12345</Skeleton>
          )}

          <div className="text-xs">
            {!isSkeleton && <ArtistInline artists={track.ar} />}
            {isSkeleton && (
              <Skeleton className="w-2/3 translate-y-px">PLACE</Skeleton>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrackListGrid
