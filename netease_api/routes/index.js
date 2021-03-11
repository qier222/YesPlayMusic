const { cookieToJson } = require('../util/index');
const crypto = require('crypto');
const request = require('../util/request');
module.exports = {
  '/yunbei/today': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const yunbei_today = (query, request) => {
      const data = {};
      return request(
        'POST',
        `https://music.163.com/api/point/today/get`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    yunbei_today(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/yunbei/tasks/todo': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const yunbei_tasks_todo = (query, request) => {
      const data = {};
      return request(
        'POST',
        `https://music.163.com/api/usertool/task/todo/query`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    yunbei_tasks_todo(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/yunbei/tasks': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const yunbei_tasks = (query, request) => {
      const data = {};
      return request(
        'POST',
        `https://music.163.com/api/usertool/task/list/all`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    yunbei_tasks(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/yunbei/task/finish': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const yunbei_task_finish = (query, request) => {
      const data = {
        userTaskId: query.userTaskId,
        depositCode: query.depositCode || '0',
      };
      return request(
        'POST',
        `https://music.163.com/api/usertool/task/point/receive`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    yunbei_task_finish(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/yunbei/sign': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const yunbei_sign = (query, request) => {
      const data = { type: '0' };
      return request(
        'POST',
        `https://music.163.com/api/point/dailyTask`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    yunbei_sign(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/yunbei/receipt': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const yunbei_receipt = (query, request) => {
      const data = { limit: query.limit || 10, offset: query.offset || 0 };
      return request(
        'POST',
        `https://music.163.com/store/api/point/receipt`,
        data,
        {
          crypto: 'api',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    yunbei_receipt(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/yunbei/info': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const yunbei_info = (query, request) => {
      const data = {};
      return request('POST', `https://music.163.com/api/v1/user/info`, data, {
        crypto: 'weapi',
        cookie: query.cookie,
        proxy: query.proxy,
        realIP: query.realIP,
      });
    };
    yunbei_info(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/yunbei/expense': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const yunbei_expense = (query, request) => {
      const data = { limit: query.limit || 10, offset: query.offset || 0 };
      return request(
        'POST',
        `https://music.163.com/store/api/point/expense`,
        data,
        {
          crypto: 'api',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    yunbei_expense(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/yunbei': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const yunbei = (query, request) => {
      const data = {};
      return request(
        'POST',
        `https://music.163.com/api/point/signed/get`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    yunbei(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/weblog': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const weblog = (query, request) => {
      return request(
        'POST',
        `https://music.163.com/weapi/feedback/weblog`,
        query.data || {},
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    weblog(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/video/url': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const video_url = (query, request) => {
      const data = {
        ids: '["' + query.id + '"]',
        resolution: query.res || 1080,
      };
      return request(
        'POST',
        `https://music.163.com/weapi/cloudvideo/playurl`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    video_url(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/video/timeline/recommend': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const video_timeline_recommend = (query, request) => {
      const data = {
        offset: query.offset || 0,
        filterLives: '[]',
        withProgramInfo: 'true',
        needUrl: '1',
        resolution: '480',
      };
      return request(
        'POST',
        `https://music.163.com/api/videotimeline/get`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    video_timeline_recommend(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/video/timeline/all': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const video_timeline_all = (query, request) => {
      const data = {
        groupId: 0,
        offset: query.offset || 0,
        need_preview_url: 'true',
        total: true,
      };
      return request(
        'POST',
        `https://music.163.com/api/videotimeline/otherclient/get`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    video_timeline_all(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/video/sub': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const video_sub = (query, request) => {
      query.t = query.t == 1 ? 'sub' : 'unsub';
      const data = { id: query.id };
      return request(
        'POST',
        `https://music.163.com/weapi/cloudvideo/video/${query.t}`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    video_sub(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/video/group/list': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const video_group_list = (query, request) => {
      const data = {};
      return request(
        'POST',
        `https://music.163.com/api/cloudvideo/group/list`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    video_group_list(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/video/group': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const video_group = (query, request) => {
      const data = {
        groupId: query.id,
        offset: query.offset || 0,
        need_preview_url: 'true',
        total: true,
      };
      return request(
        'POST',
        `https://music.163.com/api/videotimeline/videogroup/otherclient/get`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    video_group(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/video/detail/info': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const video_detail_info = (query, request) => {
      const data = { threadid: `R_VI_62_${query.vid}`, composeliked: true };
      return request(
        'POST',
        `https://music.163.com/api/comment/commentthread/info`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    video_detail_info(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/video/detail': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const video_detail = (query, request) => {
      const data = { id: query.id };
      return request(
        'POST',
        `https://music.163.com/weapi/cloudvideo/v1/video/detail`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    video_detail(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/video/category/list': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const video_category_list = (query, request) => {
      const data = {
        offset: query.offset || 0,
        total: 'true',
        limit: query.limit || 99,
      };
      return request(
        'POST',
        `https://music.163.com/api/cloudvideo/category/list`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    video_category_list(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/user/update': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const user_update = (query, request) => {
      const data = {
        avatarImgId: '0',
        birthday: query.birthday,
        city: query.city,
        gender: query.gender,
        nickname: query.nickname,
        province: query.province,
        signature: query.signature,
      };
      return request(
        'POST',
        `https://music.163.com/weapi/user/profile/update`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    user_update(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/user/subcount': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const user_subcount = (query, request) => {
      return request(
        'POST',
        `https://music.163.com/weapi/subcount`,
        {},
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    user_subcount(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/user/replacephone': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const user_replacephone = (query, request) => {
      const data = {
        phone: query.phone,
        captcha: query.captcha,
        oldcaptcha: query.oldcaptcha,
        countrycode: query.countrycode || '86',
      };
      return request(
        'POST',
        `https://music.163.com/api/user/replaceCellphone`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    user_replacephone(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/user/record': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const user_record = (query, request) => {
      const data = { uid: query.uid, type: query.type || 0 };
      return request(
        'POST',
        `https://music.163.com/weapi/v1/play/record`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    user_record(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/user/playlist': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const user_playlist = (query, request) => {
      const data = {
        uid: query.uid,
        limit: query.limit || 30,
        offset: query.offset || 0,
        includeVideo: true,
      };
      return request('POST', `https://music.163.com/api/user/playlist`, data, {
        crypto: 'weapi',
        cookie: query.cookie,
        proxy: query.proxy,
        realIP: query.realIP,
      });
    };
    user_playlist(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/user/level': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const user_level = (query, request) => {
      const data = {};
      return request('POST', `https://music.163.com/weapi/user/level`, data, {
        crypto: 'weapi',
        cookie: query.cookie,
        proxy: query.proxy,
        realIP: query.realIP,
      });
    };
    user_level(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/user/follows': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const user_follows = (query, request) => {
      const data = {
        offset: query.offset || 0,
        limit: query.limit || 30,
        order: true,
      };
      return request(
        'POST',
        `https://music.163.com/weapi/user/getfollows/${query.uid}`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    user_follows(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/user/followeds': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const user_followeds = (query, request) => {
      const data = {
        userId: query.uid,
        time: query.lasttime || -1,
        limit: query.limit || 30,
      };
      return request(
        'POST',
        `https://music.163.com/eapi/user/getfolloweds/${query.uid}`,
        data,
        {
          crypto: 'eapi',
          cookie: query.cookie,
          proxy: query.proxy,
          url: '/api/user/getfolloweds',
          realIP: query.realIP,
        },
      );
    };
    user_followeds(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/user/event': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const user_event = (query, request) => {
      const data = {
        getcounts: true,
        time: query.lasttime || -1,
        limit: query.limit || 30,
        total: false,
      };
      return request(
        'POST',
        `https://music.163.com/weapi/event/get/${query.uid}`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    user_event(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/user/dj': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const user_dj = (query, request) => {
      const data = { limit: query.limit || 30, offset: query.offset || 0 };
      return request(
        'POST',
        `https://music.163.com/weapi/dj/program/${query.uid}`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    user_dj(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/user/detail': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const user_detail = (query, request) => {
      return request(
        'POST',
        `https://music.163.com/weapi/v1/user/detail/${query.uid}`,
        {},
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    user_detail(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/user/cloud/detail': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const user_cloud_detail = (query, request) => {
      const id = query.id.replace(/\s/g, '').split(',');
      const data = { songIds: id };
      return request(
        'POST',
        `https://music.163.com/weapi/v1/cloud/get/byids`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    user_cloud_detail(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/user/cloud/del': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const user_cloud_del = (query, request) => {
      const data = { songIds: [query.id] };
      return request('POST', `https://music.163.com/weapi/cloud/del`, data, {
        crypto: 'weapi',
        cookie: query.cookie,
        proxy: query.proxy,
        realIP: query.realIP,
      });
    };
    user_cloud_del(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/user/cloud': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const user_cloud = (query, request) => {
      const data = { limit: query.limit || 30, offset: query.offset || 0 };
      return request('POST', `https://music.163.com/weapi/v1/cloud/get`, data, {
        crypto: 'weapi',
        cookie: query.cookie,
        proxy: query.proxy,
        realIP: query.realIP,
      });
    };
    user_cloud(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/user/binding': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const user_binding = (query, request) => {
      const data = {};
      return request(
        'POST',
        `https://music.163.com/api/v1/user/bindings/${query.uid}`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    user_binding(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/user/audio': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const user_audio = (query, request) => {
      const data = { userId: query.uid };
      return request(
        'POST',
        `https://music.163.com/weapi/djradio/get/byuser`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    user_audio(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/user/account': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const user_account = (query, request) => {
      const data = {};
      return request(
        'POST',
        `https://music.163.com/api/nuser/account/get`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    user_account(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/toplist/detail': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const toplist_detail = (query, request) => {
      return request(
        'POST',
        `https://music.163.com/weapi/toplist/detail`,
        {},
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    toplist_detail(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/toplist/artist': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const toplist_artist = (query, request) => {
      const data = {
        type: query.type || 1,
        limit: 100,
        offset: 0,
        total: true,
      };
      return request(
        'POST',
        `https://music.163.com/weapi/toplist/artist`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    toplist_artist(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/toplist': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const toplist = (query, request) => {
      return request(
        'POST',
        `https://music.163.com/api/toplist`,
        {},
        {
          crypto: 'linuxapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    toplist(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/top/song': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const top_song = (query, request) => {
      const data = { areaId: query.type || 0, total: true };
      return request(
        'POST',
        `https://music.163.com/weapi/v1/discovery/new/songs`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    top_song(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/top/playlist/highquality': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const top_playlist_highquality = (query, request) => {
      const data = {
        cat: query.cat || '全部',
        limit: query.limit || 50,
        lasttime: query.before || 0,
        total: true,
      };
      return request(
        'POST',
        `https://music.163.com/api/playlist/highquality/list`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    top_playlist_highquality(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/top/playlist': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const top_playlist = (query, request) => {
      const data = {
        cat: query.cat || '全部',
        order: query.order || 'hot',
        limit: query.limit || 50,
        offset: query.offset || 0,
        total: true,
      };
      return request(
        'POST',
        `https://music.163.com/weapi/playlist/list`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    top_playlist(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/top/mv': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const top_mv = (query, request) => {
      const data = {
        area: query.area || '',
        limit: query.limit || 30,
        offset: query.offset || 0,
        total: true,
      };
      return request('POST', `https://music.163.com/weapi/mv/toplist`, data, {
        crypto: 'weapi',
        cookie: query.cookie,
        proxy: query.proxy,
        realIP: query.realIP,
      });
    };
    top_mv(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/top/list': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const top_list = (query, request) => {
      query.cookie.os = 'pc';
      if (query.idx) {
        return Promise.resolve({
          status: 500,
          body: { code: 500, msg: '不支持此方式调用,只支持id调用' },
        });
      }
      const data = { id: query.id, n: '500', s: '0' };
      return request(
        'POST',
        `https://interface3.music.163.com/api/playlist/v4/detail`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    top_list(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/top/artists': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const top_artists = (query, request) => {
      const data = {
        limit: query.limit || 50,
        offset: query.offset || 0,
        total: true,
      };
      return request('POST', `https://music.163.com/weapi/artist/top`, data, {
        crypto: 'weapi',
        cookie: query.cookie,
        proxy: query.proxy,
        realIP: query.realIP,
      });
    };
    top_artists(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/top/album': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const top_album = (query, request) => {
      const date = new Date();
      const data = {
        area: query.area || 'ALL',
        limit: query.limit || 50,
        offset: query.offset || 0,
        type: query.type || 'new',
        year: query.year || date.getFullYear(),
        month: query.month || date.getMonth() + 1,
        total: false,
        rcmd: true,
      };
      return request(
        'POST',
        `https://music.163.com/api/discovery/new/albums/area`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    top_album(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/song/url': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const song_url = (query, request) => {
      if (!('MUSIC_U' in query.cookie))
        query.cookie._ntes_nuid = crypto.randomBytes(16).toString('hex');
      query.cookie.os = 'pc';
      const data = {
        ids: '[' + query.id + ']',
        br: parseInt(query.br || 999000),
      };
      return request(
        'POST',
        `https://interface3.music.163.com/eapi/song/enhance/player/url`,
        data,
        {
          crypto: 'eapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
          url: '/api/song/enhance/player/url',
        },
      );
    };
    song_url(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/song/order/update': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const song_order_update = (query, request) => {
      const data = { pid: query.pid, trackIds: query.ids, op: 'update' };
      return request(
        'POST',
        `http://interface.music.163.com/api/playlist/manipulate/tracks`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          url: '/api/playlist/desc/update',
          realIP: query.realIP,
        },
      );
    };
    song_order_update(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/song/detail': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const song_detail = (query, request) => {
      query.ids = query.ids.split(/\s*,\s*/);
      const data = {
        c: '[' + query.ids.map((id) => '{"id":' + id + '}').join(',') + ']',
        ids: '[' + query.ids.join(',') + ']',
      };
      return request(
        'POST',
        `https://music.163.com/weapi/v3/song/detail`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    song_detail(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/simi/user': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const simi_user = (query, request) => {
      const data = {
        songid: query.id,
        limit: query.limit || 50,
        offset: query.offset || 0,
      };
      return request(
        'POST',
        `https://music.163.com/weapi/discovery/simiUser`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    simi_user(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/simi/song': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const simi_song = (query, request) => {
      const data = {
        songid: query.id,
        limit: query.limit || 50,
        offset: query.offset || 0,
      };
      return request(
        'POST',
        `https://music.163.com/weapi/v1/discovery/simiSong`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    simi_song(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/simi/playlist': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const simi_playlist = (query, request) => {
      const data = {
        songid: query.id,
        limit: query.limit || 50,
        offset: query.offset || 0,
      };
      return request(
        'POST',
        `https://music.163.com/weapi/discovery/simiPlaylist`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    simi_playlist(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/simi/mv': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const simi_mv = (query, request) => {
      const data = { mvid: query.mvid };
      return request(
        'POST',
        `https://music.163.com/weapi/discovery/simiMV`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    simi_mv(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/simi/artist': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const simi_artist = (query, request) => {
      const data = { artistid: query.id };
      return request(
        'POST',
        `https://music.163.com/weapi/discovery/simiArtist`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    simi_artist(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/share/resource': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const share_resource = (query, request) => {
      const data = {
        type: query.type || 'song',
        msg: query.msg || '',
        id: query.id || '',
      };
      return request(
        'POST',
        `https://music.163.com/weapi/share/friends/resource`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    share_resource(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/setting': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const setting = (query, request) => {
      const data = {};
      return request('POST', `https://music.163.com/api/user/setting`, data, {
        crypto: 'weapi',
        cookie: query.cookie,
        proxy: query.proxy,
        realIP: query.realIP,
      });
    };
    setting(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/send/text': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const send_text = (query, request) => {
      query.cookie.os = 'pc';
      const data = {
        type: 'text',
        msg: query.msg,
        userIds: '[' + query.user_ids + ']',
      };
      return request(
        'POST',
        `https://music.163.com/weapi/msg/private/send`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    send_text(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/send/playlist': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const send_playlist = (query, request) => {
      query.cookie.os = 'pc';
      const data = {
        id: query.playlist,
        type: 'playlist',
        msg: query.msg,
        userIds: '[' + query.user_ids + ']',
      };
      return request(
        'POST',
        `https://music.163.com/weapi/msg/private/send`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    send_playlist(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/search/suggest': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const search_suggest = (query, request) => {
      const data = { s: query.keywords || '' };
      let type = query.type == 'mobile' ? 'keyword' : 'web';
      return request(
        'POST',
        `https://music.163.com/weapi/search/suggest/` + type,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    search_suggest(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/search/multimatch': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const search_multimatch = (query, request) => {
      const data = { type: query.type || 1, s: query.keywords || '' };
      return request(
        'POST',
        `https://music.163.com/weapi/search/suggest/multimatch`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    search_multimatch(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/search/hot/detail': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const search_hot_detail = (query, request) => {
      const data = {};
      return request(
        'POST',
        `https://music.163.com/weapi/hotsearchlist/get`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    search_hot_detail(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/search/hot': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const search_hot = (query, request) => {
      const data = { type: 1111 };
      return request('POST', `https://music.163.com/weapi/search/hot`, data, {
        crypto: 'weapi',
        ua: 'mobile',
        cookie: query.cookie,
        proxy: query.proxy,
        realIP: query.realIP,
      });
    };
    search_hot(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/search/default': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const search_default = (query, request) => {
      return request(
        'POST',
        `https://interface3.music.163.com/eapi/search/defaultkeyword/get`,
        {},
        {
          crypto: 'eapi',
          cookie: query.cookie,
          proxy: query.proxy,
          url: '/api/search/defaultkeyword/get',
          realIP: query.realIP,
        },
      );
    };
    search_default(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/search': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const search = (query, request) => {
      const data = {
        s: query.keywords,
        type: query.type || 1,
        limit: query.limit || 30,
        offset: query.offset || 0,
      };
      return request('POST', `https://music.163.com/weapi/search/get`, data, {
        crypto: 'weapi',
        cookie: query.cookie,
        proxy: query.proxy,
        realIP: query.realIP,
      });
    };
    search(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/scrobble': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const scrobble = (query, request) => {
      const data = {
        logs: JSON.stringify([
          {
            action: 'play',
            json: {
              download: 0,
              end: 'playend',
              id: query.id,
              sourceId: query.sourceid,
              time: query.time,
              type: 'song',
              wifi: 0,
            },
          },
        ]),
      };
      return request(
        'POST',
        `https://music.163.com/weapi/feedback/weblog`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    scrobble(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/resource/like': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const resource_like = (query, request) => {
      query.cookie.os = 'pc';
      query.t = query.t == 1 ? 'like' : 'unlike';
      query.type = { 1: 'R_MV_5_', 4: 'A_DJ_1_', 5: 'R_VI_62_', 6: 'A_EV_2_' }[
        query.type
      ];
      const data = { threadId: query.type + query.id };
      if (query.type === 'A_EV_2_') {
        data.threadId = query.threadId;
      }
      return request(
        'POST',
        `https://music.163.com/weapi/resource/${query.t}`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    resource_like(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/related/allvideo': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const related_allvideo = (query, request) => {
      const data = { id: query.id, type: /^\\d+$/.test(query.id) ? 0 : 1 };
      return request(
        'POST',
        `https://music.163.com/weapi/cloudvideo/v1/allvideo/rcmd`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    related_allvideo(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/register/cellphone': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const register_cellphone = (query, request) => {
      query.cookie.os = 'pc';
      const data = {
        captcha: query.captcha,
        phone: query.phone,
        password: crypto.createHash('md5').update(query.password).digest('hex'),
        nickname: query.nickname,
      };
      return request(
        'POST',
        `https://music.163.com/api/register/cellphone`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    register_cellphone(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/recommend/songs': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const recommend_songs = (query, request) => {
      query.cookie.os = 'ios';
      const data = {};
      return request(
        'POST',
        `https://music.163.com/api/v3/discovery/recommend/songs`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    recommend_songs(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/recommend/resource': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const recommend_resource = (query, request) => {
      return request(
        'POST',
        `https://music.163.com/weapi/v1/discovery/recommend/resource`,
        {},
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    recommend_resource(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/rebind': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const rebind = (query, request) => {
      const data = {
        captcha: query.captcha,
        phone: query.phone,
        oldcaptcha: query.oldcaptcha,
        ctcode: query.ctcode || '86',
      };
      return request(
        'POST',
        `https://music.163.com/api/user/replaceCellphone`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    rebind(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/program/recommend': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const program_recommend = (query, request) => {
      const data = {
        cateId: query.type,
        limit: query.limit || 10,
        offset: query.offset || 0,
      };
      return request(
        'POST',
        `https://music.163.com/weapi/program/recommend/v1`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    program_recommend(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/playmode/intelligence/list': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const playmode_intelligence_list = (query, request) => {
      const data = {
        songId: query.id,
        type: 'fromPlayOne',
        playlistId: query.pid,
        startMusicId: query.sid || query.id,
        count: query.count || 1,
      };
      return request(
        'POST',
        `https://music.163.com/weapi/playmode/intelligence/list`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    playmode_intelligence_list(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/playlist/video/recent': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const playlist_video_recent = (query, request) => {
      const data = {};
      return request(
        'POST',
        `https://music.163.com/api/playlist/video/recent`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    playlist_video_recent(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/playlist/update': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const playlist_update = (query, request) => {
      query.cookie.os = 'pc';
      query.desc = query.desc || '';
      query.tags = query.tags || '';
      const data = {
        '/api/playlist/desc/update': `{\"id\":${query.id},\"desc\":\"${query.desc}\"}`,
        '/api/playlist/tags/update': `{\"id\":${query.id},\"tags\":\"${query.tags}\"}`,
        '/api/playlist/update/name': `{\"id\":${query.id},\"name\":\"${query.name}\"}`,
      };
      return request('POST', `https://music.163.com/weapi/batch`, data, {
        crypto: 'weapi',
        cookie: query.cookie,
        proxy: query.proxy,
        realIP: query.realIP,
      });
    };
    playlist_update(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/playlist/tracks': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const playlist_tracks = async (query, request) => {
      query.cookie.os = 'pc';
      const tracks = query.tracks.split(',');
      const data = {
        op: query.op,
        pid: query.pid,
        trackIds: JSON.stringify(tracks),
        imme: 'true',
      };
      try {
        const res = await request(
          'POST',
          `https://music.163.com/api/playlist/manipulate/tracks`,
          data,
          {
            crypto: 'weapi',
            cookie: query.cookie,
            proxy: query.proxy,
            realIP: query.realIP,
          },
        );
        return { status: 200, body: { ...res } };
      } catch (error) {
        if (error.body.code === 512) {
          return request(
            'POST',
            `https://music.163.com/api/playlist/manipulate/tracks`,
            {
              op: query.op,
              pid: query.pid,
              trackIds: JSON.stringify([...tracks, ...tracks]),
              imme: 'true',
            },
            {
              crypto: 'weapi',
              cookie: query.cookie,
              proxy: query.proxy,
              realIP: query.realIP,
            },
          );
        }
      }
    };
    playlist_tracks(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/playlist/track/delete': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const playlist_track_delete = async (query, request) => {
      query.cookie.os = 'pc';
      query.ids = query.ids || '';
      const data = {
        id: query.id,
        tracks: JSON.stringify(
          query.ids.split(',').map((item) => {
            return { type: 3, id: item };
          }),
        ),
      };
      return request(
        'POST',
        `https://music.163.com/api/playlist/track/delete`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    playlist_track_delete(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/playlist/track/add': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const playlist_track_add = async (query, request) => {
      query.cookie.os = 'pc';
      query.ids = query.ids || '';
      const data = {
        id: query.pid,
        tracks: JSON.stringify(
          query.ids.split(',').map((item) => {
            return { type: 3, id: item };
          }),
        ),
      };
      console.log(data);
      return request(
        'POST',
        `https://music.163.com/api/playlist/track/add`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    playlist_track_add(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/playlist/tags/update': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const playlist_tags_update = (query, request) => {
      const data = { id: query.id, tags: query.tags };
      return request(
        'POST',
        `https://interface3.music.163.com/eapi/playlist/tags/update`,
        data,
        {
          crypto: 'eapi',
          cookie: query.cookie,
          proxy: query.proxy,
          url: '/api/playlist/tags/update',
          realIP: query.realIP,
        },
      );
    };
    playlist_tags_update(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/playlist/subscribers': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const playlist_subscribers = (query, request) => {
      const data = {
        id: query.id,
        limit: query.limit || 20,
        offset: query.offset || 0,
      };
      return request(
        'POST',
        `https://music.163.com/weapi/playlist/subscribers`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    playlist_subscribers(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/playlist/subscribe': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const playlist_subscribe = (query, request) => {
      query.t = query.t == 1 ? 'subscribe' : 'unsubscribe';
      const data = { id: query.id };
      return request(
        'POST',
        `https://music.163.com/weapi/playlist/${query.t}`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    playlist_subscribe(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/playlist/order/update': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const playlist_order_update = (query, request) => {
      query.cookie.os = 'pc';
      const data = { ids: query.ids };
      return request(
        'POST',
        `https://music.163.com/api/playlist/order/update`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    playlist_order_update(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/playlist/name/update': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const playlist_name_update = (query, request) => {
      const data = { id: query.id, name: query.name };
      return request(
        'POST',
        `https://interface3.music.163.com/eapi/playlist/update/name`,
        data,
        {
          crypto: 'eapi',
          cookie: query.cookie,
          proxy: query.proxy,
          url: '/api/playlist/update/name',
          realIP: query.realIP,
        },
      );
    };
    playlist_name_update(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/playlist/mylike': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const playlist_mylike = (query, request) => {
      const data = { time: query.time || '-1', limit: query.limit || '12' };
      return request(
        'POST',
        `https://music.163.com/api/mlog/playlist/mylike/bytime/get`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    playlist_mylike(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/playlist/hot': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const playlist_hot = (query, request) => {
      return request(
        'POST',
        `https://music.163.com/weapi/playlist/hottags`,
        {},
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    playlist_hot(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/playlist/highquality/tags': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const playlist_highquality_tags = (query, request) => {
      const data = {};
      return request(
        'POST',
        `https://music.163.com/api/playlist/highquality/tags`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    playlist_highquality_tags(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/playlist/detail': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const playlist_detail = (query, request) => {
      const data = { id: query.id, n: 100000, s: query.s || 8 };
      return request(
        'POST',
        `https://music.163.com/api/v6/playlist/detail`,
        data,
        {
          crypto: 'linuxapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    playlist_detail(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/playlist/desc/update': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const playlist_desc_update = (query, request) => {
      const data = { id: query.id, desc: query.desc };
      return request(
        'POST',
        `https://interface3.music.163.com/eapi/playlist/desc/update`,
        data,
        {
          crypto: 'eapi',
          cookie: query.cookie,
          proxy: query.proxy,
          url: '/api/playlist/desc/update',
          realIP: query.realIP,
        },
      );
    };
    playlist_desc_update(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/playlist/delete': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const playlist_delete = (query, request) => {
      query.cookie.os = 'pc';
      const data = { ids: '[' + query.id + ']' };
      return request(
        'POST',
        `https://music.163.com/weapi/playlist/remove`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    playlist_delete(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/playlist/create': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const playlist_create = (query, request) => {
      query.cookie.os = 'pc';
      const data = {
        name: query.name,
        privacy: query.privacy,
        type: query.type || 'NORMAL',
      };
      return request(
        'POST',
        `https://music.163.com/api/playlist/create`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    playlist_create(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/playlist/cover/update': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const playlist_cover_update = async (query, request) => {
      const uploadInfo = await uploadPlugin(query, request);
      const res = await request(
        'POST',
        `https://music.163.com/weapi/playlist/cover/update`,
        { id: query.id, coverImgId: uploadInfo.imgId },
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
      return {
        status: 200,
        body: { code: 200, data: { ...uploadInfo, ...res.body } },
      };
    };
    playlist_cover_update(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/playlist/catlist': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const playlist_catlist = (query, request) => {
      return request(
        'POST',
        `https://music.163.com/weapi/playlist/catalogue`,
        {},
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    playlist_catlist(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/personalized/privatecontent/list': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const personalized_privatecontent_list = (query, request) => {
      const data = {
        offset: query.offset || 0,
        total: 'true',
        limit: query.limit || 60,
      };
      return request(
        'POST',
        `https://music.163.com/api/v2/privatecontent/list`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    personalized_privatecontent_list(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/personalized/privatecontent': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const personalized_privatecontent = (query, request) => {
      return request(
        'POST',
        `https://music.163.com/weapi/personalized/privatecontent`,
        {},
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    personalized_privatecontent(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/personalized/newsong': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const personalized_newsong = (query, request) => {
      const data = {
        type: 'recommend',
        limit: query.limit || 10,
        areaId: query.areaId || 0,
      };
      return request(
        'POST',
        `https://music.163.com/weapi/personalized/newsong`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    personalized_newsong(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/personalized/mv': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const personalized_mv = (query, request) => {
      return request(
        'POST',
        `https://music.163.com/weapi/personalized/mv`,
        {},
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    personalized_mv(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/personalized/djprogram': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const personalized_djprogram = (query, request) => {
      return request(
        'POST',
        `https://music.163.com/weapi/personalized/djprogram`,
        {},
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    personalized_djprogram(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/personalized': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const personalized = (query, request) => {
      const data = { limit: query.limit || 30, total: true, n: 1000 };
      return request(
        'POST',
        `https://music.163.com/weapi/personalized/playlist`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    personalized(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/personal_fm': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const personal_fm = (query, request) => {
      return request(
        'POST',
        `https://music.163.com/weapi/v1/radio/get`,
        {},
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    personal_fm(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/mv/url': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const mv_url = (query, request) => {
      const data = { id: query.id, r: query.r || 1080 };
      return request(
        'POST',
        `https://music.163.com/weapi/song/enhance/play/mv/url`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    mv_url(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/mv/sublist': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const mv_sublist = (query, request) => {
      const data = {
        limit: query.limit || 25,
        offset: query.offset || 0,
        total: true,
      };
      return request(
        'POST',
        `https://music.163.com/weapi/cloudvideo/allvideo/sublist`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    mv_sublist(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/mv/sub': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const mv_sub = (query, request) => {
      query.t = query.t == 1 ? 'sub' : 'unsub';
      const data = { mvId: query.mvid, mvIds: '["' + query.mvid + '"]' };
      return request(
        'POST',
        `https://music.163.com/weapi/mv/${query.t}`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    mv_sub(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/mv/first': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const mv_first = (query, request) => {
      const data = {
        area: query.area || '',
        limit: query.limit || 30,
        total: true,
      };
      return request(
        'POST',
        `https://interface.music.163.com/weapi/mv/first`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    mv_first(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/mv/exclusive/rcmd': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const mv_exclusive_rcmd = (query, request) => {
      const data = { offset: query.offset || 0, limit: query.limit || 30 };
      return request(
        'POST',
        `https://interface.music.163.com/api/mv/exclusive/rcmd`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    mv_exclusive_rcmd(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/mv/detail/info': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const mv_detail_info = (query, request) => {
      const data = { threadid: `R_MV_5_${query.mvid}`, composeliked: true };
      return request(
        'POST',
        `https://music.163.com/api/comment/commentthread/info`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    mv_detail_info(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/mv/detail': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const mv_detail = (query, request) => {
      const data = { id: query.mvid };
      return request('POST', `https://music.163.com/api/v1/mv/detail`, data, {
        crypto: 'weapi',
        cookie: query.cookie,
        proxy: query.proxy,
        realIP: query.realIP,
      });
    };
    mv_detail(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/mv/all': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const mv_all = (query, request) => {
      const data = {
        tags: JSON.stringify({
          地区: query.area || '全部',
          类型: query.type || '全部',
          排序: query.order || '上升最快',
        }),
        offset: query.offset || 0,
        total: 'true',
        limit: query.limit || 30,
      };
      return request(
        'POST',
        `https://interface.music.163.com/api/mv/all`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    mv_all(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/msg/private/history': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const msg_private_history = (query, request) => {
      const data = {
        userId: query.uid,
        limit: query.limit || 30,
        time: query.before || 0,
        total: 'true',
      };
      return request(
        'POST',
        `https://music.163.com/api/msg/private/history`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    msg_private_history(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/msg/private': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const msg_private = (query, request) => {
      const data = {
        offset: query.offset || 0,
        limit: query.limit || 30,
        total: 'true',
      };
      return request(
        'POST',
        `https://music.163.com/api/msg/private/users`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    msg_private(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/msg/notices': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const msg_notices = (query, request) => {
      const data = { limit: query.limit || 30, time: query.lasttime || -1 };
      return request('POST', `https://music.163.com/api/msg/notices`, data, {
        crypto: 'weapi',
        cookie: query.cookie,
        proxy: query.proxy,
        realIP: query.realIP,
      });
    };
    msg_notices(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/msg/forwards': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const msg_forwards = (query, request) => {
      const data = {
        offset: query.offset || 0,
        limit: query.limit || 30,
        total: 'true',
      };
      return request('POST', `https://music.163.com/api/forwards/get`, data, {
        crypto: 'weapi',
        cookie: query.cookie,
        proxy: query.proxy,
        realIP: query.realIP,
      });
    };
    msg_forwards(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/msg/comments': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const msg_comments = (query, request) => {
      const data = {
        beforeTime: query.before || '-1',
        limit: query.limit || 30,
        total: 'true',
        uid: query.uid,
      };
      return request(
        'POST',
        `https://music.163.com/api/v1/user/comments/${query.uid}`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    msg_comments(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/lyric': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const lyric = (query, request) => {
      query.cookie.os = 'pc';
      const data = { id: query.id, lv: -1, kv: -1, tv: -1 };
      return request('POST', `https://music.163.com/api/song/lyric`, data, {
        crypto: 'linuxapi',
        cookie: query.cookie,
        proxy: query.proxy,
        realIP: query.realIP,
      });
    };
    lyric(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/logout': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const logout = (query, request) => {
      return request(
        'POST',
        `https://music.163.com/weapi/logout`,
        {},
        {
          crypto: 'weapi',
          ua: 'pc',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    logout(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/login/status': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const login_status = (query, request) => {
      return request(
        'GET',
        `https://music.163.com`,
        {},
        { cookie: query.cookie, proxy: query.proxy, realIP: query.realIP },
      ).then((response) => {
        try {
          let profile = eval(
            `(${/GUser\\s*=\\s*([^;]+);/.exec(response.body)[1]})`,
          );
          let bindings = eval(
            `(${/GBinds\\s*=\\s*([^;]+);/.exec(response.body)[1]})`,
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
    login_status(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/login/refresh': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const login_refresh = (query, request) => {
      return request(
        'POST',
        `https://music.163.com/weapi/login/token/refresh`,
        {},
        {
          crypto: 'weapi',
          ua: 'pc',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    login_refresh(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/login/cellphone': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const login_cellphone = async (query, request) => {
      query.cookie.os = 'pc';
      const data = {
        phone: query.phone,
        countrycode: query.countrycode || '86',
        password:
          query.md5_password ||
          crypto.createHash('md5').update(query.password).digest('hex'),
        rememberLogin: 'true',
      };
      let result = await request(
        'POST',
        `https://music.163.com/weapi/login/cellphone`,
        data,
        {
          crypto: 'weapi',
          ua: 'pc',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
      if (result.body.code === 200) {
        result = {
          status: 200,
          body: { ...result.body, cookie: result.cookie.join(';') },
          cookie: result.cookie,
        };
      }
      return result;
    };
    login_cellphone(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/login': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const login = async (query, request) => {
      query.cookie.os = 'pc';
      const data = {
        username: query.email,
        password:
          query.md5_password ||
          crypto.createHash('md5').update(query.password).digest('hex'),
        rememberLogin: 'true',
      };
      let result = await request(
        'POST',
        `https://music.163.com/weapi/login`,
        data,
        {
          crypto: 'weapi',
          ua: 'pc',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
      if (result.body.code === 502) {
        return {
          status: 200,
          body: { msg: '账号或密码错误', code: 502, message: '账号或密码错误' },
        };
      }
      if (result.body.code === 200) {
        result = {
          status: 200,
          body: { ...result.body, cookie: result.cookie.join(';') },
          cookie: result.cookie,
        };
      }
      return result;
    };
    login(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/likelist': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const likelist = (query, request) => {
      const data = { uid: query.uid };
      return request(
        'POST',
        `https://music.163.com/weapi/song/like/get`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    likelist(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/like': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const like = (query, request) => {
      query.cookie.os = 'pc'
      query.cookie.appver = '2.7.1.198277'
      query.like = query.like == 'false' ? false : true
      const data = {
        alg: 'itembased',
        trackId: query.id,
        like: query.like,
        time: '3',
      }
      return request('POST', `https://music.163.com/api/radio/like`, data, {
        crypto: 'weapi',
        cookie: query.cookie,
        proxy: query.proxy,
        realIP: query.realIP,
      })
    }

    like(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/hot/topic': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const hot_topic = (query, request) => {
      const data = { limit: query.limit || 20, offset: query.offset || 0 };
      return request('POST', `https://music.163.com/weapi/act/hot`, data, {
        crypto: 'weapi',
        cookie: query.cookie,
        proxy: query.proxy,
        realIP: query.realIP,
      });
    };
    hot_topic(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/homepage/dragon/ball': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const homepage_dragon_ball = (query, request) => {
      const data = {};
      return request(
        'POST',
        `https://music.163.com/eapi/homepage/dragon/ball/static`,
        data,
        {
          crypto: 'eapi',
          cookie: query.cookie,
          proxy: query.proxy,
          url: '/api/homepage/dragon/ball/static',
          realIP: query.realIP,
        },
      );
    };
    homepage_dragon_ball(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/homepage/block/page': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const homepage_block_page = (query, request) => {
      const data = { refresh: query.refresh || true };
      return request(
        'POST',
        `https://music.163.com/api/homepage/block/page`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    homepage_block_page(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/history/recommend/songs/detail': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const history_recommend_songs_detail = (query, request) => {
      query.cookie.os = 'ios';
      const data = { date: query.date || '' };
      return request(
        'POST',
        `https://music.163.com/api/discovery/recommend/songs/history/detail`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    history_recommend_songs_detail(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/history/recommend/songs': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const history_recommend_songs = (query, request) => {
      query.cookie.os = 'ios';
      const data = {};
      return request(
        'POST',
        `https://music.163.com/api/discovery/recommend/songs/history/recent`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    history_recommend_songs(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/follow': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const follow = (query, request) => {
      query.cookie.os = 'pc';
      query.t = query.t == 1 ? 'follow' : 'delfollow';
      return request(
        'POST',
        `https://music.163.com/weapi/user/${query.t}/${query.id}`,
        {},
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    follow(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/fm_trash': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const fm_trash = (query, request) => {
      const data = { songId: query.id };
      return request(
        'POST',
        `https://music.163.com/weapi/radio/trash/add?alg=RT&songId=${
          query.id
        }&time=${query.time || 25}`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    fm_trash(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/event/forward': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const event_forward = (query, request) => {
      query.cookie.os = 'pc';
      const data = {
        forwards: query.forwards,
        id: query.evId,
        eventUserId: query.uid,
      };
      return request(
        'POST',
        `https://music.163.com/weapi/event/forward`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    event_forward(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/event/del': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const event_del = (query, request) => {
      const data = { id: query.evId };
      return request('POST', `https://music.163.com/eapi/event/delete`, data, {
        crypto: 'weapi',
        cookie: query.cookie,
        proxy: query.proxy,
        realIP: query.realIP,
      });
    };
    event_del(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/event': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const event = (query, request) => {
      const data = {
        pagesize: query.pagesize || 20,
        lasttime: query.lasttime || -1,
      };
      return request('POST', `https://music.163.com/weapi/v1/event/get`, data, {
        crypto: 'weapi',
        cookie: query.cookie,
        proxy: query.proxy,
        realIP: query.realIP,
      });
    };
    event(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/dj/toplist/popular': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const dj_toplist_popular = (query, request) => {
      const data = { limit: query.limit || 100 };
      return request(
        'POST',
        `https://music.163.com/api/dj/toplist/popular`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    dj_toplist_popular(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/dj/toplist/pay': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const dj_toplist_pay = (query, request) => {
      const data = { limit: query.limit || 100 };
      return request(
        'POST',
        `https://music.163.com/api/djradio/toplist/pay`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    dj_toplist_pay(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/dj/toplist/newcomer': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const dj_toplist_newcomer = (query, request) => {
      const data = { limit: query.limit || 100, offset: query.offset || 0 };
      return request(
        'POST',
        `https://music.163.com/api/dj/toplist/newcomer`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    dj_toplist_newcomer(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/dj/toplist/hours': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const dj_toplist_hours = (query, request) => {
      const data = { limit: query.limit || 100 };
      return request(
        'POST',
        `https://music.163.com/api/dj/toplist/hours`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    dj_toplist_hours(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/dj/toplist': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const dj_toplist = (query, request) => {
      const data = {
        limit: query.limit || 100,
        offset: query.offset || 0,
        type: typeMap[query.type || 'new'] || '0',
      };
      return request(
        'POST',
        `https://music.163.com/api/djradio/toplist`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    dj_toplist(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/dj/today/perfered': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const dj_today_perfered = (query, request) => {
      const data = { page: query.page || 0 };
      return request(
        'POST',
        `https://music.163.com/weapi/djradio/home/today/perfered`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    dj_today_perfered(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/dj/subscriber': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const dj_subscriber = (query, request) => {
      const data = {
        time: query.time || '-1',
        id: query.id,
        limit: query.limit || '20',
        total: 'true',
      };
      return request(
        'POST',
        `https://music.163.com/api/djradio/subscriber`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    dj_subscriber(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/dj/sublist': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const dj_sublist = (query, request) => {
      const data = {
        limit: query.limit || 30,
        offset: query.offset || 0,
        total: true,
      };
      return request(
        'POST',
        `https://music.163.com/weapi/djradio/get/subed`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    dj_sublist(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/dj/sub': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const dj_sub = (query, request) => {
      query.t = query.t == 1 ? 'sub' : 'unsub';
      const data = { id: query.rid };
      return request(
        'POST',
        `https://music.163.com/weapi/djradio/${query.t}`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    dj_sub(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/dj/recommend/type': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const dj_recommend_type = (query, request) => {
      const data = { cateId: query.type };
      return request(
        'POST',
        `https://music.163.com/weapi/djradio/recommend`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    dj_recommend_type(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/dj/recommend': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const dj_recommend = (query, request) => {
      return request(
        'POST',
        `https://music.163.com/weapi/djradio/recommend/v1`,
        {},
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    dj_recommend(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/dj/radio/hot': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const dj_radio_hot = (query, request) => {
      const data = {
        cateId: query.cateId,
        limit: query.limit || 30,
        offset: query.offset || 0,
      };
      return request('POST', `https://music.163.com/api/djradio/hot`, data, {
        crypto: 'weapi',
        cookie: query.cookie,
        proxy: query.proxy,
        realIP: query.realIP,
      });
    };
    dj_radio_hot(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/dj/program/toplist/hours': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const dj_program_toplist_hours = (query, request) => {
      const data = { limit: query.limit || 100 };
      return request(
        'POST',
        `https://music.163.com/api/djprogram/toplist/hours`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    dj_program_toplist_hours(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/dj/program/toplist': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const dj_program_toplist = (query, request) => {
      const data = { limit: query.limit || 100, offset: query.offset || 0 };
      return request(
        'POST',
        `https://music.163.com/api/program/toplist/v1`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    dj_program_toplist(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/dj/program/detail': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const dj_program_detail = (query, request) => {
      const data = { id: query.id };
      return request(
        'POST',
        `https://music.163.com/api/dj/program/detail`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    dj_program_detail(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/dj/program': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const dj_program = (query, request) => {
      const data = {
        radioId: query.rid,
        limit: query.limit || 30,
        offset: query.offset || 0,
        asc: toBoolean(query.asc),
      };
      return request(
        'POST',
        `https://music.163.com/weapi/dj/program/byradio`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    dj_program(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/dj/personalize/recommend': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const dj_personalize_recommend = (query, request) => {
      return request(
        'POST',
        `https://music.163.com/api/djradio/personalize/rcmd`,
        { limit: query.limit || 6 },
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    dj_personalize_recommend(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/dj/paygift': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const dj_paygift = (query, request) => {
      const data = { limit: query.limit || 30, offset: query.offset || 0 };
      return request(
        'POST',
        `https://music.163.com/weapi/djradio/home/paygift/list?_nmclfl=1`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    dj_paygift(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/dj/hot': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const dj_hot = (query, request) => {
      const data = { limit: query.limit || 30, offset: query.offset || 0 };
      return request(
        'POST',
        `https://music.163.com/weapi/djradio/hot/v1`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    dj_hot(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/dj/detail': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const dj_detail = (query, request) => {
      const data = { id: query.rid };
      return request('POST', `https://music.163.com/api/djradio/v2/get`, data, {
        crypto: 'weapi',
        cookie: query.cookie,
        proxy: query.proxy,
        realIP: query.realIP,
      });
    };
    dj_detail(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/dj/catelist': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const dj_catelist = (query, request) => {
      return request(
        'POST',
        `https://music.163.com/weapi/djradio/category/get`,
        {},
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    dj_catelist(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/dj/category/recommend': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const dj_category_recommend = (query, request) => {
      return request(
        'POST',
        `https://music.163.com/weapi/djradio/home/category/recommend`,
        {},
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    dj_category_recommend(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/dj/category/excludehot': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const dj_category_excludehot = (query, request) => {
      return request(
        'POST',
        `https://music.163.com/weapi/djradio/category/excludehot`,
        {},
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    dj_category_excludehot(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/dj/banner': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const dj_banner = (query, request) => {
      const data = {};
      query.cookie.os = 'pc';
      return request(
        'POST',
        `https://music.163.com/weapi/djradio/banner/get`,
        {},
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    dj_banner(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/digitalAlbum/purchased': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const digitalAlbum_purchased = (query, request) => {
      const data = {
        limit: query.limit || 30,
        offset: query.offset || 0,
        total: true,
      };
      return request(
        'POST',
        `https://music.163.com/api/digitalAlbum/purchased`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    digitalAlbum_purchased(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/digitalAlbum/ordering': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const digitalAlbum_ordering = (query, request) => {
      const data = {
        business: 'Album',
        paymentMethod: query.payment,
        digitalResources: JSON.stringify([
          { business: 'Album', resourceID: query.id, quantity: query.quantity },
        ]),
        from: 'web',
      };
      return request(
        'POST',
        `https://music.163.com/api/ordering/web/digital`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    digitalAlbum_ordering(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/daily_signin': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const daily_signin = (query, request) => {
      const data = { type: query.type || 0 };
      return request(
        'POST',
        `https://music.163.com/weapi/point/dailyTask`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    daily_signin(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/countries/code/list': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const countries_code_list = (query, request) => {
      const data = {};
      return request(
        'POST',
        `https://interface3.music.163.com/eapi/lbs/countries/v1`,
        data,
        {
          crypto: 'eapi',
          cookie: query.cookie,
          proxy: query.proxy,
          url: '/api/lbs/countries/v1',
          realIP: query.realIP,
        },
      );
    };
    countries_code_list(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/comment/video': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const comment_video = (query, request) => {
      query.cookie.os = 'pc';
      const data = {
        rid: query.id,
        limit: query.limit || 20,
        offset: query.offset || 0,
        beforeTime: query.before || 0,
      };
      return request(
        'POST',
        `https://music.163.com/weapi/v1/resource/comments/R_VI_62_${query.id}`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    comment_video(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/comment/playlist': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const comment_playlist = (query, request) => {
      query.cookie.os = 'pc';
      const data = {
        rid: query.id,
        limit: query.limit || 20,
        offset: query.offset || 0,
        beforeTime: query.before || 0,
      };
      return request(
        'POST',
        `https://music.163.com/weapi/v1/resource/comments/A_PL_0_${query.id}`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    comment_playlist(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/comment/new': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const comment_new = (query, request) => {
      query.cookie.os = 'pc';
      query.type = {
        0: 'R_SO_4_',
        1: 'R_MV_5_',
        2: 'A_PL_0_',
        3: 'R_AL_3_',
        4: 'A_DJ_1_',
        5: 'R_VI_62_',
        6: 'A_EV_2_',
      }[query.type];
      const threadId = query.type + query.id;
      const pageSize = query.pageSize || 20;
      const pageNo = query.pageNo || 1;
      const data = {
        threadId: threadId,
        pageNo,
        showInner: query.showInner || true,
        pageSize,
        cursor:
          +query.sortType === 3 ? query.cursor || '0' : (pageNo - 1) * pageSize,
        sortType: query.sortType || 1,
      };
      return request(
        'POST',
        `https://music.163.com/api/v2/resource/comments`,
        data,
        {
          crypto: 'eapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
          url: '/api/v2/resource/comments',
        },
      );
    };
    comment_new(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/comment/mv': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const comment_mv = (query, request) => {
      query.cookie.os = 'pc';
      const data = {
        rid: query.id,
        limit: query.limit || 20,
        offset: query.offset || 0,
        beforeTime: query.before || 0,
      };
      return request(
        'POST',
        `https://music.163.com/weapi/v1/resource/comments/R_MV_5_${query.id}`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    comment_mv(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/comment/music': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const comment_music = (query, request) => {
      query.cookie.os = 'pc';
      const data = {
        rid: query.id,
        limit: query.limit || 20,
        offset: query.offset || 0,
        beforeTime: query.before || 0,
      };
      return request(
        'POST',
        `https://music.163.com/api/v1/resource/comments/R_SO_4_${query.id}`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    comment_music(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/comment/like': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const comment_like = (query, request) => {
      query.cookie.os = 'pc';
      query.t = query.t == 1 ? 'like' : 'unlike';
      query.type = {
        0: 'R_SO_4_',
        1: 'R_MV_5_',
        2: 'A_PL_0_',
        3: 'R_AL_3_',
        4: 'A_DJ_1_',
        5: 'R_VI_62_',
        6: 'A_EV_2_',
      }[query.type];
      const data = { threadId: query.type + query.id, commentId: query.cid };
      if (query.type == 'A_EV_2_') {
        data.threadId = query.threadId;
      }
      return request(
        'POST',
        `https://music.163.com/weapi/v1/comment/${query.t}`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    comment_like(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/comment/hotwall/list': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const comment_hotwall_list = (query, request) => {
      const data = {};
      return request(
        'POST',
        `https://music.163.com/api/comment/hotwall/list/get`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    comment_hotwall_list(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/comment/hot': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const comment_hot = (query, request) => {
      query.cookie.os = 'pc';
      query.type = {
        0: 'R_SO_4_',
        1: 'R_MV_5_',
        2: 'A_PL_0_',
        3: 'R_AL_3_',
        4: 'A_DJ_1_',
        5: 'R_VI_62_',
      }[query.type];
      const data = {
        rid: query.id,
        limit: query.limit || 20,
        offset: query.offset || 0,
        beforeTime: query.before || 0,
      };
      return request(
        'POST',
        `https://music.163.com/weapi/v1/resource/hotcomments/${query.type}${query.id}`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    comment_hot(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/comment/floor': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const comment_floor = (query, request) => {
      query.type = {
        0: 'R_SO_4_',
        1: 'R_MV_5_',
        2: 'A_PL_0_',
        3: 'R_AL_3_',
        4: 'A_DJ_1_',
        5: 'R_VI_62_',
      }[query.type];
      const data = {
        parentCommentId: query.parentCommentId,
        threadId: query.type + query.id,
        time: query.time || -1,
        limit: query.limit || 20,
      };
      return request(
        'POST',
        `https://music.163.com/api/resource/comment/floor/get`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    comment_floor(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/comment/event': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const comment_event = (query, request) => {
      const data = {
        limit: query.limit || 20,
        offset: query.offset || 0,
        beforeTime: query.before || 0,
      };
      return request(
        'POST',
        `https://music.163.com/weapi/v1/resource/comments/${query.threadId}`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    comment_event(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/comment/dj': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const comment_dj = (query, request) => {
      query.cookie.os = 'pc';
      const data = {
        rid: query.id,
        limit: query.limit || 20,
        offset: query.offset || 0,
        beforeTime: query.before || 0,
      };
      return request(
        'POST',
        `https://music.163.com/weapi/v1/resource/comments/A_DJ_1_${query.id}`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    comment_dj(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/comment/album': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const comment_album = (query, request) => {
      query.cookie.os = 'pc';
      const data = {
        rid: query.id,
        limit: query.limit || 20,
        offset: query.offset || 0,
        beforeTime: query.before || 0,
      };
      return request(
        'POST',
        `https://music.163.com/weapi/v1/resource/comments/R_AL_3_${query.id}`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    comment_album(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/comment': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const comment = (query, request) => {
      query.cookie.os = 'pc';
      query.t = { 1: 'add', 0: 'delete', 2: 'reply' }[query.t];
      query.type = {
        0: 'R_SO_4_',
        1: 'R_MV_5_',
        2: 'A_PL_0_',
        3: 'R_AL_3_',
        4: 'A_DJ_1_',
        5: 'R_VI_62_',
        6: 'A_EV_2_',
      }[query.type];
      const data = { threadId: query.type + query.id };
      if (query.type == 'A_EV_2_') {
        data.threadId = query.threadId;
      }
      if (query.t == 'add') data.content = query.content;
      else if (query.t == 'delete') data.commentId = query.commentId;
      else if (query.t == 'reply') {
        data.commentId = query.commentId;
        data.content = query.content;
      }
      return request(
        'POST',
        `https://music.163.com/weapi/resource/comments/${query.t}`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    comment(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/cloudsearch': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const cloudsearch = (query, request) => {
      const data = {
        s: query.keywords,
        type: query.type || 1,
        limit: query.limit || 30,
        offset: query.offset || 0,
      };
      return request(
        'POST',
        `https://music.163.com/weapi/cloudsearch/get/web`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    cloudsearch(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/check/music': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const check_music = (query, request) => {
      const data = {
        ids: '[' + parseInt(query.id) + ']',
        br: parseInt(query.br || 999000),
      };
      return request(
        'POST',
        `https://music.163.com/weapi/song/enhance/player/url`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      ).then((response) => {
        let playable = false;
        if (response.body.code == 200) {
          if (response.body.data[0].code == 200) {
            playable = true;
          }
        }
        if (playable) {
          response.body = { success: true, message: 'ok' };
          return response;
        } else {
          response.status = 404;
          response.body = { success: false, message: '亲爱的,暂无版权' };
          return Promise.reject(response);
        }
      });
    };
    check_music(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/cellphone/existence/check': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const cellphone_existence_check = (query, request) => {
      const data = { cellphone: query.phone, countrycode: query.countrycode };
      return request(
        'POST',
        `https://music.163.com/eapi/cellphone/existence/check`,
        data,
        {
          crypto: 'eapi',
          cookie: query.cookie,
          proxy: query.proxy,
          url: '/api/cellphone/existence/check',
          realIP: query.realIP,
        },
      );
    };
    cellphone_existence_check(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/captcha/verify': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const captcha_verify = (query, request) => {
      const data = {
        ctcode: query.ctcode || '86',
        cellphone: query.phone,
        captcha: query.captcha,
      };
      return request(
        'POST',
        `https://music.163.com/weapi/sms/captcha/verify`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    captcha_verify(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/captcha/sent': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const captcha_sent = (query, request) => {
      const data = { ctcode: query.ctcode || '86', cellphone: query.phone };
      return request(
        'POST',
        `https://music.163.com/weapi/sms/captcha/sent`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    captcha_sent(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/calendar': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const calendar = (query, request) => {
      const data = {
        startTime: query.startTime || Date.now(),
        endTime: query.endTime || Date.now(),
      };
      return request(
        'POST',
        `https://music.163.com/api/mcalendar/detail`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    calendar(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/banner': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const banner = (query, request) => {
      const type =
        { 0: 'pc', 1: 'android', 2: 'iphone', 3: 'ipad' }[query.type || 0] ||
        'pc';
      return request(
        'POST',
        `https://music.163.com/api/v2/banner/get`,
        { clientType: type },
        { crypto: 'linuxapi', proxy: query.proxy, realIP: query.realIP },
      );
    };
    banner(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/avatar/upload': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const avatar_upload = async (query, request) => {
      const uploadInfo = await uploadPlugin(query, request);
      const res = await request(
        'POST',
        `https://music.163.com/weapi/user/avatar/upload/v1`,
        { imgid: uploadInfo.imgId },
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
      return {
        status: 200,
        body: { code: 200, data: { ...uploadInfo, ...res.body } },
      };
    };
    avatar_upload(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/audio/match': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const audio_match = (query, request) => {
      query.cookie.os = 'pc';
      const data = {
        algorithmCode: 'shazam_v2',
        times: 1,
        sessionId: 'C999431ACDC84EDBB984763654E6F8D7',
        duration: 3.3066249999999995,
        from: 'recognize-song',
        rawdata: realData,
      };
      return request(
        'POST',
        `https://music.163.com/api/music/audio/match`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    audio_match(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/artists': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const artists = (query, request) => {
      return request(
        'POST',
        `https://music.163.com/weapi/v1/artist/${query.id}`,
        {},
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    artists(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/artist/top/song': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const artist_top_song = (query, request) => {
      const data = { id: query.id };
      return request(
        'POST',
        `https://music.163.com/api/artist/top/song`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    artist_top_song(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/artist/sublist': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const artist_sublist = (query, request) => {
      const data = {
        limit: query.limit || 25,
        offset: query.offset || 0,
        total: true,
      };
      return request(
        'POST',
        `https://music.163.com/weapi/artist/sublist`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    artist_sublist(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/artist/sub': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const artist_sub = (query, request) => {
      query.t = query.t == 1 ? 'sub' : 'unsub';
      const data = { artistId: query.id, artistIds: '[' + query.id + ']' };
      return request(
        'POST',
        `https://music.163.com/weapi/artist/${query.t}`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    artist_sub(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/artist/songs': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const artist_songs = (query, request) => {
      query.cookie.os = 'pc';
      const data = {
        id: query.id,
        private_cloud: 'true',
        work_type: 1,
        order: query.order || 'hot',
        offset: query.offset || 0,
        limit: query.limit || 100,
      };
      return request(
        'POST',
        `https://music.163.com/api/v1/artist/songs`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    artist_songs(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/artist/mv': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const artist_mv = (query, request) => {
      const data = {
        artistId: query.id,
        limit: query.limit,
        offset: query.offset,
        total: true,
      };
      return request('POST', `https://music.163.com/weapi/artist/mvs`, data, {
        crypto: 'weapi',
        cookie: query.cookie,
        proxy: query.proxy,
        realIP: query.realIP,
      });
    };
    artist_mv(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/artist/list': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const artist_list = (query, request) => {
      const data = {
        initial: isNaN(query.initial)
          ? (query.initial || '').toUpperCase().charCodeAt() || undefined
          : query.initial,
        offset: query.offset || 0,
        limit: query.limit || 30,
        total: true,
        type: query.type || '1',
        area: query.area,
      };
      return request('POST', `https://music.163.com/api/v1/artist/list`, data, {
        crypto: 'weapi',
        cookie: query.cookie,
        proxy: query.proxy,
        realIP: query.realIP,
      });
    };
    artist_list(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/artist/desc': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const artist_desc = (query, request) => {
      const data = { id: query.id };
      return request(
        'POST',
        `https://music.163.com/weapi/artist/introduction`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    artist_desc(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/artist/album': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const artist_album = (query, request) => {
      const data = {
        limit: query.limit || 30,
        offset: query.offset || 0,
        total: true,
      };
      return request(
        'POST',
        `https://music.163.com/weapi/artist/albums/${query.id}`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    artist_album(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/album/sublist': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const album_sublist = (query, request) => {
      const data = {
        limit: query.limit || 25,
        offset: query.offset || 0,
        total: true,
      };
      return request(
        'POST',
        `https://music.163.com/weapi/album/sublist`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    album_sublist(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/album/sub': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const album_sub = (query, request) => {
      query.t = query.t == 1 ? 'sub' : 'unsub';
      const data = { id: query.id };
      return request(
        'POST',
        `https://music.163.com/api/album/${query.t}`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    album_sub(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/album/songsaleboard': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const album_songsaleboard = (query, request) => {
      let data = { albumType: query.albumType || 0 };
      const type = query.type || 'daily';
      if (type === 'year') {
        data = { ...data, year: query.year };
      }
      return request(
        'POST',
        `https://music.163.com/api/feealbum/songsaleboard/${type}/type`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    album_songsaleboard(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/album/newest': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const album_newest = (query, request) => {
      return request(
        'POST',
        `https://music.163.com/api/discovery/newAlbum`,
        {},
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    album_newest(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/album/new': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const album_new = (query, request) => {
      const data = {
        limit: query.limit || 30,
        offset: query.offset || 0,
        total: true,
        area: query.area || 'ALL',
      };
      return request('POST', `https://music.163.com/weapi/album/new`, data, {
        crypto: 'weapi',
        cookie: query.cookie,
        proxy: query.proxy,
        realIP: query.realIP,
      });
    };
    album_new(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/album/list/style': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const album_list_style = (query, request) => {
      const data = {
        limit: query.limit || 10,
        offset: query.offset || 0,
        total: true,
        area: query.area || 'Z_H',
      };
      return request(
        'POST',
        `https://music.163.com/weapi/vipmall/appalbum/album/style`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    album_list_style(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/album/list': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const album_list = (query, request) => {
      const data = {
        limit: query.limit || 30,
        offset: query.offset || 0,
        total: true,
        area: query.area || 'ALL',
        type: query.type,
      };
      return request(
        'POST',
        `https://music.163.com/weapi/vipmall/albumproduct/list`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    album_list(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/album/detail/dynamic': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const album_detail_dynamic = (query, request) => {
      const data = { id: query.id };
      return request(
        'POST',
        `https://music.163.com/api/album/detail/dynamic`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    album_detail_dynamic(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/album/detail': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const album_detail = (query, request) => {
      const data = { id: query.id };
      return request(
        'POST',
        `https://music.163.com/weapi/vipmall/albumproduct/detail`,
        data,
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    album_detail(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/album': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const album = (query, request) => {
      return request(
        'POST',
        `https://music.163.com/weapi/v1/album/${query.id}`,
        {},
        {
          crypto: 'weapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      );
    };
    album(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/activate/init/profile': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const activate_init_profile = (query, request) => {
      const data = { nickname: query.nickname };
      return request(
        'POST',
        `https://music.163.com/eapi/activate/initProfile`,
        data,
        {
          crypto: 'eapi',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
          url: '/api/activate/initProfile',
        },
      );
    };
    activate_init_profile(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
  '/related/playlist': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const related_playlist = (query, request) => {
      return request(
        'GET',
        `https://music.163.com/playlist?id=${query.id}`,
        {},
        {
          ua: 'pc',
          cookie: query.cookie,
          proxy: query.proxy,
          realIP: query.realIP,
        },
      ).then((response) => {
        try {
          const pattern = /<div class="cver u-cover u-cover-3">[\s\S]*?<img src="([^"]+)">[\s\S]*?<a class="sname f-fs1 s-fc0" href="([^"]+)"[^>]*>([^<]+?)<\/a>[\s\S]*?<a class="nm nm f-thide s-fc3" href="([^"]+)"[^>]*>([^<]+?)<\/a>/g;
          let result,
            playlists = [];
          while ((result = pattern.exec(response.body)) != null) {
            playlists.push({
              creator: {
                userId: result[4].slice('/user/home?id='.length),
                nickname: result[5],
              },
              coverImgUrl: result[1].slice(0, -'?param=50y50'.length),
              name: result[3],
              id: result[2].slice('/playlist?id='.length),
            });
          }
          response.body = { code: 200, playlists: playlists };
          return response;
        } catch (err) {
          response.status = 500;
          response.body = { code: 500, msg: err.stack };
          return Promise.reject(response);
        }
      });
    };
    related_playlist(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },

  '/batch': (req, res) => {
    if (typeof req.query.cookie === 'string') {
      req.query.cookie = cookieToJson(req.query.cookie);
    }
    let query = Object.assign(
      {},
      { cookie: req.cookies },
      req.query,
      req.body,
      req.files,
    );
    const batch = (query, request) => {
      const data = {
        e_r: true,
      };
      Object.keys(query).forEach((i) => {
        if (/^\/api\//.test(i)) {
          data[i] = query[i];
        }
      });
      return request('POST', `https://music.163.com/eapi/batch`, data, {
        crypto: 'eapi',
        proxy: query.proxy,
        url: '/api/batch',
        cookie: query.cookie,
        realIP: query.realIP,
      });
    };
    batch(query, request)
      .then((answer) => {
        console.log('[OK]', decodeURIComponent(req.originalUrl));
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      })
      .catch((answer) => {
        console.log('[ERR]', decodeURIComponent(req.originalUrl), {
          status: answer.status,
          body: answer.body,
        });
        if (answer.body.code == '301') answer.body.msg = '需要登录';
        res.append('Set-Cookie', answer.cookie);
        res.status(answer.status).send(answer.body);
      });
  },
};
