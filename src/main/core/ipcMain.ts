import { ipcMain } from 'electron'

ipcMain.handle('request', async (event, params) => {
  // return user_detail({ uid: 32953014 })
})
