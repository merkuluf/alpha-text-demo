<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import { Markdown } from '@tiptap/markdown'
import StarterKit from '@tiptap/starter-kit'
import ListItem from '@tiptap/extension-list-item'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import { ref, watch, onBeforeUnmount } from 'vue'
import LinkModal from './LinkModal.vue'

// По умолчанию схема listItem = "paragraph block*", т.е. элемент списка
// обязан начинаться с параграфа и заголовок туда не пускается.
// Расширяем content, чтобы первый блок мог быть и заголовком.
const ListItemWithHeading = ListItem.extend({
  content: '(paragraph | heading) block*',
})

// Кастомизируем Bold чтобы использовать *текст* (Jira формат)
const CustomBold = Bold.extend({
  renderMarkdown(node, helpers) {
    const content = helpers.renderChildren(node.content || [])
    return `*${content}*`
  },
})

// Кастомизируем Italic чтобы использовать _текст_ (Jira формат)
const CustomItalic = Italic.extend({
  renderMarkdown(node, helpers) {
    const content = helpers.renderChildren(node.content || [])
    return `_${content}_`
  },
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
const showLinkModal = ref(false)
const linkModalInitialUrl = ref('')
const viewMode = ref<'editor' | 'markdown'>('editor')
const markdownContent = ref('')
const markdownTextarea = ref<HTMLTextAreaElement | null>(null)

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      listItem: false,
      bold: false,  // Отключаем стандартный Bold
      italic: false // Отключаем стандартный Italic
    }),
    ListItemWithHeading,
    CustomBold,    // Используем кастомный Bold (__текст__)
    CustomItalic,  // Используем кастомный Italic (_текст_)
    Markdown
  ],
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
  markdownContent.value = ''
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

const applyCommand = (editorCommand: () => void, markdownCommand?: () => void) => {
  if (viewMode.value === 'markdown' && markdownCommand) {
    markdownCommand()
  } else {
    editorCommand()
  }
  openDropdown.value = null
}

const applyParagraph = () => applyCommand(() => editor.value?.commands.setParagraph())
const applyHeading1 = () => applyCommand(() => editor.value?.commands.toggleHeading({ level: 1 }), markdownHeading1)
const applyHeading2 = () => applyCommand(() => editor.value?.commands.toggleHeading({ level: 2 }), markdownHeading2)
const applyHeading3 = () => applyCommand(() => editor.value?.commands.toggleHeading({ level: 3 }), markdownHeading3)
const applyHeading4 = () => applyCommand(() => editor.value?.commands.toggleHeading({ level: 4 }), markdownHeading4)
const applyHeading5 = () => applyCommand(() => editor.value?.commands.toggleHeading({ level: 5 }), markdownHeading5)
const applyBulletList = () => applyCommand(() => editor.value?.commands.toggleBulletList(), markdownBulletList)
const applyOrderedList = () => applyCommand(() => editor.value?.commands.toggleOrderedList(), markdownOrderedList)

const toggleLink = () => {
  if (!editor.value) return
  linkModalInitialUrl.value = editor.value.getAttributes('link').href ?? ''
  showLinkModal.value = true
}

const handleLinkConfirm = (url: string) => {
  showLinkModal.value = false
  if (!editor.value) return
  if (url === '') {
    editor.value.commands.unsetLink()
    return
  }
  editor.value.commands.setLink({ href: url })
  editor.value.commands.focus()
}

const handleLinkDelete = () => {
  showLinkModal.value = false
  if (!editor.value) return
  editor.value.commands.unsetLink()
  editor.value.commands.focus()
  linkModalInitialUrl.value = ''
}

const handleLinkCancel = () => {
  showLinkModal.value = false
  linkModalInitialUrl.value = ''
}

