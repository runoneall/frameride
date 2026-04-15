<script setup>
import ExplorerIcon from '../icons/ExplorerIcon.vue'
import Explorer from './Explorer.vue'

import AIIcon from '../icons/AIIcon.vue'
import AI from './AI.vue'
</script>

<template>
    <n-tabs placement="left" class="sidebar-tabs">
        <n-tab-pane name="explorer">
            <template #tab>
                <ExplorerIcon class="tabs-icon" />
            </template>
            <Explorer />
        </n-tab-pane>
        <n-tab-pane name="ai">
            <template #tab>
                <AIIcon class="tabs-icon" />
            </template>
            <AI />
        </n-tab-pane>
    </n-tabs>
</template>

<style scoped>
.sidebar-tabs {
    height: 100%;
}

.sidebar-tabs :deep(.n-tab-pane) {
    height: 100%;
    padding: 0;
    overflow: hidden;
}

.sidebar-tabs :deep(.n-tabs-nav) {
    min-width: 40px;
    border-right: 1px solid darkgrey;
    overflow: hidden;
}

.sidebar-tabs :deep(.n-tabs-bar) {
    left: 0 !important;
    right: auto !important;
}

.sidebar-tabs :deep(.n-tabs-tab) {
    border: 0 !important;
    padding: 0 !important;
    width: 40px;
    height: 40px;
    align-items: center !important;
    justify-content: center !important;
}

.tabs-icon {
    width: 30px;
    height: 30px;
    color: lightgrey;
    display: block;
}
</style>
