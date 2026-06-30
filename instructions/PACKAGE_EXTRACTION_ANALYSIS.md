# Анализ вынесения логики в NPM пакет

## 📊 Обзор проекта

### Текущая структура
```
src/
├── components/
│   ├── TiptapEditor.vue      (674 строк) - основной редактор
│   ├── ResponsiveInput.vue   (198 строк) - адаптивное поле ввода
│   └── RichTextEditor.vue    (95 строк)  - альтернативный редактор (Quill)
├── App.vue                   - демо приложение
├── main.ts                   - точка входа
└── i18n.ts                   - локализация
```

### Зависимости
- `@tiptap/vue-3` - основной редактор текста
- `@tiptap/starter-kit` - стандартные расширения
- `@tiptap/markdown` - поддержка Markdown
- `@tiptap/extension-list-item` - расширенные списки
- `vue` - основной фреймворк
- `vue-i18n` - локализация (не используется в компонентах)

## 🎯 Компоненты для вынесения в пакет

### 1. **TiptapEditor.vue** (Приоритет: ВЫСОКИЙ)

#### Характеристики:
- **Размер**: 674 строк (script + template + styles)
- **Функциональность**: Полнофункциональный редактор текста
- **Возможности**:
  - Text style: обычный текст, заголовки H1/H2/H3
  - Форматирование: Bold, Italic, Underline, Strike, Code
  - Блоки: Blockquote, Code Block, Lists (bullet/ordered)
  - Специальное: Horizontal rule, Hard break, Links
  - История: Undo/Redo
  - Поддержка Markdown экспорта/импорта
  - Resizable (CSS resize: vertical)

#### API компонента:
```typescript
// Props
interface Props {
  modelValue?: string
  toolbarItems?: string[]
}

// Emits
emit('update:modelValue', html: string)

// Expose методы
getHTML(): string
getText(): string
getJSON(): unknown
getMarkdown(): string
setContent(html: string): void
clearContent(): void
editor: Editor
```

#### Зависимости:
- Vue 3 Composition API
- Tiptap (EditorContent, useEditor)
- Tiptap extensions (StarterKit, Markdown, ListItem)

#### Стили:
- 300+ строк SCOPED CSS
- Адаптивный дизайн (768px, 480px breakpoints)
- Современная цветовая схема

### 2. **ResponsiveInput.vue** (Приоритет: ВЫСОКИЙ)

#### Характеристики:
- **Размер**: 198 строк
- **Функциональность**: Адаптивное поле ввода
- **Типы**: text, email, textarea
- **Состояния**: default, hover, focus, disabled, error
- **Возможности**:
  - Валидация (компонент-agnostic)
  - Error messages с анимацией
  - Полная адаптивность (320px, 768px, 1280px+)
  - Resizable textarea (браузерный resize handle)
  - Touch-friendly размеры (44px min-height)

#### API компонента:
```typescript
// Props
interface Props {
  id?: string
  type?: string // 'text', 'email', 'textarea'
  placeholder?: string
  disabled?: boolean
  error?: boolean
  errorMessage?: string
  label?: string
  modelValue?: string
  rows?: number
}

// Emits
emit('update:modelValue', value: string)
emit('focus')
emit('blur')
```

#### Зависимости:
- Vue 3 Composition API
- Нет внешних зависимостей!

### 3. Утилиты и типы (Приоритет: СРЕДНИЙ)

#### Валидация (может быть отдельным файлом)
```typescript
// validators.ts
export const validateEmail = (email: string): boolean
export const validateUrl = (url: string): boolean
export const createValidator = (regex: RegExp) => (value: string): boolean
```

#### Типы редактора
```typescript
// types.ts
export interface EditorState {
  html: string
  text: string
  markdown: string
  json: unknown
}

export interface ToolbarItem = 
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
```

## 📦 Стратегия вынесения в пакет

### Вариант 1: Монолитный пакет `@alpha/text-editor`

