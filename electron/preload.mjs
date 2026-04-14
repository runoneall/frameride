import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
    getWorkspaceRoot: () => ipcRenderer.invoke('get-workspace-root'),
    setWorkspaceRoot: root => ipcRenderer.invoke('set-workspace-root', root),
    getWorkspaceFiles: subdir => ipcRenderer.invoke('get-workspace-files', subdir),
    getFileContent: file => ipcRenderer.invoke('get-file-content', file)
})
