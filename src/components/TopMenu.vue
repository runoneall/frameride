<script setup>
import { useWorkspaceStore } from '../stores/workspace'

const workspace = useWorkspaceStore()
const changespace = async () => {
    const dir = await window.api.pickDir()
    if (!dir) return

    await window.api.setWorkspaceRoot(dir)
    workspace.setroot(dir)
}

const onclick = async (_, item) => await item.call()
const menuopt = [
    {
        label: '工作区',
        children: [
            {
                label: '打开',
                call: changespace
            }
        ]
    }
]
</script>

<template>
    <n-menu class="top-menu" mode="horizontal" :options="menuopt" @update:value="onclick" />
</template>

<style scoped>
.top-menu {
    height: 100%;
}

.top-menu :deep(.n-menu-item) {
    height: 100%;
    margin-top: 1px;
}

.top-menu :deep(.n-menu-item-content) {
    height: 100%;
    padding: 0 10px;
}
</style>
