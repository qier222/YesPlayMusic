import { Route, Routes, useLocation } from 'react-router-dom'
import Search from '@/web/pages/Search'
import Settings from '@/web/pages/Settings'
import { AnimatePresence } from 'framer-motion'
import React, { ReactNode, Suspense } from 'react'

const My = React.lazy(() => import('@/web/pages/New/My'))
const Discover = React.lazy(() => import('@/web/pages/New/Discover'))
const Browse = React.lazy(() => import('@/web/pages/New/Browse'))
const Album = React.lazy(() => import('@/web/pages/New/Album'))
const Playlist = React.lazy(() => import('@/web/pages/New/Playlist'))
const Artist = React.lazy(() => import('@/web/pages/New/Artist'))

const lazy = (component: ReactNode) => {
  return <Suspense>{component}</Suspense>
}

const Router = () => {
  const location = useLocation()

  return (
    <AnimatePresence exitBeforeEnter>
      <Routes location={location} key={location.pathname}>
        <Route path='/' element={lazy(<My />)} />
        <Route path='/discover' element={lazy(<Discover />)} />
        <Route path='/browse' element={lazy(<Browse />)} />
        <Route path='/album/:id' element={lazy(<Album />)} />
        <Route path='/playlist/:id' element={lazy(<Playlist />)} />
        <Route path='/artist/:id' element={lazy(<Artist />)} />
        <Route path='/settings' element={lazy(<Settings />)} />
        <Route path='/search/:keywords' element={lazy(<Search />)}>
          <Route path=':type' element={lazy(<Search />)} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

export default Router
