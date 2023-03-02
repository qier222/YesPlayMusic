import settings from '@/web/states/settings'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { useSnapshot } from 'valtio'
import { BlockDescription, BlockTitle, Button, Option, OptionText, Switch } from './Controls'

function Player() {
  return (
    <div>
      <FindTrackOnYouTube />
    </div>
  )
}

function FindTrackOnYouTube() {
  const { t } = useTranslation()

  const { enableFindTrackOnYouTube, httpProxyForYouTube } = useSnapshot(settings)

  return (
    <div>
      <BlockTitle>{t`settings.player-youtube-unlock`}</BlockTitle>
      <BlockDescription>
        Find alternative track on YouTube if not available on NetEase.
      </BlockDescription>

      {/* Switch */}
      <Option>
        <OptionText>Enable YouTube Unlock </OptionText>
        <Switch
          enabled={enableFindTrackOnYouTube}
          onChange={value => (settings.enableFindTrackOnYouTube = value)}
        />
      </Option>

      {/* Proxy */}
      {/* <Option>
        <OptionText>
          HTTP Proxy config for connecting to YouTube {httpProxyForYouTube?.host && '(Configured)'}
        </OptionText>
        <Button
          onClick={() => {
            toast('开发中')
          }}
        >
          Edit
        </Button>
      </Option> */}
    </div>
  )
}

export default Player
