export interface Store {
  uiStates: {
    showLyricPanel: boolean
    showLoginPanel: boolean
  }
  persistedUiStates: {
    loginPhoneCountryCode: string
    loginType: 'phone' | 'email' | 'qrCode'
  }
  settings: {
    showSidebar: boolean
    accentColor: string
    unm: {
      enabled: boolean
      sources: Array<
        'migu' | 'kuwo' | 'kugou' | 'ytdl' | 'qq' | 'bilibili' | 'joox'
      >
      searchMode: 'order-first' | 'fast-first'
      proxy: null | {
        protocol: 'http' | 'https' | 'socks5'
        host: string
        port: number
        username?: string
        password?: string
      }
      cookies: {
        qq?: string
        joox?: string
      }
    }
  }
}

export const initialState: Store = {
  uiStates: {
    showLyricPanel: false,
    showLoginPanel: false,
  },
  persistedUiStates: {
    loginPhoneCountryCode: '+86',
    loginType: 'qrCode',
  },
  settings: {
    showSidebar: true,
    accentColor: 'blue',
    unm: {
      enabled: true,
      sources: ['migu'],
      searchMode: 'order-first',
      proxy: null,
      cookies: {},
    },
  },
}
