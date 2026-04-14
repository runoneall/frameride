import { contextBridge, ipcRenderer } from 'electron'

let WORKSPACE_ROOT = null

ipcRenderer.on('WORKSPACE_ROOT', (_, path) => {
    WORKSPACE_ROOT = path
})

contextBridge.exposeInMainWorld('api', {
    get WORKSPACE_ROOT() {
        return WORKSPACE_ROOT
    }
})
