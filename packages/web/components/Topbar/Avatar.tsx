import { css, cx } from '@emotion/css'
import Icon from '../Icon'
import { resizeImage } from '@/web/utils/common'
import useUser, { useMutationLogout } from '@/web/api/hooks/useUser'
import uiStates from '@/web/states/uiStates'
import { useRef, useState } from 'react'
import BasicContextMenu from '../ContextMenus/BasicContextMenu'
import { AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

const Avatar = ({ className }: { className?: string }) => {
  const { data: user } = useUser()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const avatarUrl = user?.profile?.avatarUrl
    ? resizeImage(user?.profile?.avatarUrl ?? '', 'sm')
    : ''

  const avatarRef = useRef<HTMLImageElement>(null)
  const [showMenu, setShowMenu] = useState(false)

  const logout = useMutationLogout()

  return (
    <>
      {avatarUrl ? (
        <div>
          <img
            ref={avatarRef}
            src={avatarUrl}
            onClick={event => {
              if (event.target === avatarRef.current && showMenu) {
                setShowMenu(false)
                return
              }
              setShowMenu(true)
            }}
            className={cx('app-region-no-drag rounded-full', className || 'h-12 w-12')}
          />
          <AnimatePresence>
            {avatarRef.current && showMenu && (
              <BasicContextMenu
                classNames={css`
                  min-width: 162px;
                `}
                onClose={event => {
                  if (event.target === avatarRef.current) return
                  setShowMenu(false)
                }}
                items={[
                  {
                    type: 'item',
                    label: 'Profile',
                    onClick: () => {
                      toast('开发中')
                    },
                  },
                  {
                    type: 'item',
                    label: t`settings.settings`,
                    onClick: () => {
                      navigate('/settings')
                    },
                  },
                  {
                    type: 'divider',
                  },
                  {
                    type: 'item',
                    label: t`auth.logout`,
                    onClick: () => {
                      logout.mutateAsync()
                    },
                  },
                ]}
                target={avatarRef.current}
                cursorPosition={{
                  x: 0,
                  y: 0,
                }}
              />
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div
          onClick={() => (uiStates.showLoginPanel = true)}
          className={cx(
            'rounded-full bg-day-600 p-2.5 dark:bg-night-600',
            className || 'h-12 w-12'
          )}
        >
          <Icon name='user' className='h-7 w-7 text-neutral-500' />
        </div>
      )}
    </>
  )
}

export default Avatar
