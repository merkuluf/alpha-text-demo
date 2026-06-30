# Руководство по реализации NPM пакета

## 🚀 Quick Start

Следуй этим шагам чтобы превратить текущий проект в NPM пакет.

## Шаг 1: Подготовка файловой структуры

```bash
# Создай папку для пакета в отдельном репозитории или локально
mkdir @alpha/text-editor
cd @alpha/text-editor

# Или если хочешь держать в текущем проекте
mkdir packages/text-editor
```

## Шаг 2: Скопируй компоненты

```bash
packages/text-editor/
├── src/
│   ├── components/
│   │   ├── TiptapEditor.vue
│   │   ├── ResponsiveInput.vue
│   │   └── index.ts              # ← новый файл
│   ├── types/
│   │   ├── editor.ts             # ← новый файл
│   │   ├── input.ts              # ← новый файл
│   │   └── index.ts              # ← новый файл
│   ├── utils/
│   │   ├── validators.ts         # ← новый файл
│   │   └── index.ts              # ← новый файл
│   ├── styles/
│   │   └── index.css             # ← новый файл (если нужны глобальные стили)
│   └── index.ts                  # ← главная точка входа
├── package.json                  # ← новый файл
├── vite.config.ts                # ← новый файл
├── tsconfig.json                 # ← новый файл
├── README.md                      # ← новый файл
└── LICENSE                        # ← новый файл (MIT)
```

## Шаг 3: Создай package.json

```json
{
  "name": "@alpha/text-editor",
  "version": "0.1.0",
  "description": "Vue 3 text editor and input components",
  "type": "module",
  "main": "./dist/alpha-text-editor.umd.cjs",
  "module": "./dist/alpha-text-editor.es.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/alpha-text-editor.es.js",
      "require": "./dist/alpha-text-editor.umd.cjs",
      "types": "./dist/index.d.ts"
    },
    "./components": {
      "import": "./dist/components/index.js",
      "require": "./dist/components/index.cjs",
      "types": "./dist/components/index.d.ts"
    },
    "./types": {
      "import": "./dist/types/index.js",
      "require": "./dist/types/index.cjs",
      "types": "./dist/types/index.d.ts"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "vue-tsc --build && vite build",
    "preview": "vite preview",
    "type-check": "vue-tsc --noEmit",
    "lint": "eslint . --fix"
  },
  "peerDependencies": {
    "vue": "^3.0.0",
    "@tiptap/vue-3": "^3.0.0",
    "@tiptap/starter-kit": "^3.0.0"
  },
  "peerDependenciesOptional": {
    "@tiptap/vue-3": true,
    "@tiptap/starter-kit": true
  },
  "devDependencies": {
    "@types/node": "^24.13.2",
    "@vitejs/plugin-vue": "^6.0.7",
    "@vue/tsconfig": "^0.9.1",
    "typescript": "~6.0.0",
    "vite": "^8.0.16",
    "vue": "^3.5.38",
    "vue-tsc": "^3.3.5",
    "@tiptap/vue-3": "^3.27.1",
    "@tiptap/starter-kit": "^3.27.1",
    "@tiptap/extension-list-item": "^3.27.1",
    "@tiptap/markdown": "^3.27.1"
  },
  "keywords": [
    "vue",
    "vue3",
    "text-editor",
    "tiptap",
    "rich-text",
    "input",
    "responsive"
  ],
  "author": "Your Name",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/alpha-text-editor.git"
  },
  "homepage": "https://github.com/yourusername/alpha-text-editor"
}
```

## Шаг 4: Создай vite.config.ts

```typescript
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AlphaTextEditor',
      fileName: (format) => `alpha-text-editor.${format === 'es' ? 'es.js' : format === 'umd' ? 'umd.cjs' : 'js'}`,
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
```

## Шаг 5: Создай src/types/editor.ts

```typescript
export type ToolbarItem =
  | 'textStyle'
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'code'
  | 'link'
  | 'lists'
  | 'blockquote'
  | 'codeBlock'
  | 'horizontalRule'
  | 'hardBreak'
  | 'undo'
  | 'redo'

export interface EditorState {
  html: string
  text: string
  markdown: string
  json: unknown
}

export interface TiptapEditorProps {
  modelValue?: string
  toolbarItems?: ToolbarItem[]
}

export interface TiptapEditorEmits {
  'update:modelValue': [value: string]
}
```

