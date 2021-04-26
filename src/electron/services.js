const express = require('express');
const bodyParser = require('body-parser');
const cache = require('../../netease_api/util/apicache').middleware;
const fileUpload = require('express-fileupload');
import routes from '../../netease_api/routes';

export function startNeteaseMusicApi() {
  // Integrate API
  const app = express();

  // CORS & Preflight request
  app.use((req, res, next) => {
    if (req.path !== '/' && !req.path.includes('.')) {
      res.set({
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Origin': req.headers.origin || '*',
        'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
        'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
        'Content-Type': 'application/json; charset=utf-8',
      });
    }
    req.method === 'OPTIONS' ? res.status(204).end() : next();
  });

  // cookie parser
  app.use((req, res, next) => {
    req.cookies = {};
    (req.headers.cookie || '').split(/\s*;\s*/).forEach(pair => {
      let crack = pair.indexOf('=');
      if (crack < 1 || crack == pair.length - 1) return;
      req.cookies[
        decodeURIComponent(pair.slice(0, crack)).trim()
      ] = decodeURIComponent(pair.slice(crack + 1)).trim();
    });
    next();
  });

  // body parser
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  app.use(fileUpload());

  // cache
  app.use(cache('2 minutes', (req, res) => res.statusCode === 200));
  // router

  Object.keys(routes).forEach(route => {
    app.use(route, routes[route]);
  });

  const port = process.env.PORT || 10754;
  const host = process.env.HOST || '127.0.0.1';

  app.server = app.listen(port, host, () => {
    console.log(`server running @ http://${host ? host : 'localhost'}:${port}`);
  });
}
