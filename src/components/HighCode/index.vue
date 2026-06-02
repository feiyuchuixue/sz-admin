<template>
  <div class="hljs-container">
    <div class="hljs-header">
      <div class="hljs-title">
        <span class="hljs-window-dot" />
        <span class="hljs-file-name" :title="title">{{ title || 'code' }}</span>
        <span class="hljs-language">{{ languageLabel || normalizedLanguage }}</span>
      </div>
      <div class="hljs-actions">
        <el-button type="primary" link @click="handleCopy" :icon="DocumentCopy">
          {{ copyButtonText }}
        </el-button>
        <el-button type="primary" link @click="handleDownload" :icon="Download">
          {{ downloadButtonText }}
        </el-button>
      </div>
    </div>
    <div v-if="code" class="hljs-wrapper" v-code>
      <highlightjs :language="language" :autodetect="false" :code="code" />
    </div>
    <el-empty v-else class="hljs-empty" description="暂无代码内容" :image-size="72" />
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { DocumentCopy, Download } from '@element-plus/icons-vue';
import vCode from './line';

defineOptions({
  name: 'HighCode'
});
const props = withDefaults(defineProps<HighCodeProps>(), {
  language: 'java',
  code: '',
  title: '',
  languageLabel: ''
});
const copyButtonText = ref<string>('复制');
const downloadButtonText = ref<string>('下载');

export interface HighCodeProps {
  language: string;
  code: string;
  title: string;
  languageLabel?: string;
}

const normalizedLanguage = computed(() => (props.language || 'text').toUpperCase());

const handleCopy = async () => {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(props.code);
    } else {
      const tempTextarea = document.createElement('textarea');
      tempTextarea.value = props.code;
      document.body.appendChild(tempTextarea);
      tempTextarea.select();
      document.execCommand('copy');
      document.body.removeChild(tempTextarea);
    }
    copyButtonText.value = '复制成功';
    setTimeout(() => {
      copyButtonText.value = '复制';
    }, 2000);
  } catch (err) {
    console.error('复制操作不被支持或失败', err);
  }
};

const handleDownload = () => {
  const filename = props.title || 'download.txt';
  const blob = new Blob([props.code], { type: 'text/plain;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
</script>

<style lang="scss" scoped></style>
