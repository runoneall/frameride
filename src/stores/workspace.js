import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useWorkspaceStore = defineStore('workspace', () => {
    const WORKSPACE_ROOT = ref(window.api.WORKSPACE_ROOT)
    return { WORKSPACE_ROOT }
})
