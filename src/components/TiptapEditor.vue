<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import { Markdown } from '@tiptap/markdown'
import StarterKit from '@tiptap/starter-kit'
import ListItem from '@tiptap/extension-list-item'
import { ref, watch, onBeforeUnmount } from 'vue'

// По умолчанию схема listItem = "paragraph block*", т.е. элемент списка
// обязан начинаться с параграфа и заголовок туда не пускается.
// Расширяем content, чтобы первый блок мог быть и заголовком.
const ListItemWithHeading = ListItem.extend({
  content: '(paragraph | heading) block*',
})

interface Props {
  modelValue?: string
  toolbarItems?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  toolbarItems: () => [
    'textStyle',
    'bold',
    'italic',
    'underline',
    'strike',
    'code',
    'link',
    'lists',
    'blockquote',
    'codeBlock',
    'horizontalRule',
    'hardBreak',
    'undo',
    'redo',
  ],
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const openDropdown = ref<string | null>(null)

const editor = useEditor({
  extensions: [StarterKit.configure({ listItem: false }), ListItemWithHeading, Markdown],
  content: props.modelValue,
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

watch(
  () => props.modelValue,
  (newValue) => {
    if (editor && editor.value && newValue !== editor.value.getHTML()) {
      editor.value.commands.setContent(newValue)
    }
  },
  { immediate: false },
)

const getHTML = () => editor.value?.getHTML() ?? ''
const getText = () => editor.value?.getText() ?? ''
const getJSON = () => editor.value?.getJSON() ?? null
const getMarkdown = () => editor.value?.getMarkdown() ?? ''
const setContent = (html: string) => {
  if (editor.value) {
    editor.value.commands.setContent(html)
  }
}
const clearContent = () => {
  if (editor.value) {
    editor.value.commands.clearContent(true)
  }
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.toolbar-dropdown')) {
    openDropdown.value = null
  }
}

onBeforeUnmount(() => {
  editor.value?.destroy()
  document.removeEventListener('click', handleClickOutside)
})

watch(
  () => openDropdown.value,
  (newVal) => {
    if (newVal) {
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside)
      }, 0)
    } else {
      document.removeEventListener('click', handleClickOutside)
    }
  },
)

const applyCommand = (command: () => void) => {
  command()
  openDropdown.value = null
}

const applyParagraph = () => applyCommand(() => editor.value?.commands.setParagraph())
const applyHeading1 = () => applyCommand(() => editor.value?.commands.toggleHeading({ level: 1 }))
const applyHeading2 = () => applyCommand(() => editor.value?.commands.toggleHeading({ level: 2 }))
const applyHeading3 = () => applyCommand(() => editor.value?.commands.toggleHeading({ level: 3 }))
const applyBulletList = () => applyCommand(() => editor.value?.commands.toggleBulletList())
const applyOrderedList = () => applyCommand(() => editor.value?.commands.toggleOrderedList())

const toggleLink = () => {
  if (!editor.value) return
  if (editor.value.isActive('link')) {
    editor.value.commands.unsetLink()
    return
  }
  const previous = editor.value.getAttributes('link').href ?? ''
  const url = window.prompt('Введите ссылку:', previous)
  if (url === null) return
  if (url === '') {
    editor.value.commands.unsetLink()
    return
  }
  editor.value.commands.setLink({ href: url })
}

// Клик в любом месте области ввода переводит в режим набора текста.
const focusEditor = (event: MouseEvent) => {
  if (!editor.value || editor.value.isFocused) return
  // Фокусим только когда клик пришёлся на контейнер/отступ, а не на сам текст,
  // чтобы не сбивать позицию каретки при обычном клике по содержимому.
  const target = event.target as HTMLElement
  if (target.closest('.ProseMirror')) return
  editor.value.commands.focus('end')
}

defineExpose({
  getHTML,
  getText,
  getJSON,
  getMarkdown,
  setContent,
  clearContent,
  editor,
})
</script>

