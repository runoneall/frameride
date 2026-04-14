import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useWorkspaceStore = defineStore('workspace', () => {
    const root = ref(null)
    const init = async () => {
        root.value = await window.api.getWorkspaceRoot()
    }

    return { root, init }
})
