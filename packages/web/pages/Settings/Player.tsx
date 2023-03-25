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
  const { t, i18n } = useTranslation()

  const { enableFindTrackOnYouTube, httpProxyForYouTube } = useSnapshot(settings)

  return (
    <div>
      <BlockTitle>{t`settings.player-youtube-unlock`}</BlockTitle>
      <BlockDescription>
        {t`settings.player-find-alternative-track-on-youtube-if-not-available-on-netease`}
        {i18n.language === 'zh-CN' && (
          <>
            <br />
            此功能需要开启 Clash for Windows 的 TUN Mode 或 ClashX Pro 的增强模式。
          </>
        )}
      </BlockDescription>

      {/* Switch */}
      <Option>
        <OptionText>Enable YouTube Unlock</OptionText>
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
