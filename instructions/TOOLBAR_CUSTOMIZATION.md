# Кастомизация TiptapEditor - Переименование и иконки

**Статус:** Спецификация для реализации | **Приоритет:** Высокий

## Цель

Сделать компонент `TiptapEditor` максимально гибким для интеграции в другие проекты, позволяя:
1. **Переименовывать кнопки** в тулбаре (ru → en, или любые другие названия)
2. **Заменять иконки** на кастомные (SVG, emoji, текст, Vue компоненты)
3. **Менять текст подсказок** (title атрибуты)
4. **Управлять видимостью** отдельных кнопок

## Текущее состояние

### Структура TiptapEditor.vue

```vue
<script setup lang="ts">
interface Props {
  modelValue?: string
  toolbarItems?: string[]  // ← только список ID кнопок
}
</script>

<template>
  <div class="tiptap-toolbar">
    <button @click="editor?.commands.toggleBold()">
      <strong>B</strong>  <!-- ← жестко закодирована иконка -->
    </button>
    <!-- ... остальные кнопки ... -->
  </div>
</template>
```

**Проблемы:**
- ❌ Кнопки имеют жестко закодированные названия на русском
- ❌ Иконки - это текст (`B`, `I`, и т.д.), нельзя менять на SVG/кастомные
- ❌ Нет поддержки локализации
- ❌ Нет гибкого способа переопределить отдельные кнопки

## Решение: Props-based customization

### 1. Новые типы данных (src/types/editor.ts)

```typescript
// Базовая конфигурация кнопки
export interface ToolbarButtonConfig {
  // Обязательно
  id: string                          // 'bold', 'italic', и т.д.
  
  // Опционально - локализация
  label?: string                      // Название кнопки (вместо B, I)
  title?: string                      // Подсказка при наведении
  
  // Опционально - иконка
  icon?: string | 'emoji' | 'component'  // Тип иконки
  iconValue?: string                  // SVG, emoji, имя компонента
  
  // Опционально - видимость
  visible?: boolean                   // Показывать ли кнопку (default: true)
  hideOnMobile?: boolean              // Скрывать на мобильных (default: false)
  
  // Опционально - класс для стилизации
  className?: string                  // CSS класс для кастомного стиля
}

// Конфигурация всех кнопок
export interface ToolbarConfig {
  buttons?: Record<string, ToolbarButtonConfig>  // { bold: {...}, italic: {...} }
  locale?: 'ru' | 'en' | 'custom'               // Язык по умолчанию
}

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

export interface TiptapEditorProps {
  modelValue?: string
  toolbarItems?: ToolbarItem[]
  
  // ← ДЛЯ РЕАЛИЗАЦИИ:
  toolbarConfig?: ToolbarConfig           // Кастомная конфигурация кнопок
}
```

### 2. Пример использования (для документации)

#### 2.1 Простое переименование

```vue
<template>
  <TiptapEditor 
    v-model="content"
    :toolbar-items="['bold', 'italic', 'undo', 'redo']"
    :toolbar-config="{
      buttons: {
        bold: { label: 'Bold', title: 'Make text bold (Ctrl+B)' },
        italic: { label: 'Italic', title: 'Make text italic (Ctrl+I)' }
      }
    }"
  />
</template>

<script setup>
import { TiptapEditor } from '@alpha/text-editor'

const content = ref('<p>Hello</p>')
</script>
```

#### 2.2 Кастомные иконки (emoji)

```vue
<template>
  <TiptapEditor 
    v-model="content"
    :toolbar-items="['bold', 'italic', 'lists']"
    :toolbar-config="{
      buttons: {
        bold: { 
          icon: 'emoji',
          iconValue: '💪'
        },
        italic: { 
          icon: 'emoji',
          iconValue: '✨'
        },
        lists: {
          icon: 'emoji',
          iconValue: '📋'
        }
      }
    }"
  />
</template>
```

#### 2.3 Кастомные иконки (SVG)

```vue
<template>
  <TiptapEditor 
    v-model="content"
    :toolbar-items="['bold', 'italic']"
    :toolbar-config="{
      buttons: {
        bold: { 
          icon: 'svg',
          iconValue: '<svg>...</svg>'
        }
      }
    }"
  />
</template>
```

#### 2.4 Кастомные иконки (Vue компонент - более сложный вариант)

```vue
<template>
  <TiptapEditor 
    v-model="content"
    :toolbar-items="['bold', 'italic']"
    :toolbar-config="{
      buttons: {
        bold: { 
          icon: 'component',
          iconValue: 'IconBold'  // Нужно передать компонент чтобы
        }
      }
    }"
  />
</template>

<script setup>
import { TiptapEditor } from '@alpha/text-editor'
import IconBold from './icons/IconBold.vue'

// ← Это требует provide/inject или другого механизма
</script>
```

#### 2.5 Полная кастомизация (все языки)

