<template>
  <section class="field-config-step">
    <div class="field-toolbar">
      <div class="toolbar-main">
        <div class="toolbar-title">字段配置</div>
        <el-radio-group v-model="generatorInfo.generateType" class="generate-type-switch" size="small">
          <el-radio-button label="all">全栈</el-radio-button>
          <el-radio-button label="server">后端</el-radio-button>
          <el-radio-button label="db">数据库</el-radio-button>
        </el-radio-group>
      </div>

      <el-input
        v-model="keyword"
        class="field-search"
        clearable
        size="small"
        placeholder="搜索字段名 / 描述 / Java 类型"
        :prefix-icon="Search"
      />

      <div class="toolbar-actions">
        <span class="control-label option-label">生成选项</span>
        <div v-if="isServerOutput" class="option-slot">
          <el-checkbox v-model="generatorInfo.hasImport" true-value="1" false-value="0">Excel 导入</el-checkbox>
          <el-checkbox v-model="generatorInfo.hasExport" true-value="1" false-value="0">Excel 导出</el-checkbox>
        </div>
        <div class="option-slot">
          <el-checkbox v-model="generatorInfo.isAutofill" true-value="1" false-value="0">自动填充</el-checkbox>
        </div>
        <div v-if="isFrontendOutput" class="option-slot">
          <el-radio-group v-model="generatorInfo.windowShowType" size="small">
            <el-radio-button label="0">弹窗</el-radio-button>
            <el-radio-button label="1">抽屉</el-radio-button>
          </el-radio-group>
        </div>
        <el-tooltip :content="detailCollapsed ? '展开字段详情' : '收起字段详情'" placement="top">
          <el-button
            class="detail-toggle"
            size="small"
            plain
            :icon="detailCollapsed ? ArrowLeft : ArrowRight"
            @click="detailCollapsed = !detailCollapsed"
          />
        </el-tooltip>
      </div>
    </div>

    <div class="field-control-row">
      <div class="field-filter-group">
        <div class="control-caption">
          <span class="control-label">字段操作</span>
          <span class="control-help">{{ fieldViewHelpText }}</span>
        </div>
        <div class="field-overview">
          <button
            v-for="item in fieldViews"
            :key="item.value"
            class="field-stat"
            :class="{ active: fieldView === item.value, danger: item.value === 'issues' && fieldStats.issues > 0 }"
            :title="`${item.label}：已配置 ${item.count} / ${fieldStats.total} 个字段`"
            type="button"
            @click="switchFieldView(item.value)"
          >
            <span>{{ item.label }}</span>
            <strong>{{ item.count }}</strong>
          </button>
        </div>
      </div>
    </div>

    <div
      class="field-layout"
      :class="{ 'is-detail-collapsed': detailCollapsed }"
      tabindex="0"
      @keydown.up.prevent="selectAdjacentColumn(-1)"
      @keydown.down.prevent="selectAdjacentColumn(1)"
    >
      <div class="field-table-wrap">
        <ProTable
          :key="tableKey"
          ref="fieldTableRef"
          :columns="columns"
          :data="filteredColumns"
          :pagination="false"
          :tool-button="false"
          row-key="columnId"
          highlight-current-row
          class="field-table"
          height="100%"
          @row-click="selectColumn"
        >
          <template #columnName="scope">
            <div class="field-cell-main">
              <span>{{ scope.row.columnName }}</span>
              <el-tag v-if="scope.row.isPk === '1'" size="small" effect="plain">PK</el-tag>
            </div>
          </template>
          <template #columnComment="scope">
            <el-input v-model="scope.row.columnComment" placeholder="字段描述" size="small" @focus="selectColumn(scope.row)" />
          </template>
          <template #javaType="scope">
            <el-select
              v-model="scope.row.javaType"
              placeholder="Java 类型"
              filterable
              size="small"
              @focus="selectColumn(scope.row)"
            >
              <el-option v-for="item in javaTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </template>
          <template #isInsertHeader>
            <el-tooltip :content="bulkCheckTip('form')" placement="top">
              <el-checkbox
                class="column-check-header"
                :model-value="bulkStates.form.checked"
                :indeterminate="bulkStates.form.indeterminate"
                :disabled="!filteredColumns.length"
                @click.stop
                @change="toggleVisibleFieldsByValue('form', $event)"
              >
                表单
              </el-checkbox>
            </el-tooltip>
          </template>
          <template #isInsert="scope">
            <el-checkbox :model-value="isFormEnabled(scope.row)" @change="toggleRowTargetByValue(scope.row, 'form', $event)" />
          </template>
          <template #isListHeader>
            <el-tooltip :content="bulkCheckTip('list')" placement="top">
              <el-checkbox
                class="column-check-header"
                :model-value="bulkStates.list.checked"
                :indeterminate="bulkStates.list.indeterminate"
                :disabled="!filteredColumns.length"
                @click.stop
                @change="toggleVisibleFieldsByValue('list', $event)"
              >
                列表
              </el-checkbox>
            </el-tooltip>
          </template>
          <template #isList="scope">
            <el-checkbox :model-value="scope.row.isList === '1'" @change="toggleRowTargetByValue(scope.row, 'list', $event)" />
          </template>
          <template #isQueryHeader>
            <el-tooltip :content="bulkCheckTip('query')" placement="top">
              <el-checkbox
                class="column-check-header"
                :model-value="bulkStates.query.checked"
                :indeterminate="bulkStates.query.indeterminate"
                :disabled="!filteredColumns.length"
                @click.stop
                @change="toggleVisibleFieldsByValue('query', $event)"
              >
                查询
              </el-checkbox>
            </el-tooltip>
          </template>
          <template #isQuery="scope">
            <el-checkbox :model-value="scope.row.isQuery === '1'" @change="toggleRowTargetByValue(scope.row, 'query', $event)" />
          </template>
          <template #isImportHeader>
            <el-tooltip :content="bulkCheckTip('import')" placement="top">
              <el-checkbox
                class="column-check-header"
                :model-value="bulkStates.import.checked"
                :indeterminate="bulkStates.import.indeterminate"
                :disabled="!filteredColumns.length"
                @click.stop
                @change="toggleVisibleFieldsByValue('import', $event)"
              >
                导入
              </el-checkbox>
            </el-tooltip>
          </template>
          <template #isImport="scope">
            <el-checkbox
              :model-value="scope.row.isImport === '1'"
              @change="toggleRowTargetByValue(scope.row, 'import', $event)"
            />
          </template>
          <template #isExportHeader>
            <el-tooltip :content="bulkCheckTip('export')" placement="top">
              <el-checkbox
                class="column-check-header"
                :model-value="bulkStates.export.checked"
                :indeterminate="bulkStates.export.indeterminate"
                :disabled="!filteredColumns.length"
                @click.stop
                @change="toggleVisibleFieldsByValue('export', $event)"
              >
                导出
              </el-checkbox>
            </el-tooltip>
          </template>
          <template #isExport="scope">
            <el-checkbox
              :model-value="scope.row.isExport === '1'"
              @change="toggleRowTargetByValue(scope.row, 'export', $event)"
            />
          </template>
          <template #autofillStatusHeader="scope">
            <el-space :size="4" class="field-hint-header">
              <span>{{ scope?.column.label }}</span>
              <el-tooltip
                effect="dark"
                content="自动填充由后端识别 create/update 字段并按全局开关生效，此处仅展示生成结果。"
                placement="top"
              >
                <i :class="'iconfont icon-yiwen'" />
              </el-tooltip>
            </el-space>
          </template>
          <template #autofillStatus="scope">
            <el-tag v-if="scope.row.isAutofill === '1'" size="small" effect="plain" type="success">
              {{ getAutofillLabel(scope.row.autofillType) }}
            </el-tag>
            <el-text v-else type="info" size="small">-</el-text>
          </template>
          <template #fieldStatusHeader="scope">
            <el-space :size="4" class="field-hint-header">
              <span>{{ scope?.column.label }}</span>
              <el-tooltip
                effect="dark"
                content="前端根据当前字段配置自动生成的提示，仅用于定位特殊配置，不参与保存参数。"
                placement="top"
              >
                <i :class="'iconfont icon-yiwen'" />
              </el-tooltip>
            </el-space>
          </template>
          <template #fieldStatus="scope">
            <el-tooltip v-if="getFieldHint(scope.row).type !== 'success'" :content="getFieldHint(scope.row).description">
              <el-tag :type="getFieldHint(scope.row).type" size="small" effect="light">
                {{ getFieldHint(scope.row).label }}
              </el-tag>
            </el-tooltip>
            <el-text v-else type="info" size="small">-</el-text>
          </template>
        </ProTable>

        <div v-if="!filteredColumns.length" class="field-empty-layer">
          <el-empty :description="emptyDescription" :image-size="80">
            <el-button size="small" type="primary" plain @click="resetFieldFilters">显示全部字段</el-button>
          </el-empty>
        </div>
      </div>

      <FieldDetailPanel
        v-show="!detailCollapsed"
        :model-value="selectedColumn"
        :generate-type="generatorInfo.generateType"
        :has-import="generatorInfo.hasImport === '1'"
        :has-export="generatorInfo.hasExport === '1'"
        :autofill-enabled="generatorInfo.isAutofill === '1'"
        :field-hint="selectedFieldHint"
        :dict-type-options="dictTypeOptions"
        :is-dictionary-display-type="isDictionaryDisplayType"
        :current-index="selectedColumnIndex"
        :total="filteredColumns.length"
        @html-type-change="htmlTypeChange"
        @dict-type-change="dictTypeChange"
        @prev-field="selectAdjacentColumn(-1)"
        @next-field="selectAdjacentColumn(1)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { DictCategory } from '@/api/types/system/dict';