## Шаг 6: Создай src/types/input.ts

```typescript
export type InputType = 'text' | 'email' | 'password' | 'textarea' | 'number' | 'url'

export interface ResponsiveInputProps {
  id?: string
  type?: InputType
  placeholder?: string
  disabled?: boolean
  error?: boolean
  errorMessage?: string
  label?: string
  modelValue?: string
  rows?: number
}

export interface ResponsiveInputEmits {
  'update:modelValue': [value: string]
  focus: []
  blur: []
}

export interface ValidationResult {
  isValid: boolean
  message?: string
}
```

## Шаг 7: Создай src/types/index.ts

```typescript
export * from './editor'
export * from './input'
```

## Шаг 8: Создай src/utils/validators.ts

```typescript
export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const validateText = (text: string, minLength: number = 1): boolean => {
  return text.trim().length >= minLength
}

export const createValidator = (regex: RegExp) => {
  return (value: string): boolean => regex.test(value)
}
```

## Шаг 9: Создай src/utils/index.ts

```typescript
export * from './validators'
```

## Шаг 10: Создай src/components/index.ts

```typescript
export { default as TiptapEditor } from './TiptapEditor.vue'
export { default as ResponsiveInput } from './ResponsiveInput.vue'

export type { TiptapEditorProps, TiptapEditorEmits, ToolbarItem, EditorState } from '../types'
export type { ResponsiveInputProps, ResponsiveInputEmits, InputType } from '../types'
```

## Шаг 11: Создай src/index.ts (главная точка входа)

```typescript
// Export components
export { TiptapEditor, ResponsiveInput } from './components'

// Export types
export type { 
  TiptapEditorProps, 
  TiptapEditorEmits, 
  ToolbarItem, 
  EditorState,
  ResponsiveInputProps,
  ResponsiveInputEmits,
  InputType,
  ValidationResult
} from './types'

// Export utilities
export { validateEmail, validateUrl, validateText, createValidator } from './utils'
```

## Шаг 12: Создай tsconfig.json

```json
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "include": ["env.d.ts", "src/**/*", "src/**/*.vue"],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": false
  },
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## Шаг 13: Создай README.md

```markdown
# @alpha/text-editor

Vue 3 компоненты для работы с текстом: полнофункциональный редактор на основе Tiptap и адаптивное поле ввода.

## Установка

```bash
npm install @alpha/text-editor
# или
yarn add @alpha/text-editor
# или
pnpm add @alpha/text-editor
```

### Требования

- Vue 3.0+
- TypeScript 4.4+ (опционально)

## Использование

### TiptapEditor

```vue
<template>
  <TiptapEditor 
    v-model="content"
    :toolbar-items="['bold', 'italic', 'lists', 'undo', 'redo']"
  />
</template>

<script setup>
import { ref } from 'vue'
import { TiptapEditor } from '@alpha/text-editor'
import '@alpha/text-editor/components'

const content = ref('<p>Hello world</p>')
</script>
```

### ResponsiveInput

```vue
<template>
  <ResponsiveInput
    id="email"
    v-model="email"
    type="email"
    label="Email"
    placeholder="your@email.com"
    :error="hasError"
    :error-message="errorMsg"
  />
</template>

<script setup>
import { ref } from 'vue'
import { ResponsiveInput, validateEmail } from '@alpha/text-editor'

const email = ref('')
const hasError = ref(false)
const errorMsg = ref('')

const handleInput = (value) => {
  email.value = value
  if (value && !validateEmail(value)) {
    hasError.value = true
    errorMsg.value = 'Invalid email'
  } else {
    hasError.value = false
    errorMsg.value = ''
  }
}
</script>
```

## API

### TiptapEditor

**Props:**
- `modelValue` (string): HTML содержимое редактора
- `toolbarItems` (ToolbarItem[]): Элементы тулбара для отображения

**Emits:**
- `update:modelValue`: Emitted when content changes

