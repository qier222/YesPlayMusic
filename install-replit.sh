#!/bin/bash

if [ ! "$(cat replit.nix | grep yarn)" ]; then

  echo 'run = ["bash", "main.sh"]

entrypoint = "main.sh"' >.replit

  echo '{ pkgs }: {
		deps = with pkgs; [
				yarn
				nodejs-16_x
				nodePackages.typescript-language-server
		];
}' >replit.nix
  echo 初始化 replit.nix... 请再次运行此命令
  exit
fi

echo 个人版由于内存仅 1G 可能会构建失败
echo 构建过程中若失败请尝试再次运行此命令
sleep 1

if [ ! -d "api" ]; then
  git clone https://github.com/Binaryify/NeteaseCloudMusicApi.git api
fi

if [ ! -d "music" ]; then
  git clone https://github.com/qier222/YesPlayMusic.git music
  cp ./music/.env.example ./music/.env
fi

echo 'cd api
node app.js &
echo "api 运行成功，正在启动主程序..."
cd ..
cd music 
npm run serve' >main.sh

cd api && npm install
sleep 1
cd ../music && yarn install && yarn run build && cd ..