```vue
<template>
  <TiptapEditor 
    v-model="content"
    :toolbar-items="['bold', 'italic', 'link', 'undo', 'redo']"
    :toolbar-config="toolbarConfig"
  />
</template>

<script setup>
import { ref } from 'vue'
import { TiptapEditor } from '@alpha/text-editor'

const content = ref('')

const toolbarConfig = ref({
  locale: 'en',
  buttons: {
    bold: {
      label: 'Bold',
      title: 'Bold (Ctrl+B)',
      icon: 'emoji',
      iconValue: '🔤'
    },
    italic: {
      label: 'Italic',
      title: 'Italic (Ctrl+I)',
      icon: 'emoji',
      iconValue: '📝'
    },
    link: {
      label: 'Link',
      title: 'Add link',
      icon: 'emoji',
      iconValue: '🔗'
    },
    undo: {
      visible: false  // Скрыть кнопку отмены
    },
    redo: {
      label: 'Redo',
      hideOnMobile: true
    }
  }
})
</script>
```

## 3. Архитектурные решения

### Вариант A: Props-based (рекомендуется для Vue)

**Плюсы:**
- ✅ Простая для понимания
- ✅ Реактивная (можно менять в runtime)
- ✅ Типизирована (TypeScript поддержка)
- ✅ Легко сериализуется (можно передать через API)

**Минусы:**
- ⚠️ Props могут стать очень большими для сложной конфигурации
- ⚠️ Сложно передать Vue компоненты как иконки (нужен `markRaw`)

**Реализация:**
```typescript
// TiptapEditor.vue script setup
interface Props {
  toolbarConfig?: ToolbarConfig
}

const props = withDefaults(defineProps<Props>(), {
  toolbarConfig: () => ({})
})

// Функция получения конфига для кнопки
const getButtonConfig = (buttonId: string): ToolbarButtonConfig => {
  return {
    ...DEFAULT_BUTTON_CONFIGS[buttonId],
    ...props.toolbarConfig?.buttons?.[buttonId]
  }
}
```

### Вариант B: Slot-based (альтернатива)

```vue
<!-- Позволить пользователю переопределить кнопку полностью через slot -->
<template>
  <button 
    v-if="!hasSlot(`button-${buttonId}`)"
    class="toolbar-button"
  >
    <!-- Иконка из конфига -->
  </button>
  <slot v-else :name="`button-${buttonId}`" :editor="editor" />
</template>
```

**Плюсы:**
- ✅ Полная гибкость
- ✅ Можно вставить любой Vue компонент

**Минусы:**
- ⚠️ Более многословно при использовании
- ⚠️ Сложнее типизировать

## 4. Дефолтные конфигурации

### Дефолт для русского языка (текущее состояние)

```typescript
// constants/toolbar-defaults.ts

export const DEFAULT_BUTTON_CONFIGS: Record<ToolbarItem, ToolbarButtonConfig> = {
  bold: {
    id: 'bold',
    label: undefined,        // Будет показана иконка
    icon: 'text',
    iconValue: 'B',
    title: 'Жирный (Ctrl+B)',
    visible: true
  },
  italic: {
    id: 'italic',
    icon: 'text',
    iconValue: 'I',
    title: 'Курсив (Ctrl+I)'
  },
  // ... и т.д.
}

export const LOCALE_DEFAULTS = {
  ru: {
    bold: { label: 'Жирный' },
    italic: { label: 'Курсив' },
    link: { label: 'Ссылка' },
    lists: { label: 'Списки' },
    // ... и т.д.
  },
  en: {
    bold: { label: 'Bold' },
    italic: { label: 'Italic' },
    link: { label: 'Link' },
    lists: { label: 'Lists' },
    // ... и т.д.
  }
}
```

## 5. Реализация (ТО ДЛЯ ДРУГОЙ МОДЕЛИ)

### Шаг 1: Обновить типы

**Файл:** `src/types/editor.ts`

Добавить типы `ToolbarButtonConfig` и `ToolbarConfig` как описано выше.

### Шаг 2: Создать дефолтные конфигурации

**Файл:** `src/constants/toolbar-defaults.ts` (новый файл)

```typescript
export const DEFAULT_BUTTON_CONFIGS: Record<ToolbarItem, ToolbarButtonConfig> = {
  // Для каждой кнопки: иконка, название, подсказка
}

export const LOCALE_DEFAULTS: Record<'ru' | 'en', Record<string, Partial<ToolbarButtonConfig>>> = {
  // Локализованные версии
}
```

### Шаг 3: Обновить TiptapEditor.vue

**Файл:** `src/components/TiptapEditor.vue`

1. Добавить prop `toolbarConfig: ToolbarConfig`
2. Создать computed функцию `getButtonConfig(id: string)`
3. Обновить template для использования конфига вместо жестко закодированных значений

#### Пример рефакторинга (одна кнопка):

**Было:**
```vue
<button
  v-if="toolbarItems.includes('bold')"
  :class="{ 'is-active': editor?.isActive('bold') }"
  @click="editor?.commands.toggleBold()"
  title="Жирный (Ctrl+B)"
>
  <strong>B</strong>
</button>
```

