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
</script>

<template>
  <div class="form-group">
    <label v-if="label" :for="id" class="form-label">{{ label }}</label>
    <textarea
      v-if="type === 'textarea'"
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
