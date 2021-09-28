const getters = {
  isLoggedIn: (state: State) =>
    [null, undefined, ''].includes(state.account.cookies.MUSIC_U),
}

export default getters