**Станет:**
```vue
<button
  v-if="shouldShowButton('bold')"
  :class="{ 'is-active': editor?.isActive('bold') }"
  :title="getButtonConfig('bold').title"
  @click="editor?.commands.toggleBold()"
>
  <!-- Иконка из конфига -->
  <component 
    v-if="getButtonConfig('bold').icon === 'component'"
    :is="getButtonConfig('bold').iconValue"
  />
  <span 
    v-else-if="getButtonConfig('bold').icon === 'emoji'"
    v-html="getButtonConfig('bold').iconValue"
  />
  <span 
    v-else-if="getButtonConfig('bold').icon === 'svg'"
    v-html="getButtonConfig('bold').iconValue"
  />
  <strong v-else>{{ getButtonConfig('bold').iconValue }}</strong>
</button>
```

### Шаг 4: Обновить view-mode-toggle кнопки

**Файл:** `src/components/TiptapEditor.vue`

Для новых кнопок "Текст" / "Визуально" (view mode toggle) также нужна кастомизация:

```typescript
export interface ViewModeButtonConfig {
  textLabel?: string      // Вместо "Текст"
  visualLabel?: string    // Вместо "Визуально"
  textTitle?: string      // Подсказка для текстового режима
  visualTitle?: string    // Подсказка для визуального режима
}

export interface ToolbarConfig {
  buttons?: Record<string, ToolbarButtonConfig>
  viewMode?: ViewModeButtonConfig
  locale?: 'ru' | 'en' | 'custom'
}
```

### Шаг 5: Тестирование

Создать файл `src/components/__tests__/TiptapEditor.customization.spec.ts` (опционально):

```typescript
describe('TiptapEditor Customization', () => {
  it('should use custom button labels from config', () => {
    // Тест переименования кнопки
  })
  
  it('should render emoji icons when provided', () => {
    // Тест с emoji иконками
  })
  
  it('should render SVG icons when provided', () => {
    // Тест с SVG иконками
  })
  
  it('should hide buttons when visible: false', () => {
    // Тест скрытия кнопок
  })
})
```

## 6. API для React (примечание на будущее)

Когда будет React версия, подход должен быть аналогичным:

```jsx
<TiptapEditor 
  value={content}
  onChange={setContent}
  toolbarConfig={{
    buttons: {
      bold: { label: 'Bold', icon: '💪' }
    }
  }}
/>
```

Главное отличие: вместо `v-model` будет `value` + `onChange`, вместо `ref` для доступа к методам будет `useRef` + `useImperativeHandle`.

## 7. Миграция существующего кода

Для совместимости с существующим кодом:

```typescript
// Если toolbarConfig не передан, использовать старое поведение
const finalConfig = computed(() => {
  if (!props.toolbarConfig) {
    return {
      buttons: {},
      locale: 'ru'  // Дефолт текущего состояния
    }
  }
  return {
    ...DEFAULT_CONFIG,
    ...props.toolbarConfig
  }
})
```

## 8. Примеры из дикой природы

### Пример 1: Приложение с английским интерфейсом

```vue
<template>
  <TiptapEditor 
    v-model="text"
    :toolbar-config="{
      locale: 'en',
      buttons: {
        textStyle: { visible: true },
        bold: true,      // ← можно просто true чтобы включить
        italic: true,
        underline: true,
        undo: { hideOnMobile: true },
        redo: { hideOnMobile: true }
      }
    }"
  />
</template>
```

### Пример 2: Минималистичный редактор с иконками

```vue
<template>
  <TiptapEditor 
    v-model="text"
    :toolbar-items="['bold', 'italic', 'link']"
    :toolbar-config="{
      buttons: {
        bold: { icon: 'emoji', iconValue: '✍️' },
        italic: { icon: 'emoji', iconValue: '📖' },
        link: { icon: 'emoji', iconValue: '🔗' }
      }
    }"
  />
</template>
```

## 9. Контрольный список для реализации

- [ ] Создать типы `ToolbarButtonConfig`, `ToolbarConfig`, `ViewModeButtonConfig`
- [ ] Добавить дефолтные конфигурации для ru и en локалей
- [ ] Обновить TiptapEditor.vue с новым prop `toolbarConfig`
- [ ] Создать helper функции `getButtonConfig()`, `shouldShowButton()`
- [ ] Рефакторить template для использования конфига (для каждой кнопки)
- [ ] Обновить view-mode-toggle кнопки для кастомизации
- [ ] Добавить примеры использования в документацию
- [ ] Протестировать все сценарии кастомизации
- [ ] Обновить README.md с примерами

## 10. Метрики успеха

✅ После реализации:
- Можно менять текст любой кнопки без изменения компонента
- Можно использовать emoji/SVG/текст как иконки
- Можно менять язык интерфейса
- Обратная совместимость с существующим кодом (без toolbarConfig)
- TypeScript типы полностью покрывают кастомизацию
