import { Fragment } from 'react'
import type { RouteObject } from 'react-router-dom'
import { useRoutes } from 'react-router-dom'
import Album from '@/pages/Album'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Playlist from '@/pages/Playlist'
import Artist from '@/pages/Artist'

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/login',
    element: <Login />,
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

const Router = () => {
  const element = useRoutes(routes)
  return <Fragment>{element}</Fragment>
}

export default Router
