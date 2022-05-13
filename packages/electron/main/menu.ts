import {
  BrowserWindow,
  Menu,
  MenuItem,
  MenuItemConstructorOptions,
  shell,
} from 'electron'
import { logsPath, isMac } from './utils'
import { exec } from 'child_process'

export const createMenu = (win: BrowserWindow) => {
  const template: Array<MenuItemConstructorOptions | MenuItem> = [
    { role: 'appMenu' },
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' },
    {
      label: '帮助',
      submenu: [
        {
          label: '打开日志文件目录',
          click: async () => {
            if (isMac) {
              exec(`open ${logsPath}`)
            } else {
              // TODO: 测试Windows和Linux是否能正确打开日志目录
              shell.openPath(logsPath)
            }
          },
        },
        {
          label: '打开开发者工具',
          click: async () => {
            win.webContents.openDevTools()
          },
        },
        {
          label: '反馈问题',
          click: async () => {
            await shell.openExternal(
              'https://github.com/qier222/YesPlayMusic/issues/new'
            )
          },
        },
        { type: 'separator' },
        {
          label: '访问 GitHub 仓库',
          click: async () => {
            await shell.openExternal('https://github.com/qier222/YesPlayMusic')
          },
        },
        {
          label: '访问论坛',
          click: async () => {
            await shell.openExternal(
              'https://github.com/qier222/YesPlayMusic/discussions'
            )
          },
        },
        {
          label: '加入交流群',
          click: async () => {
            await shell.openExternal(
              'https://github.com/qier222/YesPlayMusic/discussions'
            )
          },
        },
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
