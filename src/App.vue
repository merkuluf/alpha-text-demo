<script setup lang="ts">
import { ref } from 'vue'
import TiptapEditor from './components/TiptapEditor.vue'

const content = ref('<p>Hello world</p>')
const editorRef = ref()
const toolbarItems = ref([
  'textStyle',
  'bold',
  'italic',
  'strike',
  'lists',
  'blockquote',
  'codeBlock',
  'horizontalRule',
  'undo',
  'redo',
])

const handleContentUpdate = (newContent: string) => {
  content.value = newContent
}

const printData = () => {
  if (!editorRef.value) return

  const html = editorRef.value.getHTML()
  const text = editorRef.value.getText()
  const json = editorRef.value.getJSON()
  const markdown = editorRef.value.getMarkdown()

  console.log('=== TEXT EDITOR DATA ===')
  console.log('Plain Text:', text)
  console.log('\nHTML:', html)
  console.log('\nMarkdown:', markdown)
  console.log('\nJSON:', json)
}


const loadSampleContent = () => {
  const sample = `
    <h1>Sample Content</h1>
    <p>This is a <strong>sample</strong> document with various formatting options.</p>
    <h2>Features</h2>
    <ul>
      <li>Bold, italic, and strikethrough text</li>
      <li>Headings (H1, H2)</li>
      <li>Bullet and ordered lists</li>
      <li>Blockquotes</li>
      <li>Code blocks</li>
    </ul>
    <blockquote>
      <p>This is a blockquote example.</p>
    </blockquote>
  `.trim()

  editorRef.value?.setContent(sample)
}

const clearContent = () => {
  editorRef.value?.clearContent()
}
</script>

<template>
  <div class="main-screen">
    <div class="main-content">
      <h3>Редактор текста для Alpha-Doc</h3>

      <TiptapEditor
        ref="editorRef"
        :model-value="content"
        :toolbar-items="toolbarItems"
        @update:model-value="handleContentUpdate"
      />

      <div class="controls-wrapper">
        <button @click="printData">Print (консоль)</button>
        <button @click="loadSampleContent">Загрузить пример</button>
        <button @click="clearContent">Очистить</button>
      </div>
    </div>
  </div>
</template>
<style scoped>
body {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  background: #f5f5f5;
}

.main-screen {
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 30px 20px;
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0.02) 0%,
    rgba(0, 0, 0, 0.01) 2%,
    #f5f5f5 3%,
    #f5f5f5 100%
  );
}

.main-content {
  width: 100%;
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.main-screen h3 {
  margin: 0;
  font-family: Arial, sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
}

.controls-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 28px;
  background: white;
  border-radius: 16px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.control-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.control-section p {
  margin: 0;
  font-family: Arial, sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #333;
}

.controls-wrapper button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  font-family: Arial, sans-serif;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
  background-color: white;
  color: #333;
  border: 1.5px solid #e0e0e0;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.2s ease;
  width: fit-content;
}

.controls-wrapper button:nth-child(2) {
  background-color: #f4d35e;
  color: #333;
  border-color: #f4d35e;
  font-weight: 700;
}

.controls-wrapper button:nth-child(2):hover {
  background-color: #ecc840;
  border-color: #ecc840;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(244, 211, 94, 0.3);
}

.controls-wrapper button:nth-child(2):active {
  transform: translateY(0);
}

.controls-wrapper button:hover {
  background-color: #f8f8f8;
  border-color: #d0d0d0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.controls-wrapper button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.controls-wrapper button:focus {
  outline: 2px solid rgba(0, 0, 0, 0.1);
  outline-offset: 2px;
}

.toolbar-toggles {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  background: #f8f8f8;
  border-radius: 12px;
}

.toolbar-toggles label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: Arial, sans-serif;
  font-size: 13px;
  cursor: pointer;
  user-select: none;
  color: #333;
}

.toolbar-toggles input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #0076ff;
}
</style>
