const path = require("path");
const CopyPlugin = require('copy-webpack-plugin')
function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = {
  devServer: {
    disableHostCheck: true,
    port: process.env.DEV_SERVER_PORT || 8080
  },
  pwa: {
    name: "YesPlayMusic",
    iconPaths: {
      favicon32: "img/icons/favicon-32x32.png",
    },
    themeColor: "#ffffff00",
    manifestOptions: {
      background_color: "#335eea",
    },
    // workboxOptions: {
    //   swSrc: "dev/sw.js",
    // },
  },
  pages: {
    index: {
      entry: "src/main.js",
      template: "public/index.html",
      filename: "index.html",
      title: "YesPlayMusic",
      chunks: ["main", "chunk-vendors", "chunk-common", "index"],
    },
  },
  chainWebpack(config) {
    config.module.rules.delete("svg");
    config.module.rule("svg").exclude.add(resolve("src/assets/icons")).end();
    config.module
      .rule("icons")
      .test(/\.svg$/)
      .include.add(resolve("src/assets/icons"))
      .end()
      .use("svg-sprite-loader")
      .loader("svg-sprite-loader")
      .options({
        symbolId: "icon-[name]",
      })
      .end();
  },
  // 添加插件的配置
  pluginOptions: {
    // electron-builder的配置文件
    electronBuilder: {
      preload: 'src/electron/preload.js',
      builderOptions: {
        // 应用名称
        productName: 'Yes Play Music',
        // 版权
        copyright: 'Copyright © YesPlayMusic',
        compression: "maximum",
        publish: ["github"],
        // Compress app using 'electron/asar'
        asar: true,

        // 项目打包生成的文件目录
        directories: {
          output: 'dist_electron'
        },
        // window 的 icon 头标
        win: {
          icon: 'public/favicon.ico'
        },
        // 是否静默安装
        nsis: {
          // 是否一键安装，建议为 false，可以让用户点击下一步、下一步、下一步的形式安装程序，如果为true，当用户双击构建好的程序，自动安装程序并打开，即：一键安装
          oneClick: false,
          // 允许修改安装目录，建议为 true，是否允许用户改变安装目录，默认是不允许
          allowToChangeInstallationDirectory: true
        },
        // 集成 nodejs, https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration
        // nodeIntegration: true
      },
      // 主线程的配置文件
      chainWebpackMainProcess: config => {
        config.plugin('define').tap((args) => {
          args[0]['IS_ELECTRON'] = true
          return args
        })
      },
      // 渲染线程的配置文件
      chainWebpackRendererProcess: config => {
        // 渲染线程的一些其他配置
        // Chain webpack config for electron renderer process only
        // The following example will set IS_ELECTRON to true in your app
        config.plugin('define').tap((args) => {
          args[0]['IS_ELECTRON'] = true
          return args
        })
      },
      // 主入口文件
      // mainProcessFile: 'src/main.js',
      mainProcessWatch: ['../napi/routes.js'],
      // mainProcessArgs: []
    }
  }
};
