import { isAccountLoggedIn } from "./auth";
import { refreshCookie } from "@/api/auth";
import dayjs from "dayjs";
import store from "@/store";

export function isTrackPlayable(track) {
  let result = {
    playable: true,
    reason: "",
  };
  if (track.fee === 1 || track.privilege?.fee === 1) {
    if (isAccountLoggedIn() && store.state.settings.user.vipType === 11) {
      result.playable = true;
    } else {
      result.playable = false;
      result.reason = "VIP Only";
    }
  } else if (track.fee === 4 || track.privilege?.fee === 4) {
    result.playable = false;
    result.reason = "Paid Album";
  } else if (
    track.noCopyrightRcmd !== null &&
    track.noCopyrightRcmd !== undefined
  ) {
    result.playable = false;
    result.reason = "No Copyright";
  }
  return result;
}

export function mapTrackPlayableStatus(tracks) {
  return tracks.map((t) => {
    let result = isTrackPlayable(t);
    t.playable = result.playable;
    t.reason = result.reason;
    return t;
  });
}

export function randomNum(minNum, maxNum) {
  switch (arguments.length) {
    case 1:
      return parseInt(Math.random() * minNum + 1, 10);
    case 2:
      return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
    default:
      return 0;
  }
}

export function shuffleAList(list) {
  let sortsList = list.map((t) => t.sort);
  for (let i = 1; i < sortsList.length; i++) {
    const random = Math.floor(Math.random() * (i + 1));
    [sortsList[i], sortsList[random]] = [sortsList[random], sortsList[i]];
  }
  let newSorts = {};
  list.map((track) => {
    newSorts[track.id] = sortsList.pop();
  });
  return newSorts;
}

export function throttle(fn, time) {
  let isRun = false;
  return function() {
    if (isRun) return;
    isRun = true;
    fn.apply(this, arguments);
    setTimeout(() => {
      isRun = false;
    }, time);
  };
}

export function updateHttps(url) {
  if (!url) return "";
  return url.replace(/^http:/, "https:");
}

export function dailyTask() {
  if (
    store.state.settings.lastRefreshCookieDate === undefined ||
    store.state.settings.lastRefreshCookieDate !== dayjs().date()
  ) {
    console.log("execute dailyTask");
    store.commit("updateSettings", {
      key: "lastRefreshCookieDate",
      value: dayjs().date(),
    });
    refreshCookie();
  }
}
