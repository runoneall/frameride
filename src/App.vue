<script setup>
import { darkTheme } from 'naive-ui'
import ExplorerIcon from './icons/ExplorerIcon.vue'

document.title = 'Framer IDE'
</script>

<template>
    <n-config-provider :theme="darkTheme">
        <n-global-style />
        <n-flex vertical style="height: 100vh; gap: 0">
            <div style="height: 30px; border-bottom: 1px solid darkgrey">
                <!-- 顶部区域 -->
            </div>
            <div style="flex: 1">
                <n-split min="120px" default-size="280px" :resize-trigger-size="4">
                    <template #1>
                        <n-space vertical class="tabs-container">
                            <n-tabs placement="left" style="height: 100%">
                                <n-tab-pane name="explorer">
                                    <template #tab>
                                        <ExplorerIcon class="tabs-icon" />
                                    </template>
                                    <div>这里是资源管理器的内容</div>
                                </n-tab-pane>
                                <n-tab-pane name="explorer1">
                                    <template #tab>
                                        <ExplorerIcon class="tabs-icon" />
                                    </template>
                                    <div>这里是资源管理器的内容</div>
                                </n-tab-pane>
                            </n-tabs>
                        </n-space>
                    </template>
                    <template #2>
                        <div style="height: 100%">
                            <!-- 主区域 -->
                        </div>
                    </template>
                </n-split>
            </div>
            <div style="height: 20px; border-top: 1px solid darkgrey">
                <!-- 底部区域 -->
            </div>
        </n-flex>
    </n-config-provider>
</template>

<style scoped>
.tabs-container,
:deep(.tabs-container > div[role='none']) {
    height: 100%;
}

.tabs-icon {
    width: 30px;
    height: 30px;
    color: lightgrey;
    display: block;
}

:deep(.n-tabs-nav) {
    border-right: 1px solid darkgrey;
}

:deep(.n-tabs-bar) {
    left: 0 !important;
    right: auto !important;
}

:deep(.n-tabs-tab) {
    border: 0 !important;
    padding: 0 !important;
    width: 40px;
    height: 40px;

    align-items: center !important;
    justify-content: center !important;
}
</style>
