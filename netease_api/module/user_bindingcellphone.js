module.exports = (query, request) => {
  const data = {
    phone: query.phone,
    countrycode: query.countrycode || '86',
    captcha: query.captcha,
    password: query.password
      ? crypto.createHash('md5').update(query.password).digest('hex')
      : '',
  }
  return request(
    'POST',
    `https://music.163.com/api/user/bindingCellphone`,
    data,
    {
      crypto: 'weapi',
      cookie: query.cookie,
      proxy: query.proxy,
      realIP: query.realIP,
    },
  )
}
