import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
    getWorkspaceRoot: () => ipcRenderer.invoke('get-workspace-root')
})
