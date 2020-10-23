import Cookies from "js-cookie";
import { logout } from "@/api/auth";
import store from "@/store";

export function doLogout() {
  logout();
  Cookies.remove("loginMode");
  store.commit("updateUser", { id: 0 });
}

export function isLoggedIn() {
  return Cookies.get("MUSIC_U") !== undefined ? true : false;
}
