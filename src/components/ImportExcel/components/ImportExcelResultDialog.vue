<template>
  <el-dialog v-model="visible" title="导入结果" width="560px" append-to-body destroy-on-close class="import-result-dialog">
    <div class="import-result-body">
      <div class="import-result-batch-row">
        <span class="import-result-label">批次 ID</span>
        <div class="import-result-batch-box">
          <span class="import-result-batch">{{ batchId || '-' }}</span>
          <button type="button" class="import-result-copy-btn" @click="copyBatchId">
            <el-icon class="import-result-copy-icon"><DocumentCopy /></el-icon>
            <span>复制</span>
          </button>
        </div>
      </div>

      <div class="import-result-summary">
        <div class="import-result-summary-item">
          <span class="import-result-summary-label">成功</span>
          <span class="import-result-summary-value import-result-success">{{ success }}</span>
          <span class="import-result-summary-unit">条</span>
        </div>
        <div class="import-result-summary-divider">/</div>
        <div class="import-result-summary-item">
          <span class="import-result-summary-label">失败</span>
          <span class="import-result-summary-value import-result-fail">{{ fail }}</span>
          <span class="import-result-summary-unit">条</span>
        </div>
      </div>

      <div v-if="fail > 0 && resultTip" class="import-result-tip">
        <span class="import-result-tip-icon">!</span>
        <span class="import-result-tip-text">{{ resultTip }}</span>
      </div>
    </div>

    <template #footer>
      <div class="import-result-footer">
        <el-button type="primary" @click="visible = false">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ElMessage } from 'element-plus';
import { DocumentCopy } from '@element-plus/icons-vue';

defineOptions({
  name: 'ImportExcelResultDialog'
});

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    batchId?: string;
    success?: number;
    fail?: number;
    resultTip?: string;
  }>(),
  {
    batchId: '-',
    success: 0,
    fail: 0,
    resultTip: ''
  }
);

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const visible = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
});

const copyBatchId = async () => {
  const text = props.batchId || '';
  if (!text) return;
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    } else {
      const tempTextarea = document.createElement('textarea');
      tempTextarea.value = text;
      document.body.appendChild(tempTextarea);
      tempTextarea.select();
      document.execCommand('copy');
      document.body.removeChild(tempTextarea);
    }
    ElMessage.success('复制成功');
  } catch (error) {
    console.error('复制失败', error);
    ElMessage.error('复制失败');
  }
};
</script>

<style lang="scss" scoped>
.import-result-dialog {
  :deep(.el-dialog__body) {
    padding: 10px 20px 8px;
  }

  :deep(.el-dialog__footer) {
    padding: 10px 20px 20px;
  }
}

.import-result-body {
  width: 100%;
  padding: 4px 0 2px;
}

.import-result-batch-row {
  margin-bottom: 18px;
}

.import-result-label {
  display: block;
  margin-bottom: 10px;
  color: #909399;
  font-size: 12px;
  line-height: 1;
  letter-spacing: 0.5px;
}

.import-result-batch-box {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.import-result-batch {
  flex: 1;
  min-width: 0;
  font-family: monospace;
  font-size: 12px;
  color: #475569;
  background: #f8fafc;
  padding: 11px 12px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  word-break: break-all;
  line-height: 1.7;
  box-sizing: border-box;
}

.import-result-copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  background: #fff;
  color: #606266;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: var(--el-color-primary);
    border-color: var(--el-color-primary-light-5);
    background: var(--el-color-primary-light-9);
  }

  &:focus {
    outline: none;
  }
}

.import-result-copy-icon {
  width: 14px;
  height: 14px;
}

.import-result-summary {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 18px;
  margin-bottom: 18px;
  padding: 4px 0;
}

.import-result-summary-item {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
}

.import-result-summary-label {
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

.import-result-summary-value {
  font-size: 30px;
  line-height: 1;
  font-weight: 700;
}

.import-result-summary-unit {
  color: #909399;
  font-size: 13px;
}

.import-result-summary-divider {
  color: #c0c4cc;
  font-size: 18px;
  line-height: 1;
}

.import-result-success {
  color: #67c23a;
}

.import-result-fail {
  color: #f56c6c;
}

.import-result-tip {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  padding: 11px 14px;
  background: #fff7ed;
  border: 1px solid #faecd8;
  border-radius: 10px;
  color: #e6a23c;
  line-height: 1.7;
  box-sizing: border-box;
}

.import-result-tip-icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(230, 162, 60, 0.16);
  color: #d97706;
  font-size: 12px;
  font-weight: 700;
  line-height: 18px;
  text-align: center;
}

.import-result-tip-text {
  font-size: 13px;
}

.import-result-footer {
  display: flex;
  justify-content: center;
}

@media (max-width: 640px) {
  .import-result-batch-box {
    flex-direction: column;
    align-items: stretch;
  }

  .import-result-copy-btn {
    justify-content: center;
  }

  .import-result-summary {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .import-result-summary-divider {
    display: none;
  }

  .import-result-summary-value {
    font-size: 26px;
  }
}
</style>
