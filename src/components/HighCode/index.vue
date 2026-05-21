<template>
  <div class="hljs-container">
    <div class="hljs-header" :codetype="title">
      <div class="hljs-copy">
        <el-button type="primary" link @click="handleCopy" :icon="DocumentCopy" class="hljs-copy">
          {{ copyButtonText }}
        </el-button>
        <el-button type="primary" link @click="handleDownload" :icon="Download" class="hljs-copy">
          {{ downloadButtonText }}
        </el-button>
      </div>
    </div>
    <div class="hljs-wrapper" v-code>
      <highlightjs :language="language" :autodetect="false" :code="code" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { DocumentCopy, Download } from '@element-plus/icons-vue';
import vCode from './line';

defineOptions({
  name: 'HighCode'
});
const props = withDefaults(defineProps<HighCodeProps>(), {
  language: 'java',
  code: '',
  title: ''
});
const copyButtonText = ref<string>('复制');
const downloadButtonText = ref<string>('下载');

export interface HighCodeProps {
  language: string;
  code: string;
  title: string;
}

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
