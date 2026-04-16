<script setup>
import { ref } from 'vue'
import { CodeEditor } from 'monaco-editor-vue3'

const code = ref(`function hello() {
  console.log('Hello Monaco Editor Vue3!');
}`)
</script>

<template>
    <CodeEditor v-model:value="code" language="javascript" theme="vs-dark" :height="400" />
</template>

<style scoped></style>
