import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import React, { lazy, Suspense } from 'react'
import VideoPlayer from './VideoPlayer'

const My = lazy(() => import('@/web/pages/My'))
const Discover = lazy(() => import('@/web/pages/Discover'))
const Browse = lazy(() => import('@/web/pages/Browse'))
const Album = lazy(() => import('@/web/pages/Album'))
const Playlist = lazy(() => import('@/web/pages/Playlist'))
const Artist = lazy(() => import('@/web/pages/Artist'))
const Lyrics = lazy(() => import('@/web/pages/Lyrics'))
const Search = lazy(() => import('@/web/pages/Search'))
const Settings = lazy(() => import('@/web/pages/Settings'))

const Router = () => {
  const location = useLocation()

  return (
    <AnimatePresence mode='wait'>
      <VideoPlayer />
      <Routes location={location} key={location.pathname}>
        <Route path='/' element={<My />} />
        <Route path='/discover' element={<Discover />} />
        <Route path='/browse' element={<Browse />} />
        <Route path='/album/:id' element={<Album />} />
        <Route path='/playlist/:id' element={<Playlist />} />
        <Route path='/artist/:id' element={<Artist />} />
        <Route path='/settings' element={<Settings />} />
        <Route path='/lyrics' element={<Lyrics />} />
        <Route path='/search/:keywords' element={<Search />}>
          <Route path=':type' element={<Search />} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

export default Router
