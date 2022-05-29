import { Route, RouteObject, Routes, useLocation } from 'react-router-dom'
import Login from '@/web/pages/Login'
import Playlist from '@/web/pages/Playlist'
import Artist from '@/web/pages/Artist'
import Search from '@/web/pages/Search'
import Library from '@/web/pages/Library'
import Settings from '@/web/pages/Settings'
import { AnimatePresence } from 'framer-motion'
import React, { ReactNode, Suspense } from 'react'

const My = React.lazy(() => import('@/web/pages/New/My'))
const Discover = React.lazy(() => import('@/web/pages/New/Discover'))
const Album = React.lazy(() => import('@/web/pages/New/Album'))

const routes: RouteObject[] = [
  {
    path: '/',
    element: <My />,
  },
  {
    path: '/discover',
    element: <Discover />,
  },
  {
    path: '/library',
    element: <Library />,
  },
  {
    path: '/settings',
    element: <Settings />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/search/:keywords',
    element: <Search />,
    children: [
      {
        path: ':type',
        element: <Search />,
      },
    ],
  },
  {
    path: '/playlist/:id',
    element: <Playlist />,
  },
  {
    path: '/album/:id',
    element: <Album />,
  },
  {
    path: '/artist/:id',
    element: <Artist />,
  },
]

const lazy = (components: ReactNode) => {
  return <Suspense>{components}</Suspense>
}

const Router = () => {
  const location = useLocation()

  return (
    <AnimatePresence exitBeforeEnter>
      <Routes location={location} key={location.pathname}>
        <Route path='/' element={lazy(<My />)} />
        <Route path='/discover' element={lazy(<Discover />)} />
        <Route path='/login' element={lazy(<Login />)} />
        <Route path='/album/:id' element={lazy(<Album />)} />
      </Routes>
    </AnimatePresence>
  )
}

export default Router
