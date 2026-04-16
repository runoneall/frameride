<script setup>
import { ref } from 'vue'

import CodeMirror from 'vue-codemirror6'
import { basicSetup } from 'codemirror'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'

import { javascript } from '@codemirror/lang-javascript'

const code = ref('// 在这里编写代码...\nconsole.log("Hello, World!")')
const extensions = [basicSetup, vscodeDark, javascript()]
</script>

<template>
    <CodeMirror class="editor" v-model="code" :extensions="extensions" />
</template>

<style scoped>
.editor,
.editor :deep(.cm-editor) {
    height: 100%;
}
</style>
