 #!/usr/bin/bash

# 初始化 .replit 和 replit.nix
if [[ $1 == i ]];then
    echo -e 'run = ["bash", "main.sh"]\n\nentrypoint = "main.sh"' >.replit
    echo -e "{ pkgs }: {\n\t\tdeps = [\n\t\t\tpkgs.nodejs-16_x\n\t\t\tpkgs.yarn\n\t\t\tpkgs.bashInteractive\n\t\t];\n}" > replit.nix
    exit
fi

# 安装
if [[ ! -d api ]];then
    mkdir api
    git clone https://github.com/Binaryify/NeteaseCloudMusicApi ./api &&  \
    cd api && npm install && cd ..
fi

if [[ ! -d music ]];then
    mkdir music
    git clone https://github.com/qier222/YesPlayMusic ./music && \
    cd music && cp .env.example .env && npm install --force && npm run build && cd ..
fi

# 启动
PID=`ps -ef | grep npm | awk '{print $2}' | sed '$d'`

if [[ ! -z ${PID} ]];then echo $PID | xargs kill;fi
nohup bash -c 'cd api && PORT=35216 node app.js' > api.log 2>&1
nohup bash -c 'npx serve music/dist/' > music.log 2>&1
