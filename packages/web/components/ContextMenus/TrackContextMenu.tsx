import { fetchTracksWithReactQuery } from '@/web/api/hooks/useTracks'
import { fetchTracks } from '@/web/api/track'
import contextMenus, { closeContextMenu } from '@/web/states/contextMenus'
import { AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useCopyToClipboard } from 'react-use'
import { useSnapshot } from 'valtio'
import BasicContextMenu from './BasicContextMenu'

const TrackContextMenu = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [, copyToClipboard] = useCopyToClipboard()

  const { type, dataSourceID, target, cursorPosition, options } = useSnapshot(contextMenus)

  return (
    <AnimatePresence>
      {type === 'track' && dataSourceID && target && cursorPosition && (
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
              },
            },
            {
              type: 'divider',
            },
            {
              type: 'item',
              label: t`context-menu.go-to-artist`,
              onClick: async () => {
                const tracks = await fetchTracksWithReactQuery({
                  ids: [Number(dataSourceID)],
                })
                const track = tracks?.songs?.[0]
                if (track) navigate(`/artist/${track.ar[0].id}`)
              },
            },
            {
              type: 'item',
              label: t`context-menu.go-to-album`,
              onClick: async () => {
                const tracks = await fetchTracksWithReactQuery({
                  ids: [Number(dataSourceID)],
                })
                const track = tracks?.songs?.[0]
                if (track) navigate(`/album/${track.al.id}`)
              },
            },
            {
              type: 'divider',
            },
            {
              type: 'item',
              label: t`context-menu.add-to-liked-tracks`,
              onClick: () => {
                toast('开发中')
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

export default TrackContextMenu
