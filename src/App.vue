<script setup>
import { darkTheme } from 'naive-ui'

import ExplorerIcon from './icons/ExplorerIcon.vue'
import Explorer from './components/Explorer.vue'

import AIIcon from './icons/AIIcon.vue'
import AI from './components/AI.vue'

import TopMenu from './components/TopMenu.vue'
import EditSpace from './components/EditSpace.vue'
import BottomBar from './components/BottomBar.vue'

document.title = 'Framer IDE'
</script>

<template>
    <n-config-provider :theme="darkTheme">
        <n-global-style />
        <div class="app-container">
            <header class="top-menu">
                <TopMenu />
            </header>

            <main class="main-content">
                <n-split min="120px" default-size="280px" :resize-trigger-size="4">
                    <template #1>
                        <div class="sidebar-wrapper">
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
                        </div>
                    </template>
                    <template #2>
                        <div class="editor-area">
                            <EditSpace />
                        </div>
                    </template>
                </n-split>
            </main>

            <footer class="bottom-bar">
                <BottomBar />
            </footer>
        </div>
    </n-config-provider>
</template>

<style scoped>
.app-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.top-menu {
    height: 30px;
    border-bottom: 1px solid darkgrey;
}

.main-content {
    flex: 1;
    overflow: hidden;
}

.sidebar-wrapper,
.sidebar-wrapper > div[role='none'] {
    height: 100%;
}

.sidebar-tabs {
    height: 100%;
}

.sidebar-tabs :deep(.n-tab-pane) {
    height: 100%;
    padding: 0;
    overflow: auto;
}

.editor-area {
    height: 100%;
}

.bottom-bar {
    height: 20px;
    border-top: 1px solid darkgrey;
}

.tabs-icon {
    width: 30px;
    height: 30px;
    color: lightgrey;
    display: block;
}

.sidebar-tabs :deep(.n-tabs-nav) {
    border-right: 1px solid darkgrey;
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
</style>