<template>
  <div class="tiptap-editor-wrapper">
    <div class="tiptap-toolbar">
      <!-- Text Style Dropdown -->
      <div v-if="toolbarItems.includes('textStyle')" class="toolbar-dropdown">
        <button
          class="dropdown-toggle"
          @click="openDropdown = openDropdown === 'textStyle' ? null : 'textStyle'"
        >
          <span class="dropdown-label">
            {{
              editor?.isActive('heading', { level: 1 })
                ? 'Заголовок 1'
                : editor?.isActive('heading', { level: 2 })
                  ? 'Заголовок 2'
                  : editor?.isActive('heading', { level: 3 })
                    ? 'Заголовок 3'
                    : 'Обычный текст'
            }}
          </span>
          <span class="dropdown-arrow">▼</span>
        </button>
        <div v-if="openDropdown === 'textStyle'" class="dropdown-menu">
          <button
            class="dropdown-item"
            :class="{
              'is-active': !editor?.isActive('heading') && !editor?.isActive('blockquote'),
            }"
            @click="applyParagraph"
          >
            Обычный текст
          </button>
          <button
            class="dropdown-item"
            :class="{ 'is-active': editor?.isActive('heading', { level: 1 }) }"
            @click="applyHeading1"
          >
            Заголовок 1
          </button>
          <button
            class="dropdown-item"
            :class="{ 'is-active': editor?.isActive('heading', { level: 2 }) }"
            @click="applyHeading2"
          >
            Заголовок 2
          </button>
          <button
            class="dropdown-item"
            :class="{ 'is-active': editor?.isActive('heading', { level: 3 }) }"
            @click="applyHeading3"
          >
            Заголовок 3
          </button>
        </div>
      </div>

      <!-- Formatting Buttons -->
      <button
        v-if="toolbarItems.includes('bold')"
        :class="{ 'is-active': editor?.isActive('bold') }"
        @click="editor?.commands.toggleBold()"
        :title="'Жирный (Ctrl+B)'"
      >
        <strong>B</strong>
      </button>
      <button
        v-if="toolbarItems.includes('italic')"
        :class="{ 'is-active': editor?.isActive('italic') }"
        @click="editor?.commands.toggleItalic()"
        :title="'Курсив (Ctrl+I)'"
      >
        <em>I</em>
      </button>
      <button
        v-if="toolbarItems.includes('underline')"
        :class="{ 'is-active': editor?.isActive('underline') }"
        @click="editor?.commands.toggleUnderline()"
        :title="'Подчёркнутый (Ctrl+U)'"
      >
        <u>U</u>
      </button>
      <button
        v-if="toolbarItems.includes('strike')"
        :class="{ 'is-active': editor?.isActive('strike') }"
        @click="editor?.commands.toggleStrike()"
        :title="'Зачеркивание'"
      >
        <s>S</s>
      </button>
      <button
        v-if="toolbarItems.includes('code')"
        :class="{ 'is-active': editor?.isActive('code') }"
        @click="editor?.commands.toggleCode()"
        :title="'Встроенный код (Ctrl+E)'"
      >
        <code class="code-glyph">&lt;/&gt;</code>
      </button>
      <button
        v-if="toolbarItems.includes('link')"
        :class="{ 'is-active': editor?.isActive('link') }"
        @click="toggleLink()"
        :title="'Ссылка'"
      >
        🔗
      </button>

      <div class="toolbar-divider"></div>

      <!-- Lists Dropdown -->
      <div v-if="toolbarItems.includes('lists')" class="toolbar-dropdown">
        <button
          class="dropdown-toggle"
          :title="'Списки'"
          @click="openDropdown = openDropdown === 'lists' ? null : 'lists'"
        >
          <span class="dropdown-label">
            {{
              editor?.isActive('bulletList') ? '◆' : editor?.isActive('orderedList') ? '1.' : '≡'
            }}
          </span>
          <span class="dropdown-arrow">▼</span>
        </button>
        <div v-if="openDropdown === 'lists'" class="dropdown-menu">
          <button
            class="dropdown-item"
            :class="{ 'is-active': editor?.isActive('bulletList') }"
            @click="applyBulletList"
          >
            Маркированный список
          </button>
          <button
            class="dropdown-item"
            :class="{ 'is-active': editor?.isActive('orderedList') }"
            @click="applyOrderedList"
          >
            Нумерованный список
          </button>
        </div>
      </div>

      <button
        v-if="toolbarItems.includes('blockquote')"
        :class="{ 'is-active': editor?.isActive('blockquote') }"
        @click="editor?.commands.toggleBlockquote()"
        :title="'Блок цитаты'"
      >
        "
      </button>
      <button
        v-if="toolbarItems.includes('codeBlock')"
        :class="{ 'is-active': editor?.isActive('codeBlock') }"
        @click="editor?.commands.toggleCodeBlock()"
        :title="'Блок кода'"
      >
        <code class="code-glyph">{ }</code>
      </button>

      <div class="toolbar-divider"></div>

      <button
        v-if="toolbarItems.includes('horizontalRule')"
        @click="editor?.commands.setHorizontalRule()"
        :title="'Горизонтальная линия'"
      >
        ─
      </button>
      <button
        v-if="toolbarItems.includes('hardBreak')"
        @click="editor?.commands.setHardBreak()"
        :title="'Перенос строки (Shift+Enter)'"
      >
        ↵
      </button>

      <div class="toolbar-divider"></div>

      <button
        v-if="toolbarItems.includes('undo')"
        :disabled="!editor?.can().undo()"
        @click="editor?.commands.undo()"
        :title="'Отменить (Ctrl+Z)'"
      >
        ↶
      </button>
      <button
        v-if="toolbarItems.includes('redo')"
        :disabled="!editor?.can().redo()"
        @click="editor?.commands.redo()"
        :title="'Повторить (Ctrl+Y)'"
      >
        ↷
      </button>
    </div>

    <EditorContent :editor="editor" class="tiptap-editor-content" @mousedown="focusEditor" />
  </div>
