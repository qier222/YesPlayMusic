import useUserAlbums, { useMutationLikeAAlbum } from '@/web/api/hooks/useUserAlbums'
import contextMenus, { closeContextMenu } from '@/web/states/contextMenus'
import player from '@/web/states/player'
import { AnimatePresence } from 'framer-motion'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useCopyToClipboard } from 'react-use'
import { useSnapshot } from 'valtio'
import BasicContextMenu from './BasicContextMenu'

const AlbumContextMenu = () => {
  const { t } = useTranslation()

  const { cursorPosition, type, dataSourceID, target, options } = useSnapshot(contextMenus)
  const likeAAlbum = useMutationLikeAAlbum()
  const [, copyToClipboard] = useCopyToClipboard()

  const { data: likedAlbums } = useUserAlbums()
  const addToLibraryLabel = useMemo(() => {
    return likedAlbums?.data?.find(a => a.id === Number(dataSourceID))
      ? t`context-menu.remove-from-library`
      : t`context-menu.add-to-library`
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
              label: t`context-menu.add-to-queue`,
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
              label: t`context-menu.add-to-playlist`,
              onClick: () => {
                toast('开发中')
              },
            },
            {
              type: 'divider',
            },
            {
              type: 'submenu',
              label: t`context-menu.share`,
              items: [
                {
                  type: 'item',
                  label: t`context-menu.copy-netease-link`,
                  onClick: () => {
                    copyToClipboard(`https://music.163.com/#/album?id=${dataSourceID}`)
                    toast.success(t`toasts.copied`)
                  },
                },
                {
                  type: 'item',
                  label: t`context-menu.copy-r3play-link`,
                  onClick: () => {
                    copyToClipboard(`${window.location.origin}/album/${dataSourceID}`)
                    toast.success(t`toasts.copied`)
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
