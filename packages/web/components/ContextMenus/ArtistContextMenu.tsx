import useUserArtists, {
  useMutationLikeAArtist,
} from '@/web/api/hooks/useUserArtists'
import contextMenus, { closeContextMenu } from '@/web/states/contextMenus'
import { AnimatePresence } from 'framer-motion'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useCopyToClipboard } from 'react-use'
import { useSnapshot } from 'valtio'
import BasicContextMenu from './BasicContextMenu'

const ArtistContextMenu = () => {
  const { t } = useTranslation()

  const { cursorPosition, type, dataSourceID, target, options } =
    useSnapshot(contextMenus)
  const likeAArtist = useMutationLikeAArtist()
  const [, copyToClipboard] = useCopyToClipboard()

  const { data: likedArtists } = useUserArtists()
  const followLabel = useMemo(() => {
    return likedArtists?.data?.find(a => a.id === Number(dataSourceID))
      ? t`context-menu.unfollow`
      : t`context-menu.follow`
  }, [dataSourceID, likedArtists?.data, t])

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
                      followLabel === t`context-menu.unfollow`
                        ? t`context-menu.unfollowed`
                        : t`context-menu.followed`
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
              label: t`context-menu.share`,
              items: [
                {
                  type: 'item',
                  label: t`context-menu.copy-netease-link`,
                  onClick: () => {
                    copyToClipboard(
                      `https://music.163.com/#/artist?id=${dataSourceID}`
                    )
                    toast.success(t`toasts.copied`)
                  },
                },
                {
                  type: 'item',
                  label: 'Copy YPM Link',
                  onClick: () => {
                    copyToClipboard(
                      `${window.location.origin}/artist/${dataSourceID}`
                    )
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

export default ArtistContextMenu
