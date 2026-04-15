<script setup>
import { ref, watch } from 'vue'
import { useWorkspaceStore } from '../stores/workspace'

import NewFileIcon from '../icons/NewFileIcon.vue'
import NewFolderIcon from '../icons/NewFolderIcon.vue'
import RefreshIcon from '../icons/RefreshIcon.vue'
import CollapseIcon from '../icons/CollapseIcon.vue'

const workspace = useWorkspaceStore()
const fileTree = ref([])

const getTreeRoot = async () => {
    const data = await window.api.getWorkspaceFiles()
    fileTree.value = data.map(item => ({
        label: item.name,
        key: item.path,
        isLeaf: item.isfile
    }))
}

const getTreeMore = async node => {
    return new Promise(async resolve => {
        const data = await window.api.getWorkspaceFiles(node.key)
        node.children = data.map(item => ({
            label: item.name,
            key: item.path,
            isLeaf: item.isfile
        }))

        resolve()
    })
}

const newFile = () => {}

const newFolder = () => {}

const refresh = () => {}

const collapse = () => {}

watch(
    () => workspace.root,
    () => getTreeRoot(),
    { immediate: true }
)
</script>

<template>
    <div style="height: 100%; display: flex; flex-direction: column">
        <div class="top-tools">
            <n-button text @click="newFile">
                <template #icon>
                    <NewFileIcon class="icon" />
                </template>
            </n-button>
            <n-button text @click="newFolder">
                <template #icon>
                    <NewFolderIcon class="icon" />
                </template>
            </n-button>
            <n-button text @click="refresh">
                <template #icon>
                    <RefreshIcon class="icon" />
                </template>
            </n-button>
            <n-button text @click="collapse">
                <template #icon>
                    <CollapseIcon class="icon" />
                </template>
            </n-button>
        </div>

        <n-scrollbar x-scrollable trigger="none" style="flex: 1">
            <n-tree block-line expand-on-click show-line :data="fileTree" :on-load="getTreeMore"></n-tree>
        </n-scrollbar>
    </div>
</template>

<style scoped>
.top-tools {
    height: 30px;
    margin: 0 10px;
    column-gap: 5px;
    display: flex;
    align-items: center;
}

.top-tools .icon {
    min-width: 20px;
    max-height: 20px;
    color: lightblue;
}

:deep(.n-tree-node-content__text) {
    white-space: nowrap;
}
</style>