import type { GeneratorColumnInfo, GeneratorGeneratorInfo } from '@/modules/toolbox/types/generator';
import type { ColumnProps, ProTableInstance } from '@/components/ProTable/interface';
import ProTable from '@/components/ProTable/index.vue';
import FieldDetailPanel from '@/modules/toolbox/views/generator/components/FieldDetailPanel.vue';
import { dictShowWayOptions, javaTypeOptions } from '@/modules/toolbox/views/generator/common/Options';
import { ArrowLeft, ArrowRight, Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { computed, nextTick, ref, watch, watchEffect } from 'vue';

type FieldView = 'all' | 'form' | 'list' | 'query' | 'import' | 'export' | 'issues';
type BulkTarget = 'form' | 'list' | 'query' | 'import' | 'export';
type CheckboxValue = string | number | boolean;
type FieldStatusType = 'success' | 'warning' | 'danger' | 'info';
type FieldHint = { label: string; type: FieldStatusType; description: string };
const fieldViewLabelMap: Record<FieldView, string> = {
  all: '全部字段',
  form: '表单字段',
  list: '列表字段',
  query: '查询字段',
  import: '导入字段',
  export: '导出字段',
  issues: '待处理字段'
};

const props = defineProps<{
  columnsInfos: GeneratorColumnInfo[];
  generatorInfo: GeneratorGeneratorInfo;
  dictTypeOptions: DictCategory[];
  focusIssues?: boolean;
}>();

const dictionaryDisplayTypes = ['select', 'radio', 'radio-group', 'checkbox'];

const keyword = ref('');
const fieldView = ref<FieldView>('all');
const selectedColumnId = ref<string | number | undefined>();
const tableKey = ref(0);
const fieldTableRef = ref<ProTableInstance>();
const detailCollapsed = ref(false);

const columns = ref<ColumnProps<GeneratorColumnInfo>[]>([
  { type: 'sort', label: '排序', width: 70, isShow: true },
  { prop: 'columnName', label: '字段列名', minWidth: 150, fixed: 'left' },
  { prop: 'columnComment', label: '字段描述', minWidth: 170 },
  { prop: 'javaType', label: 'Java 类型', minWidth: 130 },
  { prop: 'isInsert', label: '表单', width: 70, align: 'center' },
  { prop: 'isList', label: '列表', width: 70, align: 'center' },
  { prop: 'isQuery', label: '查询', width: 70, align: 'center' },
  { prop: 'isImport', label: '导入', width: 70, align: 'center' },
  { prop: 'isExport', label: '导出', width: 70, align: 'center' },
  { prop: 'autofillStatus', label: '填充', width: 86, align: 'center' },
  { prop: 'fieldStatus', label: '提示', width: 86, align: 'center' }
]);

const canSort = computed(() => !keyword.value.trim());
const isServerOutput = computed(() => ['all', 'server'].includes(props.generatorInfo.generateType));
const isFrontendOutput = computed(() => props.generatorInfo.generateType === 'all');

const fieldStats = computed(() => {
  const rows = props.columnsInfos;
  return {
    total: rows.length,
    form: rows.filter(row => row.isInsert === '1' || row.isEdit === '1').length,
    list: rows.filter(row => row.isList === '1').length,
    query: rows.filter(row => row.isQuery === '1').length,
    import: rows.filter(row => row.isImport === '1').length,
    export: rows.filter(row => row.isExport === '1').length,
    issues: rows.filter(row => getFieldHint(row).type === 'danger').length
  };
});

const fieldViews = computed<Array<{ value: FieldView; label: string; count: number }>>(() => {
  const views: Array<{ value: FieldView; label: string; count: number }> = [
    { value: 'all' as const, label: fieldViewLabelMap.all, count: fieldStats.value.total },
    { value: 'form' as const, label: fieldViewLabelMap.form, count: fieldStats.value.form },
    { value: 'list' as const, label: fieldViewLabelMap.list, count: fieldStats.value.list },
    { value: 'query' as const, label: fieldViewLabelMap.query, count: fieldStats.value.query }
  ];
  if (props.generatorInfo.hasImport === '1') {
    views.push({ value: 'import' as const, label: fieldViewLabelMap.import, count: fieldStats.value.import });
  }
  if (props.generatorInfo.hasExport === '1') {
    views.push({ value: 'export' as const, label: fieldViewLabelMap.export, count: fieldStats.value.export });
  }
  if (fieldStats.value.issues > 0) {
    views.push({ value: 'issues' as const, label: fieldViewLabelMap.issues, count: fieldStats.value.issues });
  }
  return views;
});

const filteredColumns = computed(() => {
  const normalizedKeyword = keyword.value.trim().toLowerCase();
  if (!normalizedKeyword) return props.columnsInfos;
  return props.columnsInfos.filter(row => matchKeyword(row, normalizedKeyword));
});

const selectedColumn = computed(() => {
  return filteredColumns.value.find(row => row.columnId === selectedColumnId.value) || filteredColumns.value[0];
});
const selectedColumnIndex = computed(() => {
  if (!selectedColumn.value) return -1;
  return filteredColumns.value.findIndex(row => row.columnId === selectedColumn.value?.columnId);
});
const selectedFieldHint = computed(() => (selectedColumn.value ? getFieldHint(selectedColumn.value) : undefined));
const bulkStates = computed(() => {
  return {
    form: getBulkState('form'),
    list: getBulkState('list'),
    query: getBulkState('query'),
    import: getBulkState('import'),
    export: getBulkState('export')
  };
});
const fieldViewHelpText = computed(() => {
  if (fieldView.value === 'all') return '展示全部字段和常用操作列';
  if (fieldView.value === 'issues') return '展示字段提示列，字段行不收缩';
  return `展示全部字段，仅突出${fieldViewLabelMap[fieldView.value]}勾选列`;
});
const emptyDescription = computed(() => {
  if (keyword.value.trim()) return '没有匹配的字段';
  return '暂无字段';
});

watchEffect(() => {
  columns.value.forEach(column => {
    if (column.type === 'sort') column.isShow = canSort.value;
    if (column.prop) column.isShow = isColumnVisible(column.prop);
  });
});

watch(canSort, () => {
  tableKey.value += 1;
});

watch(
  () => [props.generatorInfo.hasImport, props.generatorInfo.hasExport],
  () => {
    if (fieldView.value === 'import' && props.generatorInfo.hasImport !== '1') fieldView.value = 'all';
    if (fieldView.value === 'export' && props.generatorInfo.hasExport !== '1') fieldView.value = 'all';
  }
);

watch(
  () => props.focusIssues,
  value => {
    if (!value) return;
    focusFirstIssue();
  }
);

watch(
  () => fieldStats.value.issues,
  count => {
    if (count === 0 && fieldView.value === 'issues') fieldView.value = 'all';
  }
);

watch(filteredColumns, rows => {
  if (!rows.length) {
    selectedColumnId.value = undefined;
    return;
  }
  if (!rows.some(row => row.columnId === selectedColumnId.value)) {
    selectedColumnId.value = rows[0].columnId;
  }
});

function isDictionaryDisplayType(htmlType?: string) {
  return dictionaryDisplayTypes.includes(htmlType || '');
}

function htmlTypeChange(row: GeneratorColumnInfo) {
  if (row.htmlType === 'radio-group') row.htmlType = 'radio';
  if (isDictionaryDisplayType(row.htmlType)) {
    row.searchType = 'select';
    row.dictShowWay = row.dictShowWay || dictShowWayOptions[0]?.value || '0';
  }
}

function dictTypeChange(row: GeneratorColumnInfo) {
  if (row.dictType && !row.dictShowWay) {
    row.dictShowWay = dictShowWayOptions[0]?.value || '0';
  }
}

function getFieldHint(row: GeneratorColumnInfo): FieldHint {
  if (row.isLogicDel === '1') {
    return {
      label: '逻辑删除',
      type: 'info',
      description: '逻辑删除字段通常不参与页面展示和查询配置，仅保留删除标识相关生成配置。'
    };
  }
  if (isDictionaryDisplayType(row.htmlType) && !row.dictType) {
    return {
      label: '字典缺失',
      type: 'danger',
      description: '当前显示类型依赖字典数据，请在右侧选择字典类型后再进入下一步。'
    };
  }
  if (row.htmlType === 'fileUpload' || row.htmlType === 'imageUpload') {
    return {
      label: '上传字段',
      type: 'warning',
      description: '上传字段需要确认 Java 类型、前端上传控件和附件存储能力是否匹配。'
    };
  }
  if (row.columnName === 'create_id' || row.columnName === 'dept_scope') {
    return {
      label: '权限字段',
      type: 'info',
      description: '该字段常用于创建人或数据权限范围，请确认是否需要在列表、表单或查询中展示。'
    };
  }
  return {
    label: '正常',
    type: 'success',
    description: '未发现需要额外处理的字段配置。'
  };
}

function matchKeyword(row: GeneratorColumnInfo, normalizedKeyword: string) {
  if (!normalizedKeyword) return true;
  return [row.columnName, row.columnComment, row.javaType, row.columnType]
    .filter(Boolean)
    .some(value => String(value).toLowerCase().includes(normalizedKeyword));
}

function isColumnVisible(prop: string) {
  if (prop === 'isInsert') return isServerOutput.value && ['all', 'form'].includes(fieldView.value);
  if (prop === 'isList') return isServerOutput.value && ['all', 'list'].includes(fieldView.value);
  if (prop === 'isQuery') return isServerOutput.value && ['all', 'query'].includes(fieldView.value);
  if (prop === 'isImport')
    return isServerOutput.value && props.generatorInfo.hasImport === '1' && ['all', 'import'].includes(fieldView.value);
  if (prop === 'isExport')
    return isServerOutput.value && props.generatorInfo.hasExport === '1' && ['all', 'export'].includes(fieldView.value);
  if (prop === 'autofillStatus')
    return isServerOutput.value && props.generatorInfo.isAutofill === '1' && fieldView.value === 'all';
  return true;
}

function getAutofillLabel(autofillType?: string) {
  if (autofillType === 'FieldFill.INSERT') return '新增';
  if (autofillType === 'FieldFill.UPDATE') return '更新';
  if (autofillType === 'FieldFill.INSERT_UPDATE') return '新增/更新';
  return '自动';
}

function selectColumn(row: GeneratorColumnInfo) {
  selectedColumnId.value = row.columnId;
  nextTick(() => {
    const table = fieldTableRef.value?.element;
    const rowIndex = filteredColumns.value.findIndex(item => item.columnId === row.columnId);
    table?.setCurrentRow?.(row);
    table?.setScrollTop?.(Math.max(rowIndex * 40 - 80, 0));
  });
}

function switchFieldView(view: FieldView) {
  fieldView.value = view;
  if (view === 'issues') focusFirstIssue();
}

function focusFirstIssue() {
  const issueColumn = props.columnsInfos.find(row => getFieldHint(row).type === 'danger');
  if (!issueColumn) return;
  fieldView.value = 'issues';
  selectColumn(issueColumn);
}

function selectAdjacentColumn(offset: number) {
  const rows = filteredColumns.value;
  if (!rows.length) return;
  const currentIndex = selectedColumnIndex.value >= 0 ? selectedColumnIndex.value : 0;
  const nextIndex = Math.min(Math.max(currentIndex + offset, 0), rows.length - 1);
  const nextRow = rows[nextIndex];
  if (!nextRow) return;
  selectColumn(nextRow);
}

function resetFieldFilters() {
  keyword.value = '';
  fieldView.value = 'all';
}

function isFormEnabled(row: GeneratorColumnInfo) {
  return row.isInsert === '1' || row.isEdit === '1';
}

function isTargetEnabled(row: GeneratorColumnInfo, target: BulkTarget) {
  if (target === 'form') return isFormEnabled(row);
  if (target === 'list') return row.isList === '1';
  if (target === 'query') return row.isQuery === '1';
  if (target === 'import') return row.isImport === '1';
  return row.isExport === '1';
}

function setTargetEnabled(row: GeneratorColumnInfo, target: BulkTarget, checked: boolean) {
  const value = checked ? '1' : '0';
  if (target === 'form') {
    row.isInsert = value;
    row.isEdit = value;
    return;
  }
  if (target === 'list') {
    row.isList = value;
    return;
  }
  if (target === 'query') {
    row.isQuery = value;
    return;
  }
  if (target === 'import') {
    row.isImport = value;
    return;
  }
  row.isExport = value;
}

function getBulkState(target: BulkTarget) {
  const rows = filteredColumns.value;
  const checkedCount = rows.filter(row => isTargetEnabled(row, target)).length;
  return {
    checked: rows.length > 0 && checkedCount === rows.length,
    indeterminate: checkedCount > 0 && checkedCount < rows.length
  };
}

function targetLabel(target: BulkTarget) {
  if (target === 'form') return '表单';
  if (target === 'list') return '列表';
  if (target === 'query') return '查询';
  if (target === 'import') return '导入';
  return '导出';
}

function bulkCheckTip(target: BulkTarget) {
  const state = bulkStates.value[target];
  const action = state.checked && !state.indeterminate ? '取消' : '选择';
  return `${action}当前列表中的 ${filteredColumns.value.length} 个字段为${targetLabel(target)}字段`;
}

function normalizeChecked(value: CheckboxValue) {
  return Boolean(value);
}

function toggleRowTarget(row: GeneratorColumnInfo, target: BulkTarget, checked: boolean) {
  setTargetEnabled(row, target, checked);
  selectColumn(row);
}

function toggleRowTargetByValue(row: GeneratorColumnInfo, target: BulkTarget, value: CheckboxValue) {
  toggleRowTarget(row, target, normalizeChecked(value));
}

function toggleVisibleFields(target: BulkTarget, checked: boolean) {
  filteredColumns.value.forEach(row => setTargetEnabled(row, target, checked));
  const action = checked ? '加入' : '移出';
  ElMessage.success(`已将当前列表 ${filteredColumns.value.length} 个字段${action}${targetLabel(target)}`);
}

function toggleVisibleFieldsByValue(target: BulkTarget, value: CheckboxValue) {
  toggleVisibleFields(target, normalizeChecked(value));
}
</script>

<style scoped lang="scss">
.field-config-step {
  display: flex;
  flex-direction: column;
  gap: 6px;
  height: 100%;
  min-height: 0;
  padding: 0 2px;
}

.field-toolbar {
  display: grid;
  grid-template-columns: auto minmax(240px, 340px) auto;
  gap: 10px;
  align-items: center;
}

.toolbar-main,
.field-filter-group,
.control-caption {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 12px;
  justify-content: flex-end;
  min-width: 0;
  white-space: nowrap;
}

.option-label {
  margin-right: -2px;
}

.option-slot {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  gap: 14px;
  white-space: nowrap;
}

.toolbar-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.generate-type-switch {
  flex: 0 0 auto;
}

.field-search {
  width: 100%;
}

.field-control-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.field-filter-group {
  flex: 1;
  min-width: 0;
}

.control-caption {
  flex: 0 0 auto;
  gap: 5px;
}

.control-label {
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}

.control-help {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.field-overview {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;
}

.field-stat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: auto;
  min-width: 92px;
  min-height: 30px;
  padding: 4px 10px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 5px;

  span {
    min-width: 0;
    overflow: hidden;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    min-width: 18px;
    font-size: 14px;
    color: var(--el-text-color-primary);
    text-align: right;
  }

  &.active {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
  }

  &.danger strong {
    color: var(--el-color-danger);
  }
}

.field-layout {
  display: grid;
  flex: 1;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 0;
  min-height: 0;
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  outline: none;
}

.field-layout:focus-visible {
  border-color: var(--el-color-primary-light-5);
  box-shadow: 0 0 0 2px var(--el-color-primary-light-9);
}

.field-layout.is-detail-collapsed {
  grid-template-columns: minmax(0, 1fr);
}

.field-table-wrap {
  position: relative;
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.field-table {
  height: 100%;
  min-width: 0;
}

.field-table :deep(.table-main) {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.field-table :deep(.table-header) {
  display: none;
}

.field-table :deep(.el-table) {
  flex: 1;
  min-height: 0;
}

.field-table :deep(.el-table__cell) {
  padding: 4px 0;
}

.field-table :deep(.el-table__header .el-table__cell) {
  padding: 6px 0;
}

.field-table :deep(.el-input__wrapper),
.field-table :deep(.el-select__wrapper) {
  min-height: 28px;
}

.field-empty-layer {
  position: absolute;
  inset: 42px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  background: color-mix(in srgb, var(--el-bg-color) 88%, transparent);
}

.field-empty-layer :deep(.el-empty) {
  pointer-events: auto;
}

.field-hint-header {
  line-height: 1;
  font-weight: normal;
}

.column-check-header {
  height: 18px;
}

.column-check-header :deep(.el-checkbox__label) {
  padding-left: 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.field-cell-main {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

:deep(.el-card) {
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

:deep(.el-card__body) {
  padding: 0;
}

:deep(.el-table__row) {
  cursor: pointer;
}

:deep(.el-select) {
  width: 100%;
}

@media (max-width: 1500px) {
  .field-toolbar,
  .field-control-row {
    grid-template-columns: 1fr;
  }

  .toolbar-actions,
  .field-control-row {
    justify-content: flex-start;
  }

  .field-filter-group {
    align-items: flex-start;
    flex-direction: column;
  }

  .field-overview {
    width: 100%;
  }

  .field-layout {
    grid-template-columns: minmax(0, 1fr) 280px;
  }
}
</style>
