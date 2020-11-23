const fs = require('fs');
const path = require('path');
const express = require('express');
const request = require('./util/request');
const strip = require('strip-comments');
var router = express.Router();
const special = {
  'daily_signin.js': '/daily_signin',
  'fm_trash.js': '/fm_trash',
  'personal_fm.js': '/personal_fm',
};

const app = express();
const temp = {};

fs.readdirSync(path.join(__dirname, 'module'))
  .reverse()
  .forEach((file) => {
    if (!file.endsWith('.js')) return;
    let route =
      file in special
        ? special[file]
        : '/' + file.replace(/\.js$/i, '').replace(/_/g, '/');
    let question = require(path.join(__dirname, 'module', file));
    // console.log(question.toString())
    const func = `(req, res) => {
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
      const ${file.replace(/\.js$/i, '')} = ${strip(question.toString())};
      ${file.replace(/\.js$/i, '')}(query, request)
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
        })
    }`;
    temp[route] = func;
  });

fs.writeFileSync(
  path.resolve(__dirname, './test_result.json'),
  JSON.stringify(temp),
);
