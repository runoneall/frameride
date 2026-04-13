<script setup>
import { darkTheme } from 'naive-ui'
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
                        <n-flex style="height: 100%; gap: 0">
                            <div style="width: 60px; border-right: 1px solid darkgrey">
                                <!-- 侧边图标区域-->
                            </div>
                            <div style="flex: 1">
                                <!-- 侧边区域 -->
                            </div>
                        </n-flex>
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

<style scoped></style>
