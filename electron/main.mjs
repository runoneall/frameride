import { app, BrowserWindow, ipcMain } from 'electron'
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
        width: 1024,
        height: 768,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.mjs')
        }
    })

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

ipcMain.handle('set-workspace-root', (_, target = '') => {
    if (target === '') return
    workspace_root = target
})

ipcMain.handle('get-workspace-files', (_, target = '') => {
    const array = fs.readdirSync(path.join(workspace_root, target))
    return array.map(item => ({
        name: item,
        path: path.join(target, item),
        isfile: fs.statSync(path.join(workspace_root, target, item)).isFile()
    }))
})

ipcMain.handle('del-workspace-files', (_, target = '') => {
    if (target === '') return
    return fs.rmSync(path.join(workspace_root, target), { recursive: true })
})

ipcMain.handle('get-file-content', (_, target = '') => {
    if (target === '') return
    return fs.readFileSync(path.join(workspace_root, target), 'utf-8')
})

ipcMain.handle('set-file-content', (_, target = '', content = '') => {
    if (target === '' || content === '') return
    return fs.writeFileSync(path.join(workspace_root, target), content)
})

ipcMain.handle('create-file', (_, target = '') => {
    if (target === '') return
    return fs.writeFileSync(path.join(workspace_root, target), '')
})

ipcMain.handle('create-dir', (_, target = '') => {
    if (target === '') return
    return fs.mkdirSync(path.join(workspace_root, target), { recursive: true })
})

ipcMain.handle('rename-dir-file', (_, target = '', name = '') => {
    if (target === '' || name === '') return
    return fs.renameSync(path.join(workspace_root, target), path.join(workspace_root, name))
})
