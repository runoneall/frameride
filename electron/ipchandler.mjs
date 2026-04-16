import { app, ipcMain, dialog } from 'electron'
import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'

let workspace_root

export const init = () => {
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
}

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
    return fs.renameSync(path.join(workspace_root, target), path.join(workspace_root, path.dirname(target), name))
})

ipcMain.handle('pick-dir', async _ => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory']
    })

    return result.filePaths[0]
})
