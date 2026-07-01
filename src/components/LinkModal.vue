<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  isOpen?: boolean
  initialUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  initialUrl: '',
})

const emit = defineEmits<{
  confirm: [url: string]
  delete: []
  cancel: []
}>()

const url = ref('')
const inputRef = ref<HTMLInputElement>()

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      url.value = props.initialUrl
      setTimeout(() => inputRef.value?.focus(), 0)
    }
  },
)

watch(
  () => props.initialUrl,
  (newVal) => {
    url.value = newVal
  },
)

const handleConfirm = () => {
  emit('confirm', url.value)
}

const handleDelete = () => {
  emit('delete')
}

const handleCancel = () => {
  emit('cancel')
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleConfirm()
  } else if (e.key === 'Escape') {
    handleCancel()
  }
}

const isMouseDownOnBackdrop = ref(false)

const handleBackdropMouseDown = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    isMouseDownOnBackdrop.value = true
  }
}

const handleBackdropMouseUp = (e: MouseEvent) => {
  if (e.target === e.currentTarget && isMouseDownOnBackdrop.value) {
    handleCancel()
  }
  isMouseDownOnBackdrop.value = false
}
</script>

<template>
  <Teleport to="body" v-if="isOpen">
    <div class="modal-backdrop" @mousedown="handleBackdropMouseDown" @mouseup="handleBackdropMouseUp">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">Добавить ссылку</h3>
          <button class="modal-close" @click="handleCancel" aria-label="Закрыть">✕</button>
        </div>

        <div class="modal-body">
          <label for="link-input" class="input-label">URL адрес:</label>
          <input
            ref="inputRef"
            id="link-input"
            v-model="url"
            type="url"
            placeholder="https://alpha-doc.ru"
            class="link-input"
            @keydown="handleKeydown"
          />
        </div>

        <div class="modal-footer">
          <button v-if="props.initialUrl" class="btn btn-delete" @click="handleDelete">Удалить</button>
          <div v-else class="spacer"></div>
          <div class="button-group">
            <button class="btn btn-cancel" @click="handleCancel">Отмена</button>
            <button class="btn btn-primary" @click="handleConfirm">Добавить ссылку</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.16);
  width: 90%;
  max-width: 450px;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.modal-title {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
  color: #6b7280;
  font-size: 20px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.modal-close:hover {
  background: #e5e7eb;
  color: #374151;
}

.modal-body {
  padding: 24px;
}

.input-label {
  display: block;
  margin-bottom: 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.link-input {
  width: 100%;
  padding: 8px 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  font-size: 14px;
  color: #1f2937;
  background: white;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  transition: all 0.15s ease;
  box-sizing: border-box;
}

.link-input:focus {
  outline: none;
  border-color: #fbbf24;
  box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
}

.link-input::placeholder {
  color: #9ca3af;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  justify-content: space-between;
  align-items: center;
}

.spacer {
  flex: 1;
}

.button-group {
  display: flex;
  gap: 12px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  border: 1.5px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  min-height: 40px;
}

.btn-cancel {
  background: white;
  color: #374151;
  border-color: #d1d5db;
}

.btn-cancel:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.btn-cancel:active {
  background: #e5e7eb;
}

.btn-primary {
  background: #fbbf24;
  color: #1f2937;
  font-weight: 700;
}

.btn-primary:hover {
  background: #f59e0b;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
}

.btn-primary:active {
  background: #d97706;
}

.btn-delete {
  background: #fecaca;
  color: #991b1b;
  border-color: #fecaca;
}

.btn-delete:hover {
  background: #fca5a5;
  border-color: #fca5a5;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15);
}

.btn-delete:active {
  background: #f87171;
}

@media (max-width: 480px) {
  .modal-container {
    width: 95%;
    max-width: 100%;
  }

  .modal-header {
    padding: 16px 20px;
  }

  .modal-title {
    font-size: 16px;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-footer {
    padding: 12px 20px;
    flex-direction: column;
    gap: 10px;
  }

  .button-group {
    width: 100%;
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
