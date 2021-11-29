# Fork Bug 维护版

发布只有预览版, 只供测试.

<del>
胡乱用把你电脑卡爆了我直接免责声明
</del>

## 本地开发

1. 克隆代码

2. 安装依赖

```shell
yarn

yarn netease_api:install
```

3. 运行本地开发环境

```shell
yarn netease_api:run

yarn electron:server
```

4. 编译打包 windows 版

```shell
yarn electron:build-win
```

x86

```shell
yarn electron:build --windows nsis:ia32
```

5. 编译打包 mac 版

```shell
yarn electron:build-mac
```

arm64

```shell
yarn electron:build --macos dir:arm64
```
