FROM node:16.13.1-alpine AS build
ENV VUE_APP_NETEASE_API_URL=/api
WORKDIR /app
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories &&\
	apk add --no-cache python3 make g++ git
COPY package.json yarn.lock ./
RUN yarn config set electron_mirror https://npmmirror.com/mirrors/electron/ && \
    yarn config set registry https://registry.npmmirror.com && \
    sed -i 's/registry.yarnpkg.com/registry.npmmirror.com/g' yarn.lock && \
    sed -i 's/registry.npmjs.org/registry.npmmirror.com/g' yarn.lock && \
    yarn install 
COPY . .
RUN yarn build

FROM nginx:1.20.2-alpine AS app

COPY --from=build /app/package.json /usr/local/lib/

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories \
  && apk add --no-cache libuv nodejs npm \
  && npm config set registry https://registry.npmmirror.com \
  && npm i -g $(awk -F \" '{if($2=="NeteaseCloudMusicApi") print $2"@"$4}' /usr/local/lib/package.json) \
  && rm -f /usr/local/lib/package.json

COPY --from=build /app/docker/nginx.conf.example /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

CMD ["sh", "-c", "nginx && exec npx NeteaseCloudMusicApi"]
