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

ipcMain.handle('get-workspace-root', event => {
    return workspace_root
})

ipcMain.handle('set-workspace-root', async (event, root) => {
    if (!root || typeof root !== 'string') {
        throw new Error('工作区路径无效：路径不能为空且必须为字符串')
    }

    try {
        const resolved = path.resolve(root)
        const stat = fs.statSync(resolved)
        if (!stat.isDirectory()) {
            throw new Error('设置失败：指定路径不是一个目录')
        }

        workspace_root = resolved
        return workspace_root
    } catch (err) {
        if (err.message.startsWith('工作区路径无效') || err.message.startsWith('设置失败')) {
            throw err
        }

        throw new Error(`设置工作区失败：${err.message}`)
    }
})

ipcMain.handle('get-workspace-files', async (event, subdir = '') => {
    if (!workspace_root) {
        throw new Error('操作失败：工作区根目录未设置')
    }

    const targetDir = path.join(workspace_root, subdir)
    const resolvedTarget = path.resolve(targetDir)

    if (!resolvedTarget.startsWith(path.resolve(workspace_root))) {
        throw new Error('访问被拒绝：检测到非法的路径遍历尝试')
    }

    try {
        const entries = fs.readdirSync(resolvedTarget)
        const items = entries.map(name => {
            const fullPath = path.join(resolvedTarget, name)
            const stat = fs.statSync(fullPath)

            return {
                path: path.relative(workspace_root, fullPath),
                type: stat.isDirectory() ? 'directory' : 'file'
            }
        })

        return items
    } catch (err) {
        throw new Error(`读取目录失败：${err.message}`)
    }
})

ipcMain.handle('get-file-content', async (event, file) => {
    if (!file || typeof file !== 'string') {
        throw new Error('读取失败:文件路径无效')
    }

    if (!workspace_root) {
        throw new Error('读取失败:工作区根目录未设置')
    }

    const filePath = path.join(workspace_root, file)
    const resolvedPath = path.resolve(filePath)

    if (!resolvedPath.startsWith(path.resolve(workspace_root))) {
        throw new Error('访问被拒绝:检测到非法的路径遍历尝试')
    }

    try {
        const stat = fs.statSync(resolvedPath)
        if (!stat.isFile()) {
            throw new Error('读取失败:指定路径不是一个文件')
        }

        return fs.readFileSync(resolvedPath, 'utf-8')
    } catch (err) {
        if (err.code === 'ENOENT') {
            throw new Error('文件不存在:请检查文件路径是否正确')
        }

        throw new Error(`读取文件内容失败:${err.message}`)
    }
})

ipcMain.handle('set-file-content', async (event, file, content) => {
    if (!file || typeof file !== 'string') {
        throw new Error('写入失败:文件路径无效')
    }

    if (content === undefined || content === null) {
        throw new Error('写入失败:文件内容不能为空')
    }

    if (!workspace_root) {
        throw new Error('写入失败:工作区根目录未设置')
    }

    const filePath = path.join(workspace_root, file)
    const resolvedPath = path.resolve(filePath)

    if (!resolvedPath.startsWith(path.resolve(workspace_root))) {
        throw new Error('访问被拒绝:检测到非法的路径遍历尝试')
    }

    try {
        const dirPath = path.dirname(resolvedPath)
        if (!fs.existsSync(dirPath)) {
            throw new Error('写入失败:文件所在目录不存在')
        }

        fs.writeFileSync(resolvedPath, content, 'utf-8')
        return true
    } catch (err) {
        if (err.code === 'EACCES') {
            throw new Error('写入失败:没有权限写入该文件')
        }

        throw new Error(`写入文件失败:${err.message}`)
    }
})

ipcMain.handle('create-file', async (event, file) => {
    if (!file || typeof file !== 'string') {
        throw new Error('创建失败:文件路径无效')
    }

    if (!workspace_root) {
        throw new Error('创建失败:工作区根目录未设置')
    }

    const filePath = path.join(workspace_root, file)
    const resolvedPath = path.resolve(filePath)

    if (!resolvedPath.startsWith(path.resolve(workspace_root))) {
        throw new Error('访问被拒绝:检测到非法的路径遍历尝试')
    }

    try {
        if (fs.existsSync(resolvedPath)) {
            throw new Error('创建失败:文件或目录已存在')
        }

        const dirPath = path.dirname(resolvedPath)
        if (!fs.existsSync(dirPath)) {
            throw new Error('创建失败:父目录不存在')
        }

        fs.writeFileSync(resolvedPath, '', 'utf-8')
        return true
    } catch (err) {
        if (err.message.startsWith('创建失败')) {
            throw err
        }

        throw new Error(`创建文件失败:${err.message}`)
    }
})

ipcMain.handle('create-dir', async (event, dir) => {
    if (!dir || typeof dir !== 'string') {
        throw new Error('创建失败:目录路径无效')
    }

    if (!workspace_root) {
        throw new Error('创建失败:工作区根目录未设置')
    }

    const dirPath = path.join(workspace_root, dir)
    const resolvedPath = path.resolve(dirPath)

    if (!resolvedPath.startsWith(path.resolve(workspace_root))) {
        throw new Error('访问被拒绝:检测到非法的路径遍历尝试')
    }

    try {
        if (fs.existsSync(resolvedPath)) {
            throw new Error('创建失败:文件或目录已存在')
        }

        const parentPath = path.dirname(resolvedPath)
        if (!fs.existsSync(parentPath)) {
            throw new Error('创建失败:父目录不存在')
        }

        fs.mkdirSync(resolvedPath)
        return true
    } catch (err) {
        if (err.message.startsWith('创建失败')) {
            throw err
        }

        throw new Error(`创建目录失败:${err.message}`)
    }
})

ipcMain.handle('del-file-or-dir', async (event, target) => {
    if (!target || typeof target !== 'string') {
        throw new Error('删除失败:目标路径无效')
    }

    if (!workspace_root) {
        throw new Error('删除失败:工作区根目录未设置')
    }

    const targetPath = path.join(workspace_root, target)
    const resolvedPath = path.resolve(targetPath)

    if (!resolvedPath.startsWith(path.resolve(workspace_root))) {
        throw new Error('访问被拒绝:检测到非法的路径遍历尝试')
    }

    try {
        if (!fs.existsSync(resolvedPath)) {
            throw new Error('删除失败:目标文件或目录不存在')
        }

        const stat = fs.statSync(resolvedPath)

        if (stat.isDirectory()) {
            fs.rmSync(resolvedPath, { recursive: true, force: true })
        } else {
            fs.unlinkSync(resolvedPath)
        }

        return true
    } catch (err) {
        if (err.message.startsWith('删除失败')) {
            throw err
        }

        if (err.code === 'EACCES') {
            throw new Error('删除失败:没有权限删除该文件或目录')
        }

        if (err.code === 'EPERM') {
            throw new Error('删除失败:无法删除该文件或目录，可能是由于权限问题或文件正在被使用')
        }

        throw new Error(`删除文件或目录失败:${err.message}`)
    }
})
