import type { RouteObject } from 'react-router-dom'
import { useRoutes } from 'react-router-dom'
import Album from '@/web/pages/Album'
import Home from '@/web/pages/Home'
import Login from '@/web/pages/Login'
import Playlist from '@/web/pages/Playlist'
import Artist from '@/web/pages/Artist'
import Search from '@/web/pages/Search'
import Library from '@/web/pages/Library'
import Podcast from '@/web/pages/Podcast'
import Settings from '@/web/pages/Settings'

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
