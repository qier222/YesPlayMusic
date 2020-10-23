const path = require("path");
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
      builderOptions: {
        // files: [
        //   {
        //     'filter': ['**/*']
        //   }
        // ],
        // extraFiles: ['./extensions/'],
        // 应用名称
        productName: 'Yes Play Music',
        // 版权
        copyright: 'Copyright © YesPlayMusic',
        compression: "maximum",
        // 是否打包加密
        asar: true,
        // // 项目打包生成的文件目录
        // directories: {
        //   output: 'build'
        // },
        // window的icon头标
        win: {
          icon: 'public/favicon.ico'
        },
        // 是否静默安装
        nsis: {
          oneClick: false,
          allowToChangeInstallationDirectory: true
        }
      },
      // chainWebpackMainProcess: config => {
        // config.module
        //   .rule('babel')
        //   .test(/\*.js$/)
        //   .use('babel')
        //   .loader('babel-loader')
        //   .options({
        //     presets: [['@babel/preset-env', '@vue/cli-plugin-babel/preset', { modules: false }]],
        //     plugins: ['@babel/plugin-proposal-class-properties']
        //   })
      // },
      // 渲染线程的配置文件
      // chainWebpackRendererProcess: config => {
      //   // 渲染线程的一些其他配置
      //   // Chain webpack config for electron renderer process only
      //   // The following example will set IS_ELECTRON to true in your app
      //   config.plugin('define').tap((args) => {
      //     args[0]['IS_ELECTRON'] = true
      //     return args
      //   })
      // },
      // 主入口文件
      // mainProcessFile: 'src/main.js',
      // mainProcessWatch: [],
      // mainProcessArgs: []
    }
  },
  // 打包时不生成.map文件，减少体积，加快速度如果你不需要生产环境的 source map，可以将其设置为 false 以加速生产环境构建。
  productionSourceMap: false,
  // 放置生成的静态资源 (js、css、img、fonts) 的 (相对于 outputDir 的) 目录。
  assetsDir: 'src/renderer/static',
  // 跨域配置
  devServer: {
    disableHostCheck: true
  },
  // css 样式
  css: {}
};
