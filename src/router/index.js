import Vue from "vue";
import VueRouter from "vue-router";
import store from "@/store";
import NProgress from "nprogress";
import "@/assets/css/nprogress.css";
import Cookies from "js-cookie";

NProgress.configure({ showSpinner: false, trickleSpeed: 100 });

Vue.use(VueRouter);
const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("@/views/home"),
    meta: {
      keepAlive: true,
    },
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/login"),
  },
  {
    path: "/login/username",
    name: "loginUsername",
    component: () => import("@/views/loginUsername"),
  },
  {
    path: "/login/account",
    name: "loginAccount",
    component: () => import("@/views/loginAccount"),
  },
  {
    path: "/playlist/:id",
    name: "playlist",
    component: () => import("@/views/playlist"),
  },
  {
    path: "/album/:id",
    name: "album",
    component: () => import("@/views/album"),
  },
  {
    path: "/artist/:id",
    name: "artist",
    component: () => import("@/views/artist"),
    meta: {
      keepAlive: true,
    },
  },
  {
    path: "/mv/:id",
    name: "mv",
    component: () => import("@/views/mv"),
  },
  {
    path: "/next",
    name: "next",
    component: () => import("@/views/next"),
    meta: {
      keepAlive: true,
    },
  },
  {
    path: "/search",
    name: "search",
    component: () => import("@/views/search"),
  },
  {
    path: "/new-album",
    name: "newAlbum",
    component: () => import("@/views/newAlbum"),
  },
  {
    path: "/explore",
    name: "explore",
    component: () => import("@/views/explore"),
    meta: {
      keepAlive: true,
    },
  },
  {
    path: "/library",
    name: "library",
    component: () => import("@/views/library"),
    meta: {
      requireLogin: true,
      keepAlive: true,
    },
  },
  {
    path: "/library/liked-songs",
    name: "likedSongs",
    component: () => import("@/views/playlist"),
    meta: {
      requireLogin: true,
    },
  },
];
const router = new VueRouter({
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { x: 0, y: 0 };
    }
  },
});

router.beforeEach((to, from, next) => {
  if (to.meta.requireLogin) {
    if (store.state.settings.user.nickname === undefined) {
      next({ path: "/login" });
    }
    if (
      Cookies.get("MUSIC_U") === undefined &&
      Cookies.get("loginMode") === "account"
    ) {
      next({ path: "/login" });
    } else {
      next();
    }
  } else {
    next();
  }
});

router.afterEach((to) => {
  if (to.matched.some((record) => !record.meta.keepAlive)) {
    NProgress.start();
  }
});

export default router;
