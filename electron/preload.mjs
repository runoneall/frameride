import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
    getWorkspaceRoot: () => ipcRenderer.invoke('get-workspace-root'),
    setWorkspaceRoot: root => ipcRenderer.invoke('set-workspace-root', root),
    getWorkspaceFiles: subdir => ipcRenderer.invoke('get-workspace-files', subdir),
    getFileContent: file => ipcRenderer.invoke('get-file-content', file),
    setFileContent: (file, content) => ipcRenderer.invoke('set-file-content', file, content),
    createFile: file => ipcRenderer.invoke('create-file', file),
    createDir: dir => ipcRenderer.invoke('create-dir', dir)
})
