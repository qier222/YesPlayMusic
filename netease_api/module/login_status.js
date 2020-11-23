// 登录状态

module.exports = (query, request) => {
  return request(
    'GET',
    `https://music.163.com`,
    {},
    { cookie: query.cookie, proxy: query.proxy, realIP: query.realIP },
  ).then((response) => {
    try {
      let profile = eval(`(${/GUser\s*=\s*([^;]+);/.exec(response.body)[1]})`);
      let bindings = eval(
        `(${/GBinds\s*=\s*([^;]+);/.exec(response.body)[1]})`,
      );
      response.body = { code: 200, profile: profile, bindings: bindings };
      return response;
    } catch (err) {
      response.status = 301;
      response.body = { code: 301 };
      return Promise.reject(response);
    }
  });
};
