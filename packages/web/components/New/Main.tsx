import { css, cx } from '@emotion/css'
import Router from './Router'

const Main = () => {
  return (
    <main
      className={cx(
        'overflow-y-auto pb-16 pr-6 pl-10',
        css`
          padding-top: 132px;
          grid-area: main;
          &::-webkit-scrollbar {
            display: none;
          }
        `
      )}
    >
      <Router />
    </main>
  )
}

export default Main
