import Cookies from "js-cookie";
import { logout } from "@/api/auth";

export function doLogout() {
  console.log("logout");
  logout();
  Cookies.remove("loginMode");
}

export function isLoggedIn() {
  return Cookies.get("MUSIC_U") !== undefined ? true : false;
}
