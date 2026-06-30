<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  id?: string
  type?: string
  placeholder?: string
  disabled?: boolean
  error?: boolean
  errorMessage?: string
  label?: string
  modelValue?: string
  rows?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  error: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus: []
  blur: []
}>()

const isFocused = ref(false)
const wrapperRef = ref<HTMLDivElement>()
const isResizing = ref(false)
const startY = ref(0)
const startHeight = ref(0)

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement | HTMLTextAreaElement
  emit('update:modelValue', target.value)
}

const handleFocus = () => {
  isFocused.value = true
  emit('focus')
}

const handleBlur = () => {
  isFocused.value = false
  emit('blur')
}

const startResize = (e: MouseEvent) => {
  if (props.type !== 'textarea') return
  isResizing.value = true
  startY.value = e.clientY
  startHeight.value = wrapperRef.value?.clientHeight || 200
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
}

const onResize = (e: MouseEvent) => {
  if (!isResizing.value || !wrapperRef.value) return
  const delta = e.clientY - startY.value
  const newHeight = Math.max(150, startHeight.value + delta)
  wrapperRef.value.style.height = `${newHeight}px`
}

const stopResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
}
</script>

<template>
  <div class="form-group">
    <label v-if="label" :for="id" class="form-label">{{ label }}</label>
    <div
      v-if="type === 'textarea'"
      ref="wrapperRef"
      class="textarea-wrapper"
      :style="{ height: 'auto' }"
    >
      <textarea
        :id="id"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :rows="rows || 4"
        :class="['input-field', { 'input-error': error, 'is-focused': isFocused }]"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <div class="resize-handle" @mousedown="startResize" />
    </div>
    <input
      v-else
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="['input-field', { 'input-error': error, 'is-focused': isFocused }]"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
    />
    <span v-if="error && errorMessage" class="input-error-message">
      {{ errorMessage }}
    </span>
  </div>
</template>

<style scoped>
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.form-label {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  display: block;
  padding: 0;
}

.textarea-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 150px;
}

/* Базовое поле ввода */
.input-field {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  font-size: 16px;
  padding: 12px 16px;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  background-color: white;
  color: #1f2937;
  transition: all 0.2s ease-in-out;
  min-height: 44px;
  line-height: 1.5;
  resize: none;
}

.textarea-wrapper .input-field {
  flex: 1;
  min-height: auto;
  height: 100%;
}

.input-field::placeholder {
  color: #9ca3af;
}

/* Hover состояние */
.input-field:hover:not(:disabled):not(.is-focused) {
  border-color: #9ca3af;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* Focus состояние */
.input-field:focus,
.input-field.is-focused {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Disabled состояние */
.input-field:disabled {
  background-color: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
  opacity: 0.7;
}

/* Error состояние */
.input-field.input-error {
  border-color: #dc2626;
}

.input-field.input-error:focus,
.input-field.input-error.is-focused {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

/* Error message */
.input-error-message {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  font-size: 12px;
  color: #dc2626;
  margin-top: 2px;
  animation: slideIn 0.2s ease-in-out;
}

/* Resize handle для textarea */
.resize-handle {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, #bfbfbf 0%, #bfbfbf 2px, transparent 2px),
    linear-gradient(135deg, #bfbfbf 8px, #bfbfbf 10px, transparent 10px);
  background-size: 3px 3px;
  background-position: 0 0, 3px 3px;
  background-repeat: no-repeat;
  cursor: se-resize;
  transition: opacity 0.2s;
  opacity: 0.3;
  pointer-events: all;
}

.resize-handle:hover {
  opacity: 0.6;
}

.textarea-wrapper:focus-within .resize-handle {
  opacity: 0.5;
}

/* Мобильные экраны (320px–480px) */
@media (max-width: 480px) {
  .input-field {
    font-size: 16px;
    padding: 12px 14px;
    border-radius: 6px;
    min-height: 44px;
  }

  .form-label {
    font-size: 13px;
  }

  .input-error-message {
    font-size: 11px;
  }

  .resize-handle {
    display: none;
  }

  .textarea-wrapper {
    min-height: 120px;
  }
}

/* Планшеты (481px–767px) */
@media (min-width: 481px) and (max-width: 767px) {
  .input-field {
    max-width: 100%;
  }
}

/* Десктопы (768px+) */
@media (min-width: 768px) {
  .form-group {
    max-width: 500px;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
