const realData =
  'eJx10mtIU2EcBvDtnCwNMfO2klUSmSQ5ZugKW/v/0TIjJVdhDStbXpqXrhY5Kwhtrcwiut9VSqMUMxX6IFqsD92sD1YgWGHRBcowKrpnPa/v+drg4flt572ds2PQ6XQut7MwJ940w2TOyS0pzF+/BV/MJrNO+3TVLOHUzKx5iw3/H5uZ7yxegct3tTl7Cr6QEa0gZ/dZOFsvfe5YHe1D+yFZxpncqEj/cCdwoirdVxHNnZrX3xygU5g7Eh6I9uOx8Ch4y9FQjlKkDz1pYrFXIJLUOovFGcYivqJgXqaXDqu7Rzc0XzmZxG81B/fF8wRVusn2jN5rDnwca8tFhyAJP4L4qiI9vX8cWzEmVKzT/46qxNpIdZOZz2HNcHhSkZ3D4AjYFpfGFkX6+dB+FvcSBe/SWbkLPVnEOJ1DFelXxVVci/Wj4TsBLhrQ/LGoaU4HxsTA28L76Cc8Dfau/U6F6FgkyBDDJar0g8tesmOvOHioWeXXmme6l3MLbIIre6wciU5E2t/k8WVxHfHvuUWXsH4SPCv1NW1Cz0aivgYO34vw1AEvi3MlIw0xHl6JNVPEGW41UJsqPaXYYTuEnotMdHwYfv7CFR/i+aXmrY5wrlSkEwr+0EJ0GvLmdw4/RS9Amj93UAbGZMIF40ezE3PtcG/yBWrT3L6oh66hFyMXK4xsUKT7aufzapxnFTwiNc3Wis5Bdm+OYCvmOuHj/ZeoQPOI00PUrUjXpG+kMFU61tFFDvQaZOn5DH4mzoLw4Hsaj14rzu/K4jF66fSWTnJinW3wBvcveqjZN3iFjKp0qKuF1mi21keST3NtTcbwu1eG3Dussr9eemljLIco0tVH7HwA493wOr+FlIjfy+GvkR4uwfjt4v/6G8K3NX8K38lt6B1ISa+Bv2O8Fy69foZOovci2S4Lr1aku4P9OEWVTt9wgMQ7exgJ8JXyI0W694WFyuBjcH75XyrEXsfhg+ZSvqZIf/Lct8Wp0md2tJN4PifEfjcm8gu02Ptbj459eum8eg8bFWlLXTb/A+uo9bM='
module.exports = (query, request) => {
  query.cookie.os = 'pc'
  const data = {
    algorithmCode: 'shazam_v2',
    times: 1,
    sessionId: 'C999431ACDC84EDBB984763654E6F8D7',
    duration: 3.3066249999999995,
    from: 'recognize-song',
    rawdata: realData,
  }
  return request('POST', `https://music.163.com/api/music/audio/match`, data, {
    crypto: 'weapi',
    cookie: query.cookie,
    proxy: query.proxy,
    realIP: query.realIP,
  })
}
