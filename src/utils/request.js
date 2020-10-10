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
      } else {
        alert("unknow error");
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