**Структура пакета:**
```
@alpha/text-editor/
├── src/
│   ├── components/
│   │   ├── TiptapEditor.vue
│   │   └── ResponsiveInput.vue
│   ├── types/
│   │   ├── editor.ts
│   │   └── input.ts
│   ├── utils/
│   │   ├── validators.ts
│   │   └── config.ts
│   ├── styles/
│   │   ├── theme.css
│   │   └── variables.css
│   └── index.ts (главная точка входа)
├── package.json
├── vite.config.ts
└── README.md
```

**Преимущества:**
- ✅ Простота использования
- ✅ Одна зависимость для установки
- ✅ Консистентный стиль и брендинг
- ✅ Легко поддерживать версионирование

**Недостатки:**
- ❌ TiptapEditor требует Tiptap зависимости
- ❌ Если нужен только ResponsiveInput, все равно устанавливаются зависимости редактора

**Размер бандла (примерное):**
- TiptapEditor.vue: ~30KB (минифицирован)
- Tiptap зависимости: ~400-500KB
- ResponsiveInput.vue: ~3KB
- **Итого**: ~450KB

### Вариант 2: Модульные пакеты (Monorepo)

**Структура:**
```
@alpha-text/
├── packages/
│   ├── editor/        (@alpha-text/editor)
│   │   ├── src/
│   │   │   └── TiptapEditor.vue
│   │   └── package.json
│   ├── input/         (@alpha-text/input)
│   │   ├── src/
│   │   │   └── ResponsiveInput.vue
│   │   └── package.json
│   └── shared/        (@alpha-text/shared)
│       ├── src/
│       │   ├── types/
│       │   └── utils/
│       └── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

**Преимущества:**
- ✅ Модульность - используй только то что нужно
- ✅ ResponsiveInput без зависимостей Tiptap
- ✅ Независимое версионирование компонентов
- ✅ Легче тестировать отдельные компоненты
- ✅ Меньше размер бандла при использовании одного компонента

**Недостатки:**
- ❌ Сложнее в поддержке (3+ репозитория)
- ❌ Требует настройки monorepo (pnpm/yarn workspaces или Lerna)
- ❌ Более сложная разработка и публикация

### Вариант 3: Гибридный подход (Рекомендуемый)

**Главный пакет с опциональными peer dependencies:**

```json
{
  "name": "@alpha/text-editor",
  "peerDependencies": {
    "vue": "^3.0.0",
    "@tiptap/vue-3": "^3.0.0",
    "@tiptap/starter-kit": "^3.0.0"
  },
  "peerDependenciesOptional": {
    "@tiptap/vue-3": true,
    "@tiptap/starter-kit": true
  },
  "dependencies": {},
  "exports": {
    ".": "./dist/index.js",
    "./components": "./dist/components/index.js",
    "./types": "./dist/types/index.js",
    "./utils": "./dist/utils/index.js",
    "./components/editor": "./dist/components/TiptapEditor.vue",
    "./components/input": "./dist/components/ResponsiveInput.vue"
  }
}
```

**Использование:**
```typescript
// Если нужен только ResponsiveInput (без Tiptap)
import { ResponsiveInput } from '@alpha/text-editor/components'