**Methods (через ref):**
- `getHTML()`: Get HTML content
- `getText()`: Get plain text
- `getJSON()`: Get JSON representation
- `getMarkdown()`: Get Markdown
- `setContent(html)`: Set content
- `clearContent()`: Clear editor

### ResponsiveInput

**Props:**
- `id` (string): HTML id
- `type` (string): 'text' | 'email' | 'textarea' | etc.
- `label` (string): Label text
- `placeholder` (string): Placeholder text
- `disabled` (boolean): Disable input
- `error` (boolean): Show error state
- `errorMessage` (string): Error message text
- `modelValue` (string): Input value
- `rows` (number): Rows for textarea

**Emits:**
- `update:modelValue`: When input changes
- `focus`: When input focused
- `blur`: When input blurred

## Примеры

### Form с валидацией

```vue
<template>
  <div>
    <ResponsiveInput
      id="name"
      v-model="form.name"
      type="text"
      label="Name"
      :error="errors.name"
      :error-message="errors.nameMsg"
    />
    
    <ResponsiveInput
      id="email"
      v-model="form.email"
      type="email"
      label="Email"
      :error="errors.email"
      :error-message="errors.emailMsg"
    />
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { ResponsiveInput, validateEmail } from '@alpha/text-editor'

const form = reactive({ name: '', email: '' })
const errors = reactive({ name: false, email: false, nameMsg: '', emailMsg: '' })

const validate = () => {
  errors.name = !form.name
  errors.nameMsg = errors.name ? 'Name is required' : ''
  
  errors.email = !validateEmail(form.email)
  errors.emailMsg = errors.email ? 'Invalid email' : ''
  
  return !errors.name && !errors.email
}
</script>
```

## Лицензия

MIT

## Поддержка

GitHub Issues: [alpha-text-editor/issues](https://github.com/yourusername/alpha-text-editor/issues)
```

## Шаг 14: Создай LICENSE

```text
MIT License

Copyright (c) 2024 Your Name

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Шаг 15: Сборка пакета

```bash
npm run build
# или
npm run type-check && npm run build
```

## Шаг 16: Локальное тестирование (перед публикацией)

```bash
# В папке пакета
npm link

# В проекте где хочешь использовать
npm link @alpha/text-editor

# Использование
import { TiptapEditor, ResponsiveInput } from '@alpha/text-editor'
```

## Шаг 17: Публикация на NPM

### Подготовка

```bash
# Создай аккаунт на https://www.npmjs.com/

# Залогинься локально
npm login

# Проверь что все файлы в порядке
npm pack

# Это создаст alpha-text-editor-0.1.0.tgz для проверки
```

### Публикация

```bash
# В папке пакета
npm publish --access public

# Для scoped пакета нужно явно указать access
npm publish --access public
```

### Проверка

```bash
# Твой пакет теперь доступен на:
# https://www.npmjs.com/package/@alpha/text-editor

# Можно установить откуда угодно:
npm install @alpha/text-editor
```

## Шаг 18: Обновление версии

```bash
# Patch версия (0.1.0 → 0.1.1)
npm version patch

# Minor версия (0.1.0 → 0.2.0)
npm version minor

# Major версия (0.1.0 → 1.0.0)
npm version major

# Затем опубликуй:
npm publish
```

## ✅ Checklist перед публикацией

- [ ] Все компоненты работают правильно
- [ ] TypeScript types экспортированы
- [ ] README с примерами написан
- [ ] package.json заполнен корректно
- [ ] Build процесс работает (`npm run build`)
- [ ] Нет console.log и debug кода
- [ ] Лицензия указана (MIT)
- [ ] Git репозиторий инициализирован
- [ ] Локально протестирован с `npm link`
- [ ] .npmignore создан (если нужно скрыть исходники)

## 🔗 Полезные ссылки

- [NPM Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Vue 3 Library Guide](https://vuejs.org/guide/scaling-up/tooling.html#publishing-libraries)
- [Vite Library Mode](https://vitejs.dev/guide/build.html#library-mode)
- [TypeScript Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html)

---

**Примерное время на реализацию: 6-8 часов**

После этих шагов у тебя будет полностью функциональный NPM пакет!