// Функции для работы с markdown в режиме текста
const wrapMarkdownSelection = (before: string, after: string = before) => {
  if (!markdownTextarea.value) return

  const textarea = markdownTextarea.value
  let start = textarea.selectionStart
  let end = textarea.selectionEnd
  const text = markdownContent.value
  let selectedText = text.substring(start, end)

  if (!selectedText) return

  // Проверяем есть ли уже форматирование (могут быть символы до и после выделения)
  const beforeMatch = before.length > 0 && text.substring(Math.max(0, start - before.length), start) === before
  const afterMatch = after.length > 0 && text.substring(end, end + after.length) === after

  if (beforeMatch && afterMatch) {
    // Если форматирование уже есть вокруг текста - удаляем (toggle)
    const newStart = start - before.length
    const newEnd = end + after.length
    const newText = text.substring(0, newStart) + selectedText + text.substring(newEnd)
    markdownContent.value = newText

    // Выделяем только исходный текст (без символов)
    setTimeout(() => {
      textarea.selectionStart = newStart
      textarea.selectionEnd = newStart + selectedText.length
      textarea.focus()
    }, 0)
  } else if (selectedText.startsWith(before) && selectedText.endsWith(after)) {
    // Если форматирование уже в самом выделенном тексте - удаляем
    selectedText = selectedText.substring(before.length, selectedText.length - after.length)
    const newText = text.substring(0, start) + selectedText + text.substring(end)
    markdownContent.value = newText

    setTimeout(() => {
      textarea.selectionStart = start
      textarea.selectionEnd = start + selectedText.length
      textarea.focus()
    }, 0)
  } else {
    // Иначе добавляем форматирование
    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end)
    markdownContent.value = newText

    // Выделяем текст ВМЕ СТЕ С символами форматирования
    setTimeout(() => {
      textarea.selectionStart = start
      textarea.selectionEnd = start + before.length + selectedText.length + after.length
      textarea.focus()
    }, 0)
  }
}

const markdownBold = () => wrapMarkdownSelection('*', '*')
const markdownItalic = () => wrapMarkdownSelection('_', '_')
const markdownUnderline = () => wrapMarkdownSelection('+', '+')
const markdownStrike = () => wrapMarkdownSelection('-', '-')
const markdownCode = () => wrapMarkdownSelection('{{', '}}')
const applyHeadingLevel = (level: number) => {
  if (!markdownTextarea.value) return
  const textarea = markdownTextarea.value
  const start = textarea.selectionStart

  let lineStart = markdownContent.value.lastIndexOf('\n', start - 1)
  lineStart = lineStart === -1 ? 0 : lineStart + 1
  let lineEnd = markdownContent.value.indexOf('\n', start)
  lineEnd = lineEnd === -1 ? markdownContent.value.length : lineEnd

  let line = markdownContent.value.substring(lineStart, lineEnd)
  const jiraHeading = `h${level}. `

  // Проверяем есть ли уже такой же уровень заголовка
  if (line.startsWith(jiraHeading)) {
    // Если есть - убираем (toggle)
    line = line.substring(jiraHeading.length)
  } else {
    // Иначе удаляем существующий заголовок и добавляем новый
    line = line.replace(/^h[1-5]\.\s*/, '')
    line = jiraHeading + line
  }

  const newText = markdownContent.value.substring(0, lineStart) + line + markdownContent.value.substring(lineEnd)
  markdownContent.value = newText

  setTimeout(() => {
    textarea.focus()
  }, 0)
}

const markdownHeading1 = () => applyHeadingLevel(1)

