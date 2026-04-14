import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import os from 'node:os'
import fs from 'node:fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win
let workspace_root

const createWindow = () => {
    workspace_root = process.argv[1] ?? os.homedir()

    try {
        if (!fs.statSync(workspace_root).isDirectory()) {
            console.error(`${workspace_root} is not a directory`)
            app.quit()
            return
        }
    } catch {
        console.error(`Directory ${workspace_root} does not exist`)
        app.quit()
        return
    }

    win = new BrowserWindow({
        webPreferences: {
            preload: path.join(__dirname, 'preload.mjs')
        }
    })

    // Menu.setApplicationMenu(null)

    win.setSize(1024, 768)

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL)
    } else {
        win.loadFile(path.join(RENDERER_DIST, 'index.html'))
    }
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
        win = null
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

app.whenReady().then(createWindow)

ipcMain.handle('get-workspace-root', () => {
    return workspace_root
})
