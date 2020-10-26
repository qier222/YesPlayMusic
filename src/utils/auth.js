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
  // 更新状态仓库中的登录状态
  store.commit("updateLogout");
}

// MUSIC_U 只有在账户登录的情况下才有
export function isLoggedIn() {
  return Cookies.get("MUSIC_U") !== undefined ? true : false;
}

// 账号登录
export function isAccountLoggedIn() {
  return (
    Cookies.get("MUSIC_U") !== undefined &&
    Cookies.get("loginMode") === "account"
  );
}

// 用户名搜索（用户数据为只读）
export function isUsernameLoggedIn() {
  return (
    Cookies.get("MUSIC_U") === undefined &&
    Cookies.get("loginMode") === "username"
  );
}

// 账户登录或者用户名搜索都判断为登录，宽松检查
export function isLooseLoggedIn() {
  return isAccountLoggedIn() || isUsernameLoggedIn();
}
