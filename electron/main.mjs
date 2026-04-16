import { app } from 'electron'

import { init as initIPCHandler } from './ipchandler.mjs'
import { window as createWindow } from './window.mjs'

app.whenReady().then(() => {
    initIPCHandler()
    createWindow()
})
