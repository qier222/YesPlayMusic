import { Toaster } from 'react-hot-toast'
import { QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import Player from '@/components/Player'
import Sidebar from '@/components/Sidebar'
import reactQueryClient from '@/utils/reactQueryClient'
import Main from './components/Main'
import TitleBar from './components/TitleBar'

const App = () => {
  return (
    <QueryClientProvider client={reactQueryClient}>
      {window.env?.isWin && <TitleBar />}

      <div id='layout' className='grid select-none grid-cols-[16rem_auto]'>
        <Sidebar />
        <Main />
        <Player />
      </div>

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
