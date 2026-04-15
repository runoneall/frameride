<script setup>
import NewFileIcon from '../icons/NewFileIcon.vue'
import NewFolderIcon from '../icons/NewFolderIcon.vue'
import RefreshIcon from '../icons/RefreshIcon.vue'
import CollapseIcon from '../icons/CollapseIcon.vue'

const newFile = () => {}

const newFolder = () => {}

const refresh = () => {}

const collapse = () => {}
</script>

<template>
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
</style>
