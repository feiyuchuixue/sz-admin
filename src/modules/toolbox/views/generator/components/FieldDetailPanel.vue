<template>
  <aside class="field-detail-panel">
    <el-empty v-if="!modelValue" description="选择一个字段后配置" :image-size="96" />

    <template v-else>
      <header class="field-detail-header">
        <div class="field-title-row">
          <div class="field-name" :title="modelValue.columnName">{{ modelValue.columnName }}</div>
          <div class="field-nav">
            <el-button size="small" circle :icon="ArrowUp" :disabled="!hasPrev" title="上一个字段" @click="$emit('prevField')" />
            <el-button
              size="small"
              circle
              :icon="ArrowDown"
              :disabled="!hasNext"
              title="下一个字段"
              @click="$emit('nextField')"
            />
          </div>
        </div>
        <div class="field-meta-row">
          <div class="field-tags">
            <el-tag v-if="total" size="small" effect="plain">{{ fieldPosition }}</el-tag>
            <el-tag size="small" effect="plain">{{ modeLabel }}</el-tag>
            <el-tag size="small" effect="plain">{{ modelValue.javaType }}</el-tag>
            <el-tag size="small" type="info" effect="plain">{{ modelValue.columnType }}</el-tag>
          </div>
        </div>
      </header>

      <el-scrollbar class="field-detail-scrollbar">
        <el-form :model="modelValue" label-position="top" class="field-detail-form">
          <el-alert
            v-if="fieldHint && fieldHint.type !== 'success'"
            class="field-hint-alert"
            :type="alertType"
            :title="fieldHint.label"
            :description="fieldHint.description"
            :closable="false"
            show-icon
          />

          <section class="field-section">
            <div class="section-title">基础信息</div>
            <el-form-item label="字段描述">
              <el-input v-model="modelValue.columnComment" placeholder="请输入字段描述" clearable size="small" />
            </el-form-item>
            <el-form-item label="Java 类型">
              <el-select
                v-model="modelValue.javaType"
                placeholder="请选择 Java 类型"
                filterable
                size="small"
                popper-class="field-detail-select-popper"
              >
                <el-option v-for="item in javaTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </section>

          <section class="field-section">
            <div class="section-title">数据库约束</div>
            <div class="switch-grid">
              <el-checkbox v-model="modelValue.isPk" true-value="1" false-value="0">主键</el-checkbox>
              <el-checkbox v-model="modelValue.isIncrement" true-value="1" false-value="0">自增</el-checkbox>
              <el-checkbox v-model="modelValue.isUniqueValid" true-value="1" false-value="0">唯一</el-checkbox>
              <el-checkbox v-model="modelValue.isRequired" true-value="1" false-value="0">必填</el-checkbox>
              <el-checkbox v-model="modelValue.isLogicDel" true-value="1" false-value="0">逻辑删除</el-checkbox>
            </div>
          </section>

          <section v-if="isServerOutput" class="field-section">
            <div class="section-title">生成位置</div>
            <div class="switch-grid">
              <el-checkbox v-model="modelValue.isInsert" true-value="1" false-value="0">新增</el-checkbox>
              <el-checkbox v-model="modelValue.isEdit" true-value="1" false-value="0">编辑</el-checkbox>
              <el-checkbox v-model="modelValue.isList" true-value="1" false-value="0">列表</el-checkbox>
              <el-checkbox v-model="modelValue.isQuery" true-value="1" false-value="0">查询</el-checkbox>
            </div>
          </section>

          <section v-if="isAutofillVisible" class="field-section">
            <div class="section-title">自动填充</div>
            <div class="readonly-field">
              <el-tag v-if="modelValue.isAutofill === '1'" size="small" type="success" effect="plain">
                {{ autofillLabel }}
              </el-tag>
              <el-text v-else type="info" size="small">不参与自动填充</el-text>
            </div>
          </section>

          <section v-if="isExcelConfigVisible" class="field-section">
            <div class="section-title">Excel 字段</div>
            <div class="switch-grid">
              <el-checkbox v-if="hasImport" v-model="modelValue.isImport" true-value="1" false-value="0"> 导入 </el-checkbox>
              <el-checkbox v-if="hasExport" v-model="modelValue.isExport" true-value="1" false-value="0"> 导出 </el-checkbox>
            </div>
          </section>

          <section class="field-section" v-if="isFrontendOutput && modelValue.isLogicDel !== '1'">
            <div class="section-title">前端展示</div>
            <el-form-item label="显示类型">
              <el-select
                v-model="modelValue.htmlType"
                placeholder="请选择显示类型"
                filterable
                size="small"
                popper-class="field-detail-select-popper"
                @change="handleHtmlTypeChange"
              >
                <el-option v-for="item in htmlTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="isDictionaryDisplayType(modelValue.htmlType)" label="字典类型" required>
              <el-select
                v-model="modelValue.dictType"
                placeholder="请选择字典类型"
                filterable
                clearable
                size="small"
                popper-class="field-detail-select-popper"
                @change="handleDictTypeChange"
              >
                <el-option-group v-for="group in dictTypeOptions" :key="group.label" :label="group.label">
                  <el-option v-for="dict in group.options" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-option-group>
              </el-select>
              <div v-if="!modelValue.dictType" class="form-tip is-danger">当前控件需要字典类型，否则生成页面缺少选项来源。</div>
            </el-form-item>
            <el-form-item v-if="isDictionaryDisplayType(modelValue.htmlType)" label="字典展示">
              <el-select
                v-model="modelValue.dictShowWay"
                placeholder="请选择字典展示方式"
                size="small"
                popper-class="field-detail-select-popper"
              >
                <el-option v-for="item in dictShowWayOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </section>

          <section class="field-section" v-if="isQueryConfigVisible">
            <div class="section-title">查询配置</div>
            <el-form-item label="查询方式">
              <el-select
                v-model="modelValue.queryType"
                placeholder="请选择查询方式"
                size="small"
                popper-class="field-detail-select-popper"
              >
                <el-option v-for="item in queryTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </section>
        </el-form>
      </el-scrollbar>
    </template>
  </aside>
