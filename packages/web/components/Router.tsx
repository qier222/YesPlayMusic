import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import React, { ReactNode, Suspense } from 'react'
import VideoPlayer from './VideoPlayer'

const My = React.lazy(() => import('@/web/pages/My'))
const Discover = React.lazy(() => import('@/web/pages/Discover'))
const Browse = React.lazy(() => import('@/web/pages/Browse'))
const Album = React.lazy(() => import('@/web/pages/Album'))
const Playlist = React.lazy(() => import('@/web/pages/Playlist'))
const Artist = React.lazy(() => import('@/web/pages/Artist'))
const Lyrics = React.lazy(() => import('@/web/pages/Lyrics'))
const Search = React.lazy(() => import('@/web/pages/Search'))
const Settings = React.lazy(() => import('@/web/pages/Settings'))

const lazy = (component: ReactNode) => {
  return <Suspense>{component}</Suspense>
}

const Router = () => {
  const location = useLocation()

  return (
    <AnimatePresence mode='wait'>
      <VideoPlayer />
      <Routes location={location} key={location.pathname}>
        <Route path='/' element={lazy(<My />)} />
        <Route path='/discover' element={lazy(<Discover />)} />
        <Route path='/browse' element={lazy(<Browse />)} />
        <Route path='/album/:id' element={lazy(<Album />)} />
        <Route path='/playlist/:id' element={lazy(<Playlist />)} />
        <Route path='/artist/:id' element={lazy(<Artist />)} />
        <Route path='/settings' element={lazy(<Settings />)} />
        <Route path='/lyrics' element={lazy(<Lyrics />)} />
        <Route path='/search/:keywords' element={lazy(<Search />)}>
          <Route path=':type' element={lazy(<Search />)} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

export default Router
