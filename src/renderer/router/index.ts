import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    name: 'home',
    path: '/',
    component: () => import('../views/Home.vue'),
  },
  {
    name: 'login',
    path: '/login',
    component: () => import('../views/Login.vue'),
  },
  {
    name: 'explore',
    path: '/explore',
    component: () => import('../views/Explore.vue'),
  },
  {
    name: 'library',
    path: '/library',
    component: () => import('../views/Library.vue'),
  },
  {
    name: 'album',
    path: '/album/:id',
    component: () => import('../views/Album.vue'),
  },
  {
    name: 'artist',
    path: '/artist/:id',
    component: () => import('../views/Artist.vue'),
  },
  {
    name: 'playlist',
    path: '/playlist/:id',
    component: () => import('../views/Playlist.vue'),
  },
  {
    name: 'search',
    path: '/search',
    component: () => import('../views/Search.vue'),
  },
  {
    name: '404',
    path: '/404',
    component: () => import('../views/404.vue'),
  },
  {
    path: '/*',
    redirect: '/404',
  },
]

const router = createRouter({
  history:
    import.meta.env.VITE_APP_ELECTRON === 'yes'
      ? createWebHashHistory()
      : createWebHistory(),
  routes,
})

export default router
