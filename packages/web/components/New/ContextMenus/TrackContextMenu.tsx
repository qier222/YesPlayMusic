import contextMenus, { closeContextMenu } from '@/web/states/contextMenus'
import { AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useCopyToClipboard } from 'react-use'
import { useSnapshot } from 'valtio'
import BasicContextMenu from './BasicContextMenu'

const TrackContextMenu = () => {
  const navigate = useNavigate()
  const [, copyToClipboard] = useCopyToClipboard()

  const { type, dataSourceID, target, cursorPosition, options } =
    useSnapshot(contextMenus)

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
              label: 'Add to Queue',
              onClick: () => {
                toast('开发中')
              },
            },
            {
              type: 'divider',
            },
            {
              type: 'item',
              label: 'Go to artist',
              onClick: () => {
                toast('开发中')
              },
            },
            {
              type: 'item',
              label: 'Go to album',
              onClick: () => {
                toast('开发中')
              },
            },
            {
              type: 'divider',
            },
            {
              type: 'item',
              label: 'Add to Liked Tracks',
              onClick: () => {
                toast('开发中')
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

export default TrackContextMenu
