<script setup lang="ts">
import { ref } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

defineProps<{
  content: string
}>()

const emit = defineEmits<{
  'update:content': [value: string]
}>()

const editorRef = ref()
const wrapperRef = ref<HTMLDivElement>()
const isResizing = ref(false)
const startY = ref(0)
const startHeight = ref(0)

const getEditorData = () => {
  const editor = editorRef.value?.getQuill?.()
  if (!editor) return null

  return {
    html: editor.getSemanticHTML(),
    plainText: editor.getText(),
    delta: editor.getContents(),
  }
}

const startResize = (e: MouseEvent) => {
  isResizing.value = true
  startY.value = e.clientY
  startHeight.value = wrapperRef.value?.clientHeight || 0
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
}

const onResize = (e: MouseEvent) => {
  if (!isResizing.value || !wrapperRef.value) return
  const delta = e.clientY - startY.value
  const newHeight = Math.max(300, startHeight.value + delta)
  wrapperRef.value.style.height = `${newHeight}px`
}

const stopResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
}

defineExpose({
  getEditorData,
})
</script>

<template>
  <div ref="wrapperRef" class="editor-wrapper">
    <QuillEditor
      ref="editorRef"
      :content="content"
      content-type="html"
      theme="snow"
      toolbar="full"
      @update:content="emit('update:content', $event)"
    />
    <div class="resize-handle" @mousedown="startResize" />
  </div>
</template>

<style scoped>
.editor-wrapper {
  position: relative;
  width: 100%;
  height: 400px;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
}

.resize-handle {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 8px;
  background: linear-gradient(to bottom, #e0e0e0, #b0b0b0);
  cursor: ns-resize;
  transition: background 0.2s;
}

.resize-handle:hover {
  background: linear-gradient(to bottom, #0076ff, #005ce6);
}
</style>
