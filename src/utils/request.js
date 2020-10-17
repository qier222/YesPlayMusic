import axios from "axios";

const service = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 15000,
});

service.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code !== 200) {
      if (res.code === 401) {
        alert("token expired");
      } else if (res.code === 502) {
        alert(res.msg);
      } else if (res.code === 301) {
        alert("login required");
      } else {
        alert("unknown error");
      }
    } else {
      return res;
    }
  },
  (error) => {
    console.log("err" + error);
    alert("err " + error);
    return Promise.reject(error);
  }
);

export default service;
