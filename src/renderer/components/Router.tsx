import type { RouteObject } from 'react-router-dom'
import { useRoutes } from 'react-router-dom'
import Album from '@/renderer/pages/Album'
import Home from '@/renderer/pages/Home'
import Login from '@/renderer/pages/Login'
import Playlist from '@/renderer/pages/Playlist'
import Artist from '@/renderer/pages/Artist'
import Search from '@/renderer/pages/Search'
import Library from '@/renderer/pages/Library'
import Podcast from '@/renderer/pages/Podcast'
import Settings from '@/renderer/pages/Settings'

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/podcast',
    element: <Podcast />,
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

const Router = () => {
  const element = useRoutes(routes)
  return <>{element}</>
}

export default Router
