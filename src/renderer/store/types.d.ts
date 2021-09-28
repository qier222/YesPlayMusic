declare interface State {
  account: {
    cookies: {
      [key: string]: string
    }
  }
  uiStates: {
    loginPhoneCountryCode: string
    searchKeywords: string
  }
  settings: {
    showSidebar: boolean
  }
}
