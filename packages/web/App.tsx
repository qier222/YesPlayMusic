import { Toaster } from 'react-hot-toast'
import { QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import Player from '@/web/components/Player'
import Sidebar from '@/web/components/Sidebar'
import reactQueryClient from '@/web/utils/reactQueryClient'
import Main from '@/web/components/Main'
import TitleBar from '@/web/components/TitleBar'
import Lyric from '@/web/components/Lyric'
import IpcRendererReact from '@/web/IpcRendererReact'

const App = () => {
  return (
    <QueryClientProvider client={reactQueryClient}>
      {window.env?.isEnableTitlebar && <TitleBar />}

      <div id='layout' className='grid select-none grid-cols-[16rem_auto]'>
        <Sidebar />
        <Main />
        <Player />
      </div>

      <Lyric />

      <Toaster position='bottom-center' containerStyle={{ bottom: '5rem' }} />

      <IpcRendererReact />

      {/* Devtool */}
      <ReactQueryDevtools
        initialIsOpen={false}
        toggleButtonProps={{
          style: {
            position: 'fixed',
            right: '0',
            left: 'auto',
            bottom: '4rem',
          },
        }}
      />
    </QueryClientProvider>
  )
}

export default App