const markdownBulletList = () => {
  if (!markdownTextarea.value) return
  const textarea = markdownTextarea.value
  const start = textarea.selectionStart

  let lineStart = markdownContent.value.lastIndexOf('\n', start - 1)
  lineStart = lineStart === -1 ? 0 : lineStart + 1
  let lineEnd = markdownContent.value.indexOf('\n', start)
  lineEnd = lineEnd === -1 ? markdownContent.value.length : lineEnd

  let line = markdownContent.value.substring(lineStart, lineEnd)

  if (line.match(/^\s*\*\s/)) {
    // Если уже bullet list - убираем
    line = line.replace(/^\s*\*\s+/, '')
  } else {
    // Иначе удаляем другие префиксы и добавляем * (Jira формат)
    line = line.replace(/^(\s*)(\*+|#+|\d+\.)\s+/, '$1')
    line = '* ' + line
  }

  const newText = markdownContent.value.substring(0, lineStart) + line + markdownContent.value.substring(lineEnd)
  markdownContent.value = newText

  setTimeout(() => {
    textarea.focus()
  }, 0)
}

const markdownOrderedList = () => {
  if (!markdownTextarea.value) return
  const textarea = markdownTextarea.value
  const start = textarea.selectionStart

  let lineStart = markdownContent.value.lastIndexOf('\n', start - 1)
  lineStart = lineStart === -1 ? 0 : lineStart + 1
  let lineEnd = markdownContent.value.indexOf('\n', start)
  lineEnd = lineEnd === -1 ? markdownContent.value.length : lineEnd

  let line = markdownContent.value.substring(lineStart, lineEnd)

  if (line.match(/^\s*#\s/)) {
    // Если уже ordered list - убираем
    line = line.replace(/^\s*#\s+/, '')
  } else {
    // Иначе удаляем другие префиксы и добавляем # (Jira формат)
    line = line.replace(/^(\s*)(\*+|#+|\d+\.)\s+/, '$1')
    line = '# ' + line
  }

  const newText = markdownContent.value.substring(0, lineStart) + line + markdownContent.value.substring(lineEnd)
  markdownContent.value = newText

  setTimeout(() => {
    textarea.focus()
  }, 0)
}

const markdownHeading2 = () => applyHeadingLevel(2)
const markdownHeading3 = () => applyHeadingLevel(3)
const markdownHeading4 = () => applyHeadingLevel(4)
const markdownHeading5 = () => applyHeadingLevel(5)

const markdownBlockquote = () => {
  if (!markdownTextarea.value) return
  const textarea = markdownTextarea.value
  const start = textarea.selectionStart

  let lineStart = markdownContent.value.lastIndexOf('\n', start - 1)
  lineStart = lineStart === -1 ? 0 : lineStart + 1
  let lineEnd = markdownContent.value.indexOf('\n', start)
  lineEnd = lineEnd === -1 ? markdownContent.value.length : lineEnd

  let line = markdownContent.value.substring(lineStart, lineEnd)

  if (line.startsWith('bq. ')) {
    // Если уже цитата - убираем (Jira формат)
    line = line.substring(4)
  } else {
    // Иначе добавляем (Jira формат)
    line = 'bq. ' + line
  }

  const newText = markdownContent.value.substring(0, lineStart) + line + markdownContent.value.substring(lineEnd)
  markdownContent.value = newText

  setTimeout(() => {
    textarea.focus()
  }, 0)
}

const markdownCodeBlock = () => {
  if (!markdownTextarea.value) return
  const textarea = markdownTextarea.value
  const start = textarea.selectionStart
  const text = markdownContent.value

  // Добавляем блок кода в Jira формате
  const newText = text.substring(0, start) + '{code}\n\n{code}\n' + text.substring(start)
  markdownContent.value = newText

  setTimeout(() => {
    textarea.selectionStart = start + 7
    textarea.selectionEnd = start + 7
    textarea.focus()
  }, 0)
}

const markdownHorizontalRule = () => {
  if (!markdownTextarea.value) return
  const textarea = markdownTextarea.value
  const start = textarea.selectionStart

  let lineStart = markdownContent.value.lastIndexOf('\n', start - 1)
  lineStart = lineStart === -1 ? 0 : lineStart + 1

  // В Jira для горизонтальной линии используется ----
  const newText = markdownContent.value.substring(0, lineStart) + '----\n' + markdownContent.value.substring(lineStart)
  markdownContent.value = newText

  setTimeout(() => {
    textarea.focus()
  }, 0)
}

// Конвертация Jira формата в стандартный markdown для Tiptap
const jiraToMarkdown = (jira: string): string => {
  let result = jira

  // Заголовки: h1. → #, h2. → ##, и т.д.
  result = result.replace(/^h1\.\s+/gm, '# ')
  result = result.replace(/^h2\.\s+/gm, '## ')
  result = result.replace(/^h3\.\s+/gm, '### ')
  result = result.replace(/^h4\.\s+/gm, '#### ')
  result = result.replace(/^h5\.\s+/gm, '##### ')

  // Блок кода: {code}...{code} → ```...```
  result = result.replace(/\{code(?::.*?)?\}/g, '```')

  // Цитата: bq. → >
  result = result.replace(/^bq\.\s+/gm, '> ')

  // Форматирование текста - комбинированные ПЕРВЫМИ
  // Жирный курсив: *_текст_* → ***текст***
  result = result.replace(/\*_(.+?)_\*/g, '***$1***')
  result = result.replace(/_\*(.+?)\*_/g, '***$1***')

  // Просто жирный: *текст* → **текст**
  result = result.replace(/\*(.+?)\*/g, '**$1**')

  // Просто курсив: _текст_ → *текст*
  result = result.replace(/_(.+?)_/g, '*$1*')

  // Зачеркивание: -текст- → ~~текст~~
  result = result.replace(/-(.+?)-/g, '~~$1~~')

  // Подчеркивание: +текст+ → __текст__
  result = result.replace(/\+(.+?)\+/g, '__$1__')

  // Код: {{текст}} → `текст`
  result = result.replace(/\{\{(.+?)\}\}/g, '`$1`')

  // Списки: # → 1. (нумерованный), * остается как есть
  result = result.replace(/^#\s+/gm, '1. ')
  result = result.replace(/^##\s+/gm, '   1. ')

  return result
}

// Конвертация стандартного markdown обратно в Jira формат
const markdownToJira = (markdown: string): string => {
  let result = markdown

  // Заголовки: # → h1., ## → h2., и т.д.
  result = result.replace(/^##### /gm, 'h5. ')
  result = result.replace(/^#### /gm, 'h4. ')
  result = result.replace(/^### /gm, 'h3. ')
  result = result.replace(/^## /gm, 'h2. ')
  result = result.replace(/^# /gm, 'h1. ')

  // Блок кода: ```...``` → {code}...{code}
  result = result.replace(/```/g, '{code}')

  // Цитата: > → bq.
  result = result.replace(/^> /gm, 'bq. ')

  // Форматирование текста - комбинированные ПЕРВЫМИ
  // Жирный курсив: ***текст*** → *_текст_*
  result = result.replace(/\*\*\*(.+?)\*\*\*/g, '*_$1_*')

  // Просто жирный: **текст** → *текст*
  result = result.replace(/\*\*(.+?)\*\*/g, '*$1*')

  // Просто курсив: *текст* → _текст_
  result = result.replace(/\*(.+?)\*/g, '_$1_')

  // Зачеркивание: ~~текст~~ → -текст-
  result = result.replace(/~~(.+?)~~/g, '-$1-')

  // Подчеркивание: __текст__ → +текст+
  result = result.replace(/__(.+?)__/g, '+$1+')

  // Код: `текст` → {{текст}}
  result = result.replace(/`(.+?)`/g, '{{$1}}')

  // Нумерованные списки: 1. → #
  result = result.replace(/^1\. /gm, '# ')
  result = result.replace(/^   1\. /gm, '## ')

  return result
}

watch(
  () => viewMode.value,
  (newMode) => {
    if (newMode === 'markdown') {
      // Переходим в markdown режим
      // getMarkdown() выдает Jira формат благодаря CustomBold и CustomItalic
      markdownContent.value = editor.value?.getMarkdown() ?? ''
    } else {
      // Переходим в визуальный режим
      if (editor.value) {
        // markdownContent содержит Jira формат, нужно конвертировать в стандартный markdown
        const markdownFormatted = jiraToMarkdown(markdownContent.value)
        editor.value.commands.setContent(markdownFormatted, { contentType: 'markdown' })
      }
    }
  }
)

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
  <LinkModal
    :is-open="showLinkModal"
    :initial-url="linkModalInitialUrl"
    @confirm="handleLinkConfirm"
    @delete="handleLinkDelete"
    @cancel="handleLinkCancel"
  />
  <div class="tiptap-editor-wrapper">
    <div class="tiptap-toolbar">
      <!-- Text Style Dropdown -->
      <div v-if="toolbarItems.includes('textStyle')" class="toolbar-dropdown">
        <button
          class="dropdown-toggle"
          @click="openDropdown = openDropdown === 'textStyle' ? null : 'textStyle'"
        >
          <span class="dropdown-label">Стиль</span>
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
            <span class="style-preview">Обычный текст</span>
          </button>
          <button
            class="dropdown-item"
            :class="{ 'is-active': editor?.isActive('heading', { level: 1 }) }"
            @click="applyHeading1"
          >
            <span class="style-preview style-h1">Заголовок 1</span>
          </button>
          <button
            class="dropdown-item"
            :class="{ 'is-active': editor?.isActive('heading', { level: 2 }) }"
            @click="applyHeading2"
          >
            <span class="style-preview style-h2">Заголовок 2</span>
          </button>
          <button
            class="dropdown-item"
            :class="{ 'is-active': editor?.isActive('heading', { level: 3 }) }"
            @click="applyHeading3"
          >
            <span class="style-preview style-h3">Заголовок 3</span>
          </button>
          <button
            class="dropdown-item"
            :class="{ 'is-active': editor?.isActive('heading', { level: 4 }) }"
            @click="applyHeading4"
          >
            <span class="style-preview style-h4">Заголовок 4</span>
          </button>
          <button
            class="dropdown-item"
            :class="{ 'is-active': editor?.isActive('heading', { level: 5 }) }"
            @click="applyHeading5"
          >
            <span class="style-preview style-h5">Заголовок 5</span>
          </button>
        </div>
      </div>

      <!-- Formatting Buttons -->
      <button
        v-if="toolbarItems.includes('bold')"
        :class="{ 'is-active': viewMode === 'editor' ? editor?.isActive('bold') : false }"
        @click="viewMode === 'markdown' ? markdownBold() : editor?.commands.toggleBold()"
        :title="'Жирный (Ctrl+B)'"
      >
        <strong>B</strong>
      </button>
      <button
        v-if="toolbarItems.includes('italic')"
        :class="{ 'is-active': viewMode === 'editor' ? editor?.isActive('italic') : false }"
        @click="viewMode === 'markdown' ? markdownItalic() : editor?.commands.toggleItalic()"
        :title="'Курсив (Ctrl+I)'"
      >
        <em>I</em>
      </button>
      <button
        v-if="toolbarItems.includes('underline')"
        :class="{ 'is-active': viewMode === 'editor' ? editor?.isActive('underline') : false }"
        @click="viewMode === 'markdown' ? markdownUnderline() : editor?.commands.toggleUnderline()"
        :title="'Подчёркнутый (Ctrl+U)'"
      >
        <u>U</u>
      </button>
      <button
        v-if="toolbarItems.includes('strike')"
        :class="{ 'is-active': viewMode === 'editor' ? editor?.isActive('strike') : false }"
        @click="viewMode === 'markdown' ? markdownStrike() : editor?.commands.toggleStrike()"
        :title="'Зачеркивание'"
      >
        <s>S</s>
      </button>
      <button
        v-if="toolbarItems.includes('code')"
        :class="{ 'is-active': viewMode === 'editor' ? editor?.isActive('code') : false }"
        @click="viewMode === 'markdown' ? markdownCode() : editor?.commands.toggleCode()"
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
          <span class="dropdown-label">Списки</span>
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
        :class="{ 'is-active': viewMode === 'editor' ? editor?.isActive('blockquote') : false }"
        @click="viewMode === 'markdown' ? markdownBlockquote() : editor?.commands.toggleBlockquote()"
        :title="'Блок цитаты'"
        class="hide-on-mobile"
      >
        "
      </button>
      <button
        v-if="toolbarItems.includes('codeBlock')"
        :class="{ 'is-active': viewMode === 'editor' ? editor?.isActive('codeBlock') : false }"
        @click="viewMode === 'markdown' ? markdownCodeBlock() : editor?.commands.toggleCodeBlock()"
        :title="'Блок кода'"
      >
        <code class="code-glyph">{ }</code>
      </button>

      <div class="toolbar-divider"></div>

      <button
        v-if="toolbarItems.includes('horizontalRule')"
        @click="viewMode === 'markdown' ? markdownHorizontalRule() : editor?.commands.setHorizontalRule()"
        :title="'Горизонтальная линия'"
        class="hide-on-mobile"
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
        class="hide-on-mobile"
      >
        ↶
      </button>
      <button
        v-if="toolbarItems.includes('redo')"
        :disabled="!editor?.can().redo()"
        :title="'Повторить (Ctrl+Y)'"
        class="hide-on-mobile"
      >
        ↷
      </button>

      <div class="toolbar-divider"></div>

      <div class="view-mode-toggle">
        <button
          @click="viewMode = 'markdown'"
          :class="{ 'is-active': viewMode === 'markdown' }"
          title="Markdown просмотр"
        >
          Текст
        </button>
        <button
          @click="viewMode = 'editor'"
          :class="{ 'is-active': viewMode === 'editor' }"
          title="Визуальный просмотр"
        >
          Визуально
        </button>
      </div>
    </div>

    <div v-if="viewMode === 'editor'" class="tiptap-editor-content" @mousedown="focusEditor">
      <EditorContent :editor="editor" />
    </div>
    <div v-else class="markdown-view">
      <textarea
        ref="markdownTextarea"
        v-model="markdownContent"
        class="markdown-textarea"
        placeholder="Markdown..."
      ></textarea>
    </div>
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

  .hide-on-mobile {
    display: none !important;
  }

  .toolbar-divider {
    display: none !important;
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

/* Disable link clicks when editing */
:deep(.ProseMirror a) {
  pointer-events: none;
}

/* Style preview sizes */
.style-preview {
  display: inline-block;
}

.style-h1 {
  font-size: 1.8em;
  font-weight: 700;
}

.style-h2 {
  font-size: 1.5em;
  font-weight: 700;
}

.style-h3 {
  font-size: 1.2em;
  font-weight: 700;
}

.style-h4 {
  font-size: 1.05em;
  font-weight: 700;
}

.style-h5 {
  font-size: 0.95em;
  font-weight: 700;
}

.markdown-view {
  flex: 1;
  display: flex;
  overflow: hidden;
  background: white;
  border-radius: 0 0 12px 12px;
}

.markdown-textarea {
  flex: 1;
  padding: 16px;
  font-family: 'Courier New', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.6;
  border: none;
  outline: none;
  resize: none;
  background: white;
  color: #1f2937;
  overflow-y: auto;
  overflow-x: auto;
}

@media (max-width: 768px) {
  .markdown-textarea {
    font-size: 13px;
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .markdown-textarea {
    font-size: 12px;
    padding: 10px;
  }
}

.markdown-textarea::placeholder {
  color: #9ca3af;
}

.view-mode-toggle {
  display: inline-flex;
  gap: 0;
  background: #f3f4f6;
  padding: 2px;
  border-radius: 8px;
  border: 1.5px solid #d1d5db;
}

.view-mode-toggle button {
  flex: 1;
  min-width: auto;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.view-mode-toggle button:hover:not(.is-active) {
  color: #374151;
}

.view-mode-toggle button.is-active {
  background-color: white;
  color: #1f2937;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

@media (max-width: 768px) {
  .view-mode-toggle button {
    padding: 5px 10px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .view-mode-toggle {
    gap: 1px;
  }

  .view-mode-toggle button {
    padding: 4px 8px;
    font-size: 11px;
  }
}
</style>