</template>

<style scoped>
.tiptap-editor-wrapper {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  position: relative;
  width: 100%;
  height: 400px;
  display: flex;
  flex-direction: column;
  border: none;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  resize: vertical;
}

.tiptap-editor-wrapper::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 0 0 12px 0;
  pointer-events: none;
  z-index: 100;
  display: block;
}

.tiptap-toolbar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 12px 12px 0 0;
  background: #f9fafb;
  flex-wrap: wrap;
  position: relative;
  z-index: 10;
  overflow: visible;
  min-height: 56px;
}

@media (max-width: 768px) {
  .tiptap-editor-wrapper {
    height: 350px;
    border-radius: 10px;
  }

  .tiptap-toolbar {
    gap: 4px;
    padding: 8px 10px;
    border-radius: 10px 10px 0 0;
    min-height: 48px;
  }
}

@media (max-width: 480px) {
  .tiptap-editor-wrapper {
    height: 300px;
    border-radius: 8px;
  }

  .tiptap-toolbar {
    gap: 3px;
    padding: 6px 8px;
    border-radius: 8px 8px 0 0;
    min-height: 44px;
  }
}

/* Базовая кнопка тулбара — компактная иконка */
.tiptap-toolbar button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  font-size: 14px;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #374151;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

@media (max-width: 768px) {
  .tiptap-toolbar button {
    min-width: 32px;
    height: 32px;
    padding: 0 8px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .tiptap-toolbar button {
    min-width: 28px;
    height: 28px;
    padding: 0 6px;
    font-size: 11px;
  }
}

.tiptap-toolbar button:hover:not(:disabled) {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

.tiptap-toolbar button:active:not(:disabled) {
  background-color: #e5e7eb;
}

/* Активное состояние — жёлтое, как акцентные кнопки приложения */
.tiptap-toolbar button.is-active {
  background-color: #fbbf24;
  border-color: #fbbf24;
  color: #1f2937;
  font-weight: 700;
}

.tiptap-toolbar button.is-active:hover:not(:disabled) {
  background-color: #f59e0b;
  border-color: #f59e0b;
}

.tiptap-toolbar button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: #e0e0e0;
  margin: 0 4px;
}

.toolbar-dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-toggle {
  gap: 6px;
  white-space: nowrap;
}

.dropdown-arrow {
  font-size: 9px;
  opacity: 0.55;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 100%;
  width: max-content;
  padding: 6px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
}

.dropdown-menu .dropdown-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  min-width: 100%;
  height: auto;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #374151;
  text-align: left;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.3;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.dropdown-menu .dropdown-item:hover:not(:disabled) {
  background-color: #f3f4f6;
}

.dropdown-menu .dropdown-item.is-active {
  background-color: #fbbf24;
  color: #1f2937;
  font-weight: 700;
}

.dropdown-menu .dropdown-item.is-active:hover:not(:disabled) {
  background-color: #f59e0b;
}

/* Глиф моноширинного кода в кнопках тулбара */
.code-glyph {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  background: none;
  padding: 0;
}

.tiptap-editor-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  background: white;
  color: #1f2937;
  border-radius: 0 0 12px 12px;
  cursor: text;
}

/* Tiptap default styles */
:deep(.ProseMirror) {
  flex: 1;
  outline: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  padding: 16px;
  color: #1f2937;
}

@media (max-width: 768px) {
  :deep(.ProseMirror) {
    font-size: 13px;
    padding: 12px;
  }
}

@media (max-width: 480px) {
  :deep(.ProseMirror) {
    font-size: 12px;
    padding: 10px;
  }
}

:deep(.ProseMirror p) {
  margin: 1em 0;
}

:deep(.ProseMirror h1),
:deep(.ProseMirror h2),
:deep(.ProseMirror h3) {
  font-weight: 700;
  margin: 1.5em 0 0.5em 0;
}

:deep(.ProseMirror h1) {
  font-size: 2em;
}

:deep(.ProseMirror h2) {
  font-size: 1.5em;
}

:deep(.ProseMirror h3) {
  font-size: 1.2em;
}

:deep(.ProseMirror ul),
:deep(.ProseMirror ol) {
  padding-left: 2em;
  margin: 1em 0;
}

:deep(.ProseMirror blockquote) {
  border-left: 4px solid #0076ff;
  padding-left: 1em;
  margin-left: 0;
  color: #666;
  font-style: italic;
}

:deep(.ProseMirror code) {
  background: #f4f4f4;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

:deep(.ProseMirror pre) {
  background: #f4f4f4;
  padding: 1em;
  border-radius: 4px;
  overflow-x: auto;
  margin: 1em 0;
}

:deep(.ProseMirror pre code) {
  background: transparent;
  padding: 0;
  border-radius: 0;
}

:deep(.ProseMirror hr) {
  border: none;
  border-top: 2px solid #e0e0e0;
  margin: 2em 0;
}
</style>
