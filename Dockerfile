FROM node:16.13.1-alpine as build
ENV VUE_APP_NETEASE_API_URL=/api
WORKDIR /app
RUN apk add --no-cache python3 make g++ git
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build

FROM nginx:1.20.2-alpine as app
RUN echo $'server { \n\
  gzip on;\n\
  listen       80; \n\
  listen  [::]:80; \n\
  server_name  localhost; \n\
  \n\
  location / { \n\
  root /usr/share/nginx/html; \n\
  index  index.html; \n\
  try_files $uri $uri/ /index.html; \n\
  } \n\
  \n\
  location @rewrites { \n\
  rewrite ^(.*)$ /index.html last; \n\
  } \n\
  \n\
  location /api/ { \n\
  proxy_buffer_size 128k; \n\
  proxy_buffers 16 32k; \n\
  proxy_busy_buffers_size 128k; \n\
  proxy_set_header  Host $host; \n\
  proxy_set_header  X-Real-IP $remote_addr; \n\
  proxy_set_header  X-Forwarded-For $remote_addr; \n\
  proxy_set_header  X-Forwarded-Host $remote_addr; \n\
  proxy_set_header  X-NginX-Proxy true; \n\
  proxy_pass        http://localhost:3000/; \n\
  } \n\
  }' > /etc/nginx/conf.d/default.conf

COPY --from=build /app/package.json /usr/local/lib/

RUN apk add --no-cache --repository http://dl-cdn.alpinelinux.org/alpine/v3.14/main libuv jq \
  && apk add --no-cache --update-cache --repository http://dl-cdn.alpinelinux.org/alpine/v3.14/main nodejs npm \
  && npm i -g NeteaseCloudMusicApi@"$(jq -r '.dependencies.NeteaseCloudMusicApi' /usr/local/lib/package.json)"

COPY --from=build /app/dist /usr/share/nginx/html

CMD nginx ; exec npx NeteaseCloudMusicApi
