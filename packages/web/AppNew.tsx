import TitleBar from '@/web/components/TitleBar'
import IpcRendererReact from '@/web/IpcRendererReact'
import Layout from '@/web/components/New/Layout'
import Devtool from '@/web/components/New/Devtool'
import ErrorBoundary from '@/web/components/New/ErrorBoundary'
import useIsMobile from '@/web/hooks/useIsMobile'
import LayoutMobile from '@/web/components/New/LayoutMobile'
import ScrollRestoration from '@/web/components/New/ScrollRestoration'
import Toaster from './components/New/Toaster'

const App = () => {
  const isMobile = useIsMobile()

  return (
    <ErrorBoundary>
      {isMobile ? <LayoutMobile /> : <Layout />}
      <Toaster />
      <ScrollRestoration />
      <IpcRendererReact />
      <Devtool />
    </ErrorBoundary>
  )
}

export default App
