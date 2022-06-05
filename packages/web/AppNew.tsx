import { Toaster } from 'react-hot-toast'
import TitleBar from '@/web/components/TitleBar'
import IpcRendererReact from '@/web/IpcRendererReact'
import Layout from '@/web/components/New/Layout'
import Devtool from '@/web/components/New/Devtool'
import ErrorBoundary from '@/web/components/New/ErrorBoundary'

const App = () => {
  return (
    <ErrorBoundary>
      <div className='dark'>
        {window.env?.isEnableTitlebar && <TitleBar />}
        <Layout />
        <Toaster position='bottom-center' containerStyle={{ bottom: '5rem' }} />
        <IpcRendererReact />
        <Devtool />
      </div>
    </ErrorBoundary>
  )
}

export default App
