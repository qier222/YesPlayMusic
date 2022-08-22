import useUserAlbums, {
  useMutationLikeAAlbum,
} from '@/web/api/hooks/useUserAlbums'
import contextMenus, { closeContextMenu } from '@/web/states/contextMenus'
import player from '@/web/states/player'
import { AnimatePresence } from 'framer-motion'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useCopyToClipboard } from 'react-use'
import { useSnapshot } from 'valtio'
import BasicContextMenu from './BasicContextMenu'

const AlbumContextMenu = () => {
  const { cursorPosition, type, dataSourceID, target, options } =
    useSnapshot(contextMenus)
  const likeAAlbum = useMutationLikeAAlbum()
  const [, copyToClipboard] = useCopyToClipboard()

  const { data: likedAlbums } = useUserAlbums()
  const addToLibraryLabel = useMemo(() => {
    return likedAlbums?.data?.find(a => a.id === Number(dataSourceID))
      ? 'Remove from Library'
      : 'Add to Library'
  }, [dataSourceID, likedAlbums?.data])

  return (
    <AnimatePresence>
      {cursorPosition && type === 'album' && dataSourceID && target && (
        <BasicContextMenu
          target={target}
          cursorPosition={cursorPosition}
          onClose={closeContextMenu}
          options={options}
          items={[
            {
              type: 'item',
              label: 'Add to Queue',
              onClick: () => {
                toast('开发中')

                // toast.success('Added to Queue', { duration: 100000000 })
                // toast.error('Not implemented yet', { duration: 100000000 })
                // toast.loading('Loading...')
                // toast('ADADADAD', { duration: 100000000 })
              },
            },
            {
              type: 'divider',
            },
            {
              type: 'item',
              label: addToLibraryLabel,
              onClick: () => {
                if (type !== 'album' || !dataSourceID) {
                  return
                }
                likeAAlbum.mutateAsync(Number(dataSourceID)).then(res => {
                  if (res?.code === 200) {
                    toast.success('Added to Library')
                  }
                })
              },
            },
            {
              type: 'item',
              label: 'Add to playlist',
              onClick: () => {
                toast('开发中')
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
                      `https://music.163.com/#/album?id=${dataSourceID}`
                    )
                    toast.success('Copied')
                  },
                },
                {
                  type: 'item',
                  label: 'Copy YPM Link',
                  onClick: () => {
                    copyToClipboard(
                      `${window.location.origin}/album/${dataSourceID}`
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

export default AlbumContextMenu