// Если нужен TiptapEditor (требует Tiptap)
import { TiptapEditor } from '@alpha/text-editor/components/editor'
```

## 🔧 Технические требования для пакета

### Build конфигурация

```typescript
// vite.config.ts для пакета
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'AlphaTextEditor',
      fileName: (format) => `alpha-text-editor.${format}.js`,
      formats: ['es', 'umd', 'iife'],
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: { vue: 'Vue' },
      },
    },
  },
})
```

### Package.json структура

```json
{
  "name": "@alpha/text-editor",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/alpha-text-editor.umd.js",
  "module": "./dist/alpha-text-editor.es.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/alpha-text-editor.es.js",
      "require": "./dist/alpha-text-editor.umd.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "vue-tsc --build && vite build",
    "preview": "vite preview",
    "type-check": "vue-tsc --noEmit"
  },
  "peerDependencies": {
    "vue": "^3.0.0",
    "@tiptap/vue-3": "^3.0.0"
  },
  "peerDependenciesOptional": {
    "@tiptap/vue-3": true
  }
}
```

## 📈 Миграционный путь

### Шаг 1: Подготовка (текущее состояние)
- ✅ Компоненты готовы
- ✅ Типы TypeScript определены
- ✅ Стили оптимизированы
- ✅ Документация готова

### Шаг 2: Инициализация пакета
```bash
# Создать отдельный репозиторий или папку в monorepo
npm init -y
# или
pnpm create vue@latest alpha-text-editor
```

### Шаг 3: Структурирование
```
Переместить:
- src/components/TiptapEditor.vue → packages/editor/src/
- src/components/ResponsiveInput.vue → packages/input/src/
- Создать types/, utils/, styles/ папки
```

### Шаг 4: Build конфигурация
- Настроить Vite для building library
- Настроить TypeScript для генерации .d.ts
- Настроить CSS extraction

### Шаг 5: Публикация
```bash
npm publish --access public
# или если scoped
npm publish --access public
```

### Шаг 6: Использование в текущем проекте
```typescript
// Установка
npm install @alpha/text-editor

// Использование
import { TiptapEditor, ResponsiveInput } from '@alpha/text-editor'
```

## 💾 Размер и производительность

### Текущий бандл (демо приложение)
- Index.html: ~2KB
- JS бандл: ~1.2MB (с Tiptap и зависимостями)
- CSS: ~50KB

### Будущий бандл (при использовании пакета)
- Пакет: ~450KB (minified + gzipped: ~80-100KB)
- Может быть tree-shaken для отдельных компонентов
- ResponsiveInput отдельно: ~3KB (minified + gzipped: <1KB)

## 🔐 Лицензирование и публикация

### Рекомендации:
1. **License**: MIT (наиболее открытая)
2. **Registry**: NPM (по умолчанию)
3. **Scope**: `@alpha` (личный scope) или `@company-name`
4. **Versioning**: Semantic Versioning (major.minor.patch)

### Publishing setup:
```bash
# Создать .npmrc для authentication
echo "//registry.npmjs.org/:_authToken=YOUR_TOKEN" > ~/.npmrc

# Настроить git теги для release
git tag v0.1.0
git push origin v0.1.0

# Опубликовать
npm publish
```

## ✅ Рекомендуемое решение

### **Вариант: Монолитный пакет с Гибридным подходом**

**Почему:**
1. Простота разработки и поддержки
2. Консистентность между компонентами
3. Возможность использовать компоненты отдельно через exports
4. Меньше overhead чем monorepo на начальном этапе
5. Легко эволюционировать в monorepo позже если понадобится

**Timeline:**
- Подготовка: 2-4 часа
- Build конфигурация: 2-3 часа
- Тестирование: 2-3 часа
- Публикация: 1 час
- **Итого: 7-11 часов работы**

**Результат:**
- NPM пакет готов к использованию в других проектах
- Демо приложение может использовать пакет в качестве примера
- Компоненты можно обновлять и версионировать независимо
- Типы TypeScript сохранены и экспортированы

## 📚 Дополнительные файлы для пакета

### README.md
```markdown
# @alpha/text-editor

Vue 3 компоненты для работы с текстом:
- TiptapEditor - полнофункциональный редактор
- ResponsiveInput - адаптивное поле ввода

## Установка
npm install @alpha/text-editor

## Использование
import { TiptapEditor, ResponsiveInput } from '@alpha/text-editor'
```

### CHANGELOG.md
Отслеживание изменений версий

### Contributing.md
Руководство для контрибьюторов

### LICENSE
MIT лицензия

## 🎯 Следующие шаги

1. **Решить**: Монолитный пакет или Monorepo?
2. **Создать**: Репозиторий пакета (отдельный или в существующем)
3. **Настроить**: Build конфигурация и типы
4. **Протестировать**: Установка и использование в тестовом проекте
5. **Опубликовать**: На NPM registry
6. **Документировать**: API и примеры использования
