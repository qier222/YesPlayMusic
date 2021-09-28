import { fetchTracks } from '@renderer/api/track'
import { TrackApiNames } from '@renderer/api/track'
import type { FetchTracksParams } from '@renderer/api/track'

export default function useTracks(params: FetchTracksParams) {
  console.debug('useTracks', params)
  const enabled = computed(() => params.ids.length !== 0)

  return useQuery(
    [TrackApiNames.FETCH_TRACKS, params],
    () => {
      return fetchTracks(params)
    },
    reactive({ enabled })
  )
}
