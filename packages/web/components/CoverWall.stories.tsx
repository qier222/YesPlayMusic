import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'
import CoverWall from './CoverWall'
import { shuffle } from 'lodash-es'

const covers = [
  'https://p1.music.126.net/MbjHjs0EebOFomva9oh6aQ==/109951164683206719.jpg?param=1024y1024',
  'https://p1.music.126.net/T7qkRJsFDat6GxWDXP2cTA==/109951164486305073.jpg?param=1024y1024',
  'https://p2.music.126.net/2jls9nqjYYlQEybpHPaccw==/109951164706184612.jpg?param=1024y1024',
  'https://p1.music.126.net/lEzPSOjusKaRXKXT3987lQ==/109951166035876388.jpg?param=1024y1024',
  'https://p2.music.126.net/2qW-OYZod7SgrzxTwtyBqA==/109951165911363831.jpg?param=1024y1024',
  'https://p2.music.126.net/W-mYCTf6nPLUSaLxFlXDUA==/109951165806001138.jpg?param=1024y1024',
  'https://p2.music.126.net/6CB6Jsmb7k7qiJqfMY5Row==/109951164260234943.jpg?param=1024y1024',
  'https://p2.music.126.net/IeRnZyxClyoTwqZ76Qcyhw==/109951166161936990.jpg?param=1024y1024',
  'https://p2.music.126.net/oYxxIkeXY5Qap7pW1aSzqQ==/109951165389077755.jpg?param=1024y1024',
  'https://p2.music.126.net/AhYP9TET8l-VSGOpWAKZXw==/109951165134386387.jpg?param=1024y1024',
  'https://p1.music.126.net/QxJA2mr4hhb9DZyucIOIQw==/109951165422200291.jpg?param=1024y1024',
  'https://p2.music.126.net/vCTNT88k1rnflXtDdmWT9g==/109951165359041202.jpg?param=1024y1024',
  'https://p2.music.126.net/iBxAZvHMTKfO3Vf8tdRa7Q==/109951165985707287.jpg?param=1024y1024',
  'https://p1.music.126.net/b36xosI5j0cpdN1y7ytZPg==/109951166021477556.jpg?param=1024y1024',
  'https://p1.music.126.net/bYwl8c5jErgbfGhv1tLJJA==/109951165276142037.jpg?param=1024y1024',
  'https://p2.music.126.net/ZR1nD3lHsAoDUatf3gl1nQ==/109951165061667554.jpg?param=1024y1024',
  'https://p1.music.126.net/XCMOOyclkmstP7KYHnNwcA==/109951164764312194.jpg?param=1024y1024',
  'https://p1.music.126.net/jE6ebqtlzw7S0nnO6Heq2A==/109951166270713524.jpg?param=1024y1024',
  'https://p1.music.126.net/6EoK9Mk27y3Cww5d9FA6ng==/109951165862426529.jpg?param=1024y1024',
  'https://p1.music.126.net/XPQs_6fT2Ioy5a9eFDPpQw==/109951165255101112.jpg?param=1024y1024',
  'https://p1.music.126.net/ocpMw2ku61bwhi7V7DJo9g==/109951167225594912.jpg?param=1024y1024',
  'https://p2.music.126.net/LFmG3XD07JH4OYMafO0txw==/109951167410278760.jpg?param=1024y1024',
  'https://p1.music.126.net/iZRipUtb21xr2E9Hz8sjYw==/109951167409480781.jpg?param=1024y1024',
  'https://p2.music.126.net/rvUDvsxa0LZu9o_Oww-0Iw==/109951167344103348.jpg?param=1024y1024',
  'https://p1.music.126.net/VGN68yovUJZtC47A_pYISg==/109951166515892030.jpg?param=1024y1024',
  'https://p2.music.126.net/xqluTLLrxqGWr8qiMZNlfw==/109951166327062990.jpg?param=1024y1024',
  'https://p2.music.126.net/I-gC5w8ECkgwPojf4YybeQ==/109951166074865960.jpg?param=1024y1024',
  'https://p1.music.126.net/MHIvytC5RXh5Lp2J_3tpaQ==/19017153114022258.jpg?param=1024y1024',
  'https://p1.music.126.net/3JcFV7xICf5gLwfaNK6wQQ==/109951163618704084.jpg?param=1024y1024',
  'https://p2.music.126.net/dUHTsm1kr_CdhmcQ3WVhVg==/109951163663181135.jpg?param=1024y1024',
  'https://p1.music.126.net/d7MyyfAt_YE0e85oK7eFMg==/7697680906568884.jpg?param=1024y1024',
]

export default {
  title: 'CoverWall',
  component: CoverWall,
} as ComponentMeta<typeof CoverWall>

const Template: ComponentStory<typeof CoverWall> = args => (
  <div className='rounded-3xl bg-[#F8F8F8] p-10 dark:bg-black'>
    <CoverWall covers={shuffle(covers)} />
  </div>
)

export const Primary = Template.bind({})