</template>

<script setup lang="ts">
import type { DictCategory } from '@/api/types/system/dict';
import type { GeneratorColumnInfo } from '@/modules/toolbox/types/generator';
import {
  dictShowWayOptions,
  htmlTypeOptions,
  javaTypeOptions,
  queryTypeOptions
} from '@/modules/toolbox/views/generator/common/Options';
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue';
import { computed } from 'vue';

type FieldHint = { label: string; type: 'success' | 'warning' | 'danger' | 'info'; description: string };

const props = defineProps<{
  modelValue?: GeneratorColumnInfo;
  generateType?: string;
  hasImport?: boolean;
  hasExport?: boolean;
  autofillEnabled?: boolean;
  fieldHint?: FieldHint;
  currentIndex?: number;
  total?: number;
  dictTypeOptions: DictCategory[];
  isDictionaryDisplayType: (htmlType?: string) => boolean;
}>();

const emit = defineEmits<{
  htmlTypeChange: [row: GeneratorColumnInfo];
  dictTypeChange: [row: GeneratorColumnInfo];
  prevField: [];
  nextField: [];
}>();

const isServerOutput = computed(() => ['all', 'server'].includes(props.generateType || ''));
const isFrontendOutput = computed(() => props.generateType === 'all');
const isQueryConfigVisible = computed(
  () => isServerOutput.value && props.modelValue?.isLogicDel !== '1' && props.modelValue?.isQuery === '1'
);
const isExcelConfigVisible = computed(() => isServerOutput.value && (props.hasImport || props.hasExport));
const isAutofillVisible = computed(() => isServerOutput.value && props.autofillEnabled);
const alertType = computed(() => (props.fieldHint?.type === 'danger' ? 'error' : props.fieldHint?.type || 'info'));
const hasPrev = computed(() => (props.currentIndex ?? -1) > 0);
const hasNext = computed(() => {
  const index = props.currentIndex ?? -1;
  const total = props.total ?? 0;
  return index >= 0 && index < total - 1;
});
const fieldPosition = computed(() => {
  const index = props.currentIndex ?? -1;
  const total = props.total ?? 0;
  return index >= 0 ? `${index + 1}/${total}` : `0/${total}`;
});
const modeLabel = computed(() => {
  if (props.generateType === 'db') return '数据库';
  if (props.generateType === 'server') return '后端';
  return '全栈';
});
const autofillLabel = computed(() => {
  if (props.modelValue?.autofillType === 'FieldFill.INSERT') return '新增时填充';
  if (props.modelValue?.autofillType === 'FieldFill.UPDATE') return '更新时填充';
  if (props.modelValue?.autofillType === 'FieldFill.INSERT_UPDATE') return '新增/更新时填充';
  return '自动填充';
});

function handleHtmlTypeChange() {
  if (!props.modelValue) return;
  emit('htmlTypeChange', props.modelValue);
}

function handleDictTypeChange() {
  if (!props.modelValue) return;
  emit('dictTypeChange', props.modelValue);
}
</script>

<style scoped lang="scss">
.field-detail-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  border-left: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}

.field-detail-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 0 0 auto;
  padding: 8px 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.field-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.field-name {
  min-width: 0;
  overflow: hidden;
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
  color: var(--el-text-color-primary);
  overflow-wrap: anywhere;
  word-break: break-word;
}

.field-meta-row {
  display: flex;
  min-width: 0;
}

.field-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-width: 0;
}

.field-nav {
  display: flex;
  flex: 0 0 auto;
  gap: 6px;
}

.field-detail-scrollbar {
  flex: 1;
  min-height: 0;
}

.field-detail-form {
  padding: 10px 20px 14px 12px;
}

.field-hint-alert {
  margin-bottom: 10px;
}

.field-section + .field-section {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.section-title {
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.switch-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px 10px;
}

.readonly-field {
  display: flex;
  align-items: center;
  min-height: 24px;
}

.form-tip {
  margin-top: 6px;
  font-size: 12px;
  line-height: 18px;
  color: var(--el-text-color-secondary);

  &.is-danger {
    color: var(--el-color-danger);
  }
}

:deep(.el-form-item) {
  margin-bottom: 8px;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-checkbox) {
  height: 24px;
}

:deep(.el-scrollbar__bar.is-vertical) {
  right: 3px;
  width: 4px;
}

:global(.field-detail-select-popper) {
  max-width: 260px;
}

:global(.field-detail-select-popper .el-select-dropdown__wrap) {
  max-height: 210px;
  scrollbar-gutter: stable;
}
</style>
