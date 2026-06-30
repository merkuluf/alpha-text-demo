<script setup lang="ts">
import { ref } from 'vue'
import TiptapEditor from './components/TiptapEditor.vue'
import ResponsiveInput from './components/ResponsiveInput.vue'

const content = ref('<p>Hello world</p>')
const editorRef = ref()
const username = ref('')
const email = ref('')
const emailError = ref(false)
const emailErrorMsg = ref('')
const message = ref('')
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

const validateEmail = (emailValue: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailValue) {
    emailError.value = false
    emailErrorMsg.value = ''
  } else if (!regex.test(emailValue)) {
    emailError.value = true
    emailErrorMsg.value = 'Пожалуйста введите корректный email адрес'
  } else {
    emailError.value = false
    emailErrorMsg.value = ''
  }
}

const handleEmailChange = (value: string) => {
  email.value = value
  validateEmail(value)
}
</script>

<template>
  <div class="main-screen">
    <div class="main-content">
      <div class="header-section">
        <h3>Alpha-Doc Text Editor</h3>
        <p class="subtitle">Полнофункциональный редактор текста для современных приложений</p>
      </div>

      <section class="demo-section">
        <h4 class="section-title">📝 Основной редактор</h4>
        <TiptapEditor
          ref="editorRef"
          :model-value="content"
          :toolbar-items="toolbarItems"
          @update:model-value="handleContentUpdate"
        />
      </section>

      <section class="demo-section">
        <h4 class="section-title">⚙️ Адаптивные поля ввода</h4>
        <div class="input-grid">
          <ResponsiveInput
            id="username"
            v-model="username"
            type="text"
            label="Имя пользователя"
            placeholder="Введите ваше имя"
          />

          <ResponsiveInput
            id="email"
            v-model="email"
            type="email"
            label="Электронная почта"
            placeholder="example@mail.com"
            :error="emailError"
            :error-message="emailErrorMsg"
            @update:model-value="handleEmailChange"
          />

          <ResponsiveInput
            id="message"
            v-model="message"
            type="textarea"
            label="Сообщение"
            placeholder="Ваше сообщение здесь..."
            :rows="4"
          />
        </div>
      </section>

      <section class="demo-section">
        <h4 class="section-title">🎮 Управление редактором</h4>
        <div class="controls-wrapper">
          <button @click="printData" class="btn-secondary">Print (консоль)</button>
          <button @click="loadSampleContent" class="btn-primary">Загрузить пример</button>
          <button @click="clearContent" class="btn-secondary">Очистить</button>
        </div>
      </section>
    </div>
  </div>
</template>
<style scoped>
body {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  background: #f8f9fa;
}

.header-section {
  text-align: center;
  padding: 16px 0;
}

.subtitle {
  margin: 8px 0 0 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  font-size: 16px;
  color: #6b7280;
  font-weight: 400;
}

.demo-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #374151;
}

.input-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.btn-primary {
  background-color: #fbbf24 !important;
  color: #1f2937 !important;
  border-color: #fbbf24 !important;
}

.btn-primary:hover {
  background-color: #f59e0b !important;
  border-color: #f59e0b !important;
}

.btn-secondary {
  background-color: white !important;
  color: #374151 !important;
  border-color: #d1d5db !important;
}

.btn-secondary:hover {
  background-color: #f3f4f6 !important;
  border-color: #9ca3af !important;
}

@media (max-width: 768px) {
  .header-section {
    padding: 12px 0;
  }

  .subtitle {
    font-size: 14px;
  }

  .demo-section {
    gap: 14px;
  }

  .section-title {
    font-size: 16px;
  }

  .input-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .main-screen h3 {
    font-size: 18px;
  }

  .subtitle {
    font-size: 13px;
  }

  .demo-section {
    gap: 12px;
  }

  .section-title {
    font-size: 14px;
  }

  .input-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 12px;
  }

  .controls-wrapper button {
    font-size: 13px;
  }
}

.main-screen {
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 20px;
  background: linear-gradient(
    135deg,
    #f8f9fa 0%,
    #f0f2f5 100%
  );
}

.main-content {
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 20px;
}

.main-screen h3 {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: #0a0e27;
  line-height: 1.2;
}

@media (max-width: 768px) {
  .main-screen {
    padding: 12px;
  }

  .main-content {
    gap: 24px;
    padding: 12px;
  }

  .main-screen h3 {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .main-screen {
    padding: 8px;
  }

  .main-content {
    gap: 16px;
    padding: 8px;
  }

  .main-screen h3 {
    font-size: 20px;
  }
}

.controls-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 28px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.control-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.control-section p {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.controls-wrapper button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
  background-color: white;
  color: #374151;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  width: fit-content;
  min-height: 44px;
}

@media (max-width: 768px) {
  .controls-wrapper {
    gap: 12px;
    padding: 20px;
  }

  .controls-wrapper button {
    width: 100%;
    padding: 12px 16px;
  }
}

@media (max-width: 480px) {
  .controls-wrapper {
    gap: 12px;
    padding: 16px;
  }

  .controls-wrapper button {
    width: 100%;
    padding: 11px 16px;
    font-size: 14px;
  }
}

.controls-wrapper button:nth-child(2) {
  background-color: #fbbf24;
  color: #1f2937;
  border-color: #fbbf24;
  font-weight: 700;
}

.controls-wrapper button:nth-child(2):hover {
  background-color: #f59e0b;
  border-color: #f59e0b;
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.25);
}

.controls-wrapper button:nth-child(2):active {
  background-color: #d97706;
  border-color: #d97706;
}

.controls-wrapper button:hover {
  background-color: #f3f4f6;
  border-color: #9ca3af;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.controls-wrapper button:active {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.controls-wrapper button:focus {
  outline: 2px solid #3b82f6;
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
