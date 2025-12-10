import { ref, onMounted, onUnmounted, type Ref } from 'vue';

export function useDialogWidth(width?: string): Ref<string> {
  const MAX_WIDTH = 800;
  const dialogWidth = ref('800px');
  function updateDialogWidth() {
    if (width) {
      dialogWidth.value = width;
      return;
    }
    const winW = window.innerWidth;
    if (winW < 500) {
      dialogWidth.value = '95vw';
    } else if (winW < 1000) {
      dialogWidth.value = '75vw';
    } else {
      dialogWidth.value = '55vw';
    }
  }

  onMounted(() => {
    updateDialogWidth();
    window.addEventListener('resize', updateDialogWidth);
  });
  onUnmounted(() => {
    window.removeEventListener('resize', updateDialogWidth);
  });

  return dialogWidth;
}
