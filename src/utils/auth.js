import Cookies from "js-cookie";
import { logout } from "@/api/auth";
import store from "@/store";

export function doLogout() {
  logout();
  // 移除前端本地用来认证登录的字段
  Cookies.remove("loginMode");
  // 网易云的接口会自动移除该 cookies
  // Cookies.remove("MUSIC_U");
  // 更新状态仓库中的用户信息
  store.commit("updateUser", { id: 0 });
}

export function isLoggedIn() {
  return Cookies.get("MUSIC_U") !== undefined ? true : false;
}
