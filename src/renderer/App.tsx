import { Toaster } from 'react-hot-toast'
import { QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import Player from '@/renderer/components/Player'
import Sidebar from '@/renderer/components/Sidebar'
import reactQueryClient from '@/renderer/utils/reactQueryClient'
import Main from '@/renderer/components/Main'
import TitleBar from '@/renderer/components/TitleBar'
import Lyric from '@/renderer/components/Lyric'

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
