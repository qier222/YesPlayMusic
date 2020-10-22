import axios from "axios";

const service = axios.create({
  baseURL: process.env.VUE_APP_NETEASE_API_URL,
  withCredentials: true,
  timeout: 15000,
});

const errors = new Map([
  [401, "The token you are using has expired."],
  [502, null],
  [301, "You must login to use this feature."],
  [-1, "An unexpected error has occurred: "],
]);

service.interceptors.response.use(
  (response) => {
    const res = response.data;

    if (res.code !== 200) {
      alert(
        errors.has(res.code)
          ? errors.get(res.code) ||
              // null = `The server returned ${res.msg}`
              `The server returned ${res.msg}`
          : // -1 = default expection message
            errors.get(-1) + res.code
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
