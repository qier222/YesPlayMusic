import useUserArtists, {
  useMutationLikeAArtist,
} from '@/web/api/hooks/useUserArtists'
import contextMenus, { closeContextMenu } from '@/web/states/contextMenus'
import { AnimatePresence } from 'framer-motion'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useCopyToClipboard } from 'react-use'
import { useSnapshot } from 'valtio'
import BasicContextMenu from './BasicContextMenu'

const ArtistContextMenu = () => {
  const { cursorPosition, type, dataSourceID, target, options } =
    useSnapshot(contextMenus)
  const likeAArtist = useMutationLikeAArtist()
  const [, copyToClipboard] = useCopyToClipboard()

  const { data: likedArtists } = useUserArtists()
  const followLabel = useMemo(() => {
    return likedArtists?.data?.find(a => a.id === Number(dataSourceID))
      ? 'Follow'
      : 'Unfollow'
  }, [dataSourceID, likedArtists?.data])

  return (
    <AnimatePresence>
      {cursorPosition && type === 'artist' && dataSourceID && target && (
        <BasicContextMenu
          target={target}
          cursorPosition={cursorPosition}
          onClose={closeContextMenu}
          options={options}
          items={[
            {
              type: 'item',
              label: followLabel,
              onClick: () => {
                if (type !== 'artist' || !dataSourceID) {
                  return
                }
                likeAArtist.mutateAsync(Number(dataSourceID)).then(res => {
                  if (res?.code === 200) {
                    toast.success(
                      followLabel === 'Unfollow' ? 'Followed' : 'Unfollowed'
                    )
                  }
                })
              },
            },
            {
              type: 'divider',
            },
            {
              type: 'submenu',
              label: 'Share',
              items: [
                {
                  type: 'item',
                  label: 'Copy Netease Link',
                  onClick: () => {
                    copyToClipboard(
                      `https://music.163.com/#/artist?id=${dataSourceID}`
                    )
                    toast.success('Copied')
                  },
                },
                {
                  type: 'item',
                  label: 'Copy YPM Link',
                  onClick: () => {
                    copyToClipboard(
                      `${window.location.origin}/artist/${dataSourceID}`
                    )
                    toast.success('Copied')
                  },
                },
              ],
            },
          ]}
        />
      )}
    </AnimatePresence>
  )
}

export default ArtistContextMenu
