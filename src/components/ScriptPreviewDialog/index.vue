<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    width="72vw"
    top="6vh"
    append-to-body
    destroy-on-close
    draggable
    :close-on-click-modal="false"
    class="script-preview-dialog"
  >
    <el-tabs v-model="activeName" v-loading="loading" class="script-preview-tabs">
      <template #extra>
        <el-radio-group v-model="innerDialect" size="small" @change="handleDialectChange" class="script-preview-dialect">
          <el-radio-button label="mysql">MySQL</el-radio-button>
          <el-radio-button label="postgresql">PostgreSQL</el-radio-button>
        </el-radio-group>
      </template>
      <el-tab-pane v-for="item in items" :key="item.fileName" :label="item.title" :name="item.fileName">
        <HighCode :code="item.content" :language="item.language" :title="item.fileName" class="script-preview-code" />
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script setup lang="ts">
import HighCode from '@/components/HighCode/index.vue';
import type { ScriptExportResult } from '@/api/types/script';
import { computed, ref, watch } from 'vue';

defineOptions({
  name: 'ScriptPreviewDialog'
});

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title: string;
    scriptExport?: ScriptExportResult | null;
    loading?: boolean;
  }>(),
  {
    scriptExport: null,
    loading: false
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'changeDialect', value: string): void;
}>();

const activeName = ref('');
const innerDialect = ref('mysql');

const dialogVisible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
});

const items = computed(() => props.scriptExport?.items || []);

watch(
  () => props.scriptExport,
  value => {
    innerDialect.value = value?.selectedDialect || value?.currentDialect || 'mysql';
    activeName.value = value?.items?.[0]?.fileName || '';
  },
  { immediate: true }
);

const handleDialectChange = (value: string | number | boolean) => {
  emit('changeDialect', String(value));
};
</script>

<style scoped lang="scss">
:deep(.el-dialog) {
  max-width: 1380px;
  border-radius: 4px;
}

:deep(.el-dialog__header) {
  padding: 28px 36px 14px;
  margin-right: 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

:deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

:deep(.el-dialog__headerbtn) {
  top: 26px;
  right: 28px;
}

:deep(.el-dialog__body) {
  padding: 10px 36px 24px;
}

.script-preview-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 14px;
  }

  :deep(.el-tabs__nav-wrap::after) {
    height: 1px;
    background-color: var(--el-border-color-lighter);
  }

  :deep(.el-tabs__item) {
    height: 38px;
    padding: 0 18px;
    color: var(--el-text-color-regular);
    font-weight: 500;
  }

  :deep(.el-tabs__item.is-active) {
    color: var(--el-color-primary);
  }
}

.script-preview-dialect {
  :deep(.el-radio-button__inner) {
    min-width: 70px;
    padding: 7px 14px;
    font-weight: 500;
  }
}

.script-preview-code {
  width: 100%;
  max-height: calc(88vh - 180px);
  min-height: 420px;
  overflow: auto;
}

@media (max-width: 768px) {
  :deep(.el-dialog) {
    width: calc(100vw - 24px) !important;
  }

  :deep(.el-dialog__header) {
    padding: 20px 18px 12px;
  }

  :deep(.el-dialog__body) {
    padding: 8px 18px 18px;
  }

  .script-preview-dialect {
    margin-top: 8px;
  }

  .script-preview-code {
    min-height: 320px;
    max-height: 62vh;
  }
}
</style>
