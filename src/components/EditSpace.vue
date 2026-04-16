<script setup>
import { ref } from 'vue'
import { CodeEditor } from 'monaco-editor-vue3'

const code = ref('')
</script>

<template>
    <CodeEditor v-model:value="code" :options="{ automaticLayout: true }" theme="vs-dark" />
</template>

<style scoped></style>
