import { SupportedLanguage } from '@/web/i18n/i18n'
import persistedUiStates from '@/web/states/persistedUiStates'
import settings from '@/web/states/settings'
import { useTranslation } from 'react-i18next'
import { useSnapshot } from 'valtio'
import { BlockTitle, OptionText, Select, Option, Switch } from './Controls'

function General() {
  return (
    <div>
      <Language />
      <AppleMusic />
      <NeteaseMusic />
    </div>
  )
}

function Language() {
  const { t } = useTranslation()
  const supportedLanguages: { name: string; value: SupportedLanguage }[] = [
    { name: 'English', value: 'en-US' },
    { name: '简体中文', value: 'zh-CN' },
  ]
  const { language } = useSnapshot(settings)
  const setLanguage = (language: SupportedLanguage) => {
    settings.language = language
  }

  return (
    <>
      <BlockTitle>Language</BlockTitle>
      <Option>
        <OptionText>{t`settings.general-choose-language`}</OptionText>
        <Select options={supportedLanguages} value={language} onChange={setLanguage} />
      </Option>
    </>
  )
}

function AppleMusic() {
  const { playAnimatedArtworkFromApple, priorityDisplayOfAlbumArtistDescriptionFromAppleMusic } =
    useSnapshot(settings)

  return (
    <div className='mt-7'>
      <BlockTitle>Apple Music</BlockTitle>
      <Option>
        <OptionText>Play Animated Artwork from Apple Music</OptionText>
        <Switch
          enabled={playAnimatedArtworkFromApple}
          onChange={v => (settings.playAnimatedArtworkFromApple = v)}
        />
      </Option>
      <Option>
        <OptionText>Priority Display of Album/Artist Description from Apple Music</OptionText>
        <Switch
          enabled={priorityDisplayOfAlbumArtistDescriptionFromAppleMusic}
          onChange={v => (settings.priorityDisplayOfAlbumArtistDescriptionFromAppleMusic = v)}
        />
      </Option>
    </div>
  )
}

function NeteaseMusic() {
  const { displayPlaylistsFromNeteaseMusic } = useSnapshot(settings)
  return (
    <div className='mt-7'>
      <BlockTitle>Netease Music</BlockTitle>
      <Option>
        <OptionText>Display Playlists from Netease Music</OptionText>
        <Switch
          enabled={displayPlaylistsFromNeteaseMusic}
          onChange={v => {
            settings.displayPlaylistsFromNeteaseMusic = v
            if (persistedUiStates.librarySelectedTab === 'playlists') {
              persistedUiStates.librarySelectedTab = 'albums'
            }
          }}
        />
      </Option>
    </div>
  )
}

export default General
