import axios from "axios";

let baseURL = "";
// Web 和 Electron 跑在不同端口避免同时启动时冲突
if (process.env.IS_ELECTRON) {
  if (process.env.NODE_ENV === "production") {
    baseURL = process.env.VUE_APP_ELECTRON_API_URL;
  } else {
    baseURL = process.env.VUE_APP_ELECTRON_API_URL_DEV;
  }
} else {
  baseURL = process.env.VUE_APP_NETEASE_API_URL;
}

const service = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
});

const errors = new Map([
  [401, "The token you are using has expired."],
  [301, "You must login to use this feature."],
  [-1, "An unexpected error has occurred: "],
]);

service.interceptors.response.use(
  (response) => {
    const res = response.data;

    if (response.status !== 200) {
      alert(
        errors.has(response.status)
          ? errors.get(response.status) ||
              // null = `The server returned ${res.msg}`
              `The server returned ${res.msg}`
          : // -1 = default expection message
            errors.get(-1) + response.status
      );
    } else {
      return res;
    }
  },
  (error) => {
    const errMsg = `error: ${error}`;
    console.log(errMsg);

    return Promise.reject(error);
  }
);

export default service;
