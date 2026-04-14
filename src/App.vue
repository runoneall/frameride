<script setup>
import { darkTheme } from 'naive-ui'

import TopMenu from './components/TopMenu.vue'
import SideSpace from './components/SideSpace.vue'
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
                        <div class="sidebar-area">
                            <SideSpace />
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

.sidebar-area,
.sidebar-area > div[role='none'] {
    height: 100%;
}

.editor-area {
    height: 100%;
}

.bottom-bar {
    height: 20px;
    border-top: 1px solid darkgrey;
}
</style>
