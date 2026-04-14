import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('api', {
    WORKSPACE_ROOT: process.argv || null
})
