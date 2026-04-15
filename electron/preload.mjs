import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
    getWorkspaceRoot: () => ipcRenderer.invoke('get-workspace-root'),
    setWorkspaceRoot: target => ipcRenderer.invoke('set-workspace-root', target),

    getWorkspaceFiles: target => ipcRenderer.invoke('get-workspace-files', target),
    delWorkspaceFiles: target => ipcRenderer.invoke('del-workspace-files', target), //

    getFileContent: target => ipcRenderer.invoke('get-file-content', target), //
    setFileContent: (target, content) => ipcRenderer.invoke('set-file-content', target, content), //

    createFile: target => ipcRenderer.invoke('create-file', target),
    createDir: target => ipcRenderer.invoke('create-dir', target),

    renameDirFile: (target, name) => ipcRenderer.invoke('rename-dir-file', target, name), //

    pickDir: () => ipcRenderer.invoke('pick-dir')
})
