<script setup lang="ts">
import { ref } from 'vue'
import RichTextEditor from './components/RichTextEditor.vue'

const content = ref('<p>Hello</p>')
const editorRef = ref()

const handleContentUpdate = (newContent: string) => {
  content.value = newContent
}

const printData = () => {
  const data = editorRef.value?.getEditorData()
  if (data) {
    console.log('Plain Text:', data.plainText)
    console.log('HTML:', data.html)
    console.log('Quill Delta:', data.delta)
  }
}
</script>

<template>
  <div class="main-screen">
    <div class="main-content">
      <h3>Быстрая демка text-editor для Alpha-Doc</h3>
      <RichTextEditor ref="editorRef" :content="content" @update:content="handleContentUpdate" />
      <div class="controls-wrapper">
        <p>Увидеть данные в консоли:</p>
        <button @click="printData">Print</button>
      </div>
    </div>
  </div>
</template>
<style>
body {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: none;
  margin: 0;
  padding: 0;
}
.main-screen {
  min-height: 100vh;
  min-width: 90vw;
  max-width: 90vw;

  display: flex;
  justify-content: center;
  align-items: center;
}
.main-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.main-screen h3 {
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
}
.controls-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.controls-wrapper p {
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  font-size: large;
}

.controls-wrapper button {
  /* Layout & Spacing */
  display: inline-block;
  padding: 12px 24px; /* Top/Bottom Left/Right spacing */

  /* Typography */
  font-family: system-ui, sans-serif; /* Clean modern font */
  font-size: 16px; /* Legible text size */
  font-weight: 600; /* Semi-bold text */
  text-align: center; /* Centers the text */
  text-decoration: none; /* Removes underline if using an <a> tag */

  /* Aesthetics */
  background-color: #0076ff; /* Vibrant primary blue color */
  color: #ffffff; /* Crisp white text for contrast */
  border: none; /* Removes the ugly default browser border */
  border-radius: 6px; /* Sleek, slightly rounded corners */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Soft shadow depth */

  /* Interactivity & Animation */
  cursor: pointer; /* Changes mouse cursor to a hand tool */
  transition: all 0.2s ease; /* Smooth animation when interacting */
}

.controls-wrapper button:hover {
  background-color: #005ce6; /* Darkens background color */
  transform: translateY(-2px); /* Lifts button up slightly */
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15); /* Deepens shadow */
}

/* Active State - User clicks down on button */
.controls-wrapper button:active {
  transform: translateY(0); /* Pushes button back down */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Flattens shadow */
}

/* Focus State - Keyboard accessibility navigation */
.controls-wrapper button:focus {
  outline: 3px solid rgba(0, 118, 255, 0.4); /* Clear blue focus ring */
}
</style>
