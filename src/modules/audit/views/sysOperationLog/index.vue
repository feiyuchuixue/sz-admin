<template>
  <div class="table-box operation-log-page">
    <div class="audit-control-card">
      <div class="control-head">
        <el-tabs v-model="activeTab" class="operation-log-tabs" @tab-change="handleTabChange">
          <el-tab-pane label="审计日志" name="audit" />
          <el-tab-pane label="性能日志" name="performance" />
          <el-tab-pane label="异常日志" name="exception" />
        </el-tabs>
        <el-button type="primary" link :icon="topCollapsed ? ArrowDown : ArrowUp" @click="topCollapsed = !topCollapsed">
          {{ topCollapsed ? '展开概览' : '收起概览' }}
        </el-button>
      </div>

      <ElCollapseTransition>
        <div
          v-show="!topCollapsed"
          class="summary-strip"
          :class="{ 'is-single': activeTab === 'exception' }"
          v-loading="summaryLoading"
        >
          <div v-for="item in summaryItems" :key="item.label" class="summary-item">
            <el-icon :class="item.iconClass">
              <component :is="item.icon" />
            </el-icon>
            <div>
              <div class="summary-label">{{ item.label }}</div>
              <div class="summary-value">{{ item.value }}</div>
            </div>
          </div>
        </div>
      </ElCollapseTransition>

      <div class="filter-panel">
        <div class="quick-filter-row">
          <div class="quick-filter-main">
            <span class="quick-filter-label">快捷筛选</span>
            <el-check-tag
              v-for="item in quickFilters"
              :key="item.value"
              :checked="quickFilter === item.value"
              @change="applyQuickFilter(item.value)"
            >
              {{ item.label }}
            </el-check-tag>
          </div>
          <div class="quick-filter-actions">
            <div class="quick-time-group">
              <span class="quick-filter-label">操作时间</span>
              <el-date-picker
                v-model="filterModel.operationTime"
                class="quick-time-range"
                type="datetimerange"
                value-format="YYYY-MM-DD HH:mm:ss"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                :clearable="false"
                @change="markCustomTimeRange"
              />
            </div>
            <el-button type="primary" :icon="Search" @click="searchTable">查询</el-button>
          </div>
        </div>

        <el-form v-show="advancedVisible" :model="filterModel" label-width="72px" class="filter-form" @submit.prevent>
          <ElCollapseTransition>
            <div class="filter-grid advanced-grid">
              <el-form-item label="模块">
                <el-input v-model="filterModel.moduleName" clearable placeholder="请输入" @change="markCustomFilter" />
              </el-form-item>
              <el-form-item label="操作类型">
                <el-select v-model="filterModel.operationType" clearable placeholder="请选择" @change="markCustomFilter">
                  <el-option v-for="item in operationTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
              <el-form-item label="操作人">
                <el-input v-model="filterModel.userName" clearable placeholder="请输入" @change="markCustomFilter" />
              </el-form-item>
              <el-form-item label="结果">
                <el-select v-model="filterModel.status" clearable placeholder="请选择" @change="markCustomFilter">
                  <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
              <el-form-item label="方法">
                <el-select v-model="filterModel.requestMethod" clearable placeholder="请选择" @change="markCustomFilter">
                  <el-option v-for="item in requestMethodOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
              <el-form-item label="接口路由">
                <el-input v-model="filterModel.requestUri" clearable placeholder="请输入" @change="markCustomFilter" />
              </el-form-item>
              <el-form-item label="业务ID">
                <el-input v-model="filterModel.businessId" clearable placeholder="请输入" @change="markCustomFilter" />
              </el-form-item>
              <el-form-item label="TraceId">
                <el-input v-model="filterModel.traceId" clearable placeholder="请输入" @change="markCustomFilter" />
              </el-form-item>
              <el-form-item label="最小耗时">
                <el-input-number
                  v-model="filterModel.minCostMs"
                  :min="0"
                  :controls="false"
                  placeholder="毫秒"
                  @change="markCustomFilter"
                />
              </el-form-item>
            </div>
          </ElCollapseTransition>

          <div class="filter-actions">
            <el-button type="primary" :icon="Search" @click="searchTable">搜索</el-button>
            <el-button :icon="Delete" @click="resetCustomFilters">重置</el-button>
          </div>
        </el-form>
      </div>
    </div>

    <ProTable
      :key="activeTab"
      ref="proTableRef"
      :title="tableTitle"
      :indent="20"
      :columns="columns"
      :search-columns="[]"
      :request-api="getTableList"
      :tool-button="false"
      :height="tableHeight"
      row-key="id"
    >
      <template #operation="{ row }">
        <el-button v-auth="'sys.operation.log.detail'" type="primary" link :icon="View" @click="openDetail(row)">
          详情
        </el-button>
      </template>
      <template #empty>
        <div class="audit-empty">
          <div class="audit-empty-title">{{ emptyTitle }}</div>
          <div class="audit-empty-desc">{{ emptyDescription }}</div>
        </div>
      </template>
    </ProTable>

    <OperationLogDetail ref="operationLogDetailRef" />
  </div>
</template>

<script setup lang="tsx">
import { computed, nextTick, reactive, ref } from 'vue';
import { ArrowDown, ArrowUp, CircleCheck, Delete, Search, Timer, TrendCharts, View, Warning } from '@element-plus/icons-vue';
import { ElCollapseTransition } from 'element-plus';
import ProTable from '@/components/ProTable/index.vue';
import OperationLogDetail from '@/modules/audit/views/sysOperationLog/components/OperationLogDetail.vue';
import { getSysOperationLogListApi, getSysOperationLogSummaryApi } from '@/modules/audit/api/sysOperationLog';
import type { ColumnProps, ProTableInstance } from '@/components/ProTable/interface';
import type {
  OperationLogTab,
  SysOperationLogQuery,
  SysOperationLogRow,
  SysOperationLogSummary
} from '@/modules/audit/types/sysOperationLog';

defineOptions({
  name: 'SysOperationLogView'
});

type TagType = 'primary' | 'success' | 'warning' | 'danger' | 'info';
type QuickFilter = 'all' | 'fail' | 'slow' | 'today' | 'sevenDays' | 'custom';

type OptionItem = {
  label: string;
  value: string;
  tagType: TagType;
};

const proTableRef = ref<ProTableInstance>();
const operationLogDetailRef = ref<InstanceType<typeof OperationLogDetail>>();
const activeTab = ref<OperationLogTab>('audit');
const quickFilter = ref<QuickFilter>('all');
const summaryLoading = ref(false);
const topCollapsed = ref(false);
const advancedVisible = ref(false);
const summary = ref<SysOperationLogSummary>({});
const filterModel = reactive<SysOperationLogQuery>({});

const quickFilters: { label: string; value: QuickFilter }[] = [
  { label: '全部', value: 'all' },
  { label: '仅失败', value: 'fail' },
  { label: '慢操作', value: 'slow' },
  { label: '今天', value: 'today' },
  { label: '近7天', value: 'sevenDays' },
  { label: '自定义', value: 'custom' }
];

const statusOptions: OptionItem[] = [
  { label: '成功', value: 'SUCCESS', tagType: 'success' },
  { label: '失败', value: 'FAIL', tagType: 'danger' }
];

const requestMethodOptions: OptionItem[] = [
  { label: 'GET', value: 'GET', tagType: 'success' },
  { label: 'POST', value: 'POST', tagType: 'primary' },
  { label: 'PUT', value: 'PUT', tagType: 'warning' },
  { label: 'DELETE', value: 'DELETE', tagType: 'danger' },
  { label: 'PATCH', value: 'PATCH', tagType: 'info' }
];

const operationTypeOptions: OptionItem[] = [
  { label: '自动', value: 'AUTO', tagType: 'info' },
  { label: '新增', value: 'CREATE', tagType: 'success' },
  { label: '修改', value: 'UPDATE', tagType: 'warning' },
  { label: '删除', value: 'DELETE', tagType: 'danger' },
  { label: '查询', value: 'QUERY', tagType: 'info' },
  { label: '导入', value: 'IMPORT', tagType: 'primary' },
  { label: '导出', value: 'EXPORT', tagType: 'primary' },
  { label: '登录', value: 'LOGIN', tagType: 'success' },
  { label: '登出', value: 'LOGOUT', tagType: 'info' },
  { label: '其他', value: 'OTHER', tagType: 'info' }
];

const DEFAULT_ALL_DAYS = 29;

const tableTitle = computed(() => {
  if (activeTab.value === 'performance') return '慢操作流水';
  if (activeTab.value === 'exception') return '异常流水';
  return '操作流水';
});

const tableHeight = computed(() => {
  if (topCollapsed.value) return advancedVisible.value ? 'calc(100vh - 420px)' : 'calc(100vh - 300px)';
  return advancedVisible.value ? 'calc(100vh - 500px)' : 'calc(100vh - 390px)';
});

const emptyTitle = computed(() => {
  if (activeTab.value === 'performance') return '当前筛选范围内没有慢操作';
  if (activeTab.value === 'exception') return '当前筛选范围内没有异常记录';
  return '当前筛选范围内没有审计记录';
});

const emptyDescription = computed(() => {
  if (activeTab.value === 'performance') return '如果确认已开启诊断采集，可放宽时间范围或降低最小耗时条件。';
  if (activeTab.value === 'exception') return '这通常代表当前时间范围内没有失败事件，也可以放宽筛选条件继续排查。';
  return '可以切换时间范围、失败或慢操作筛选来查看更聚焦的事件。';
});

const summaryItems = computed(() => {
  if (activeTab.value === 'performance') {
    return [
      { label: '慢操作数', value: formatNumber(summary.value.totalCount), icon: Timer, iconClass: 'is-warning' },
      { label: '成功率', value: `${summary.value.successRate ?? 0}%`, icon: CircleCheck, iconClass: 'is-success' },
      { label: '异常数', value: formatNumber(summary.value.exceptionCount), icon: Warning, iconClass: 'is-danger' },
      { label: '当前结果数', value: formatNumber(summary.value.totalCount), icon: TrendCharts, iconClass: 'is-total' }
    ];
  }
  if (activeTab.value === 'exception') {
    return [{ label: '异常记录数', value: formatNumber(summary.value.totalCount), icon: Warning, iconClass: 'is-danger' }];
  }
  return [
    { label: '总操作数', value: formatNumber(summary.value.totalCount), icon: TrendCharts, iconClass: 'is-total' },
    { label: '成功率', value: `${summary.value.successRate ?? 0}%`, icon: CircleCheck, iconClass: 'is-success' },
    { label: '失败数', value: formatNumber(summary.value.failCount), icon: Warning, iconClass: 'is-danger' },
    { label: '慢操作数', value: formatNumber(summary.value.slowCount), icon: Timer, iconClass: 'is-warning' }
  ];
});

const findOption = (options: OptionItem[], value?: string) => options.find(item => item.value === value);
const formatOption = (options: OptionItem[], value?: string) => findOption(options, value)?.label || value || '-';
const getTagType = (options: OptionItem[], value?: string): TagType => findOption(options, value)?.tagType || 'info';
const renderTag = (options: OptionItem[], value?: string) => (
  <el-tag type={getTagType(options, value)}>{formatOption(options, value)}</el-tag>
);

const renderStatus = (value?: string) => {
  const option = findOption(statusOptions, value);
  return <span class={`status-pill is-${option?.tagType || 'info'}`}>{option?.label || value || '-'}</span>;
};

const formatNumber = (value?: number) => (value ?? 0).toLocaleString();

const formatCost = (value?: number) => {
  if (value === null || value === undefined) return '-';
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}s`;
  return `${value}ms`;
};

const formatRelativeTime = (value?: string) => {
  if (!value) return '-';
  const time = new Date(value.replace(/-/g, '/')).getTime();
  if (Number.isNaN(time)) return value;
  const diffSeconds = Math.max(0, Math.floor((Date.now() - time) / 1000));
  if (diffSeconds < 60) return '刚刚';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}分钟前`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}小时前`;
  return `${Math.floor(diffSeconds / 86400)}天前`;
};

const formatTimeParts = (value?: string) => {
  if (!value) return { date: '-', time: '-' };
  const [date = '-', time = '-'] = value.split(' ');
  return { date, time };
};

const openDetail = (row: SysOperationLogRow) => {
  if (!row.id) return;
  operationLogDetailRef.value?.show(row.id, activeTab.value);
};

const operationContentColumn: ColumnProps<SysOperationLogRow> = {
  prop: 'operationName',
  label: '操作内容',
  minWidth: 300,
  align: 'left',
  showOverflowTooltip: false,
  render: ({ row }) => (
    <div class="operation-summary">
      <div class="summary-title-line">
        {renderTag(operationTypeOptions, row.operationType)}
        <span class="summary-title">{row.moduleName || '未知模块'}</span>
      </div>
      <span class="summary-subtitle">{row.operationName || row.businessId || row.requestUri || '-'}</span>
    </div>
  )
};

const userColumn: ColumnProps<SysOperationLogRow> = {
  prop: 'userName',
  label: '操作人',
  minWidth: 170,
  align: 'left',
  showOverflowTooltip: false,
  render: ({ row }) => (
    <div class="operation-summary">
      <span class="summary-title">{row.userName || row.userId || '-'}</span>
      <span class="summary-subtitle">{row.ipAddress ? `IP: ${row.ipAddress}` : '未知来源'}</span>
    </div>
  )
};

const operationTimeColumn: ColumnProps<SysOperationLogRow> = {
  prop: 'operationTime',
  label: '时间',
  width: 170,
  align: 'left',
  showOverflowTooltip: false,
  render: ({ row }) => {
    const timeParts = formatTimeParts(row.operationTime);
    return (
      <div class="operation-summary">
        <span class="summary-title">{timeParts.time}</span>
        <span class="summary-subtitle">
          {timeParts.date}
          {row.operationTime ? ` · ${formatRelativeTime(row.operationTime)}` : ''}
        </span>
      </div>
    );
  }
};

const operationColumn: ColumnProps<SysOperationLogRow> = { prop: 'operation', label: '操作', width: 90, fixed: 'right' };

const requestMethodColumn: ColumnProps<SysOperationLogRow> = {
  prop: 'requestMethod',
  label: '方法',
  width: 96,
  render: ({ row }) => renderTag(requestMethodOptions, row.requestMethod)
};

const statusColumn: ColumnProps<SysOperationLogRow> = {
  prop: 'status',
  label: '结果',
  width: 116,
  align: 'left',
  showOverflowTooltip: false,
  render: ({ row }) => (
    <div class="operation-summary">
      {renderStatus(row.status)}
      {row.status === 'FAIL' && <span class="summary-subtitle">{row.errorMessage || row.responseMessage || '执行失败'}</span>}
    </div>
  )
};

const traceColumn: ColumnProps<SysOperationLogRow> = {
  prop: 'traceId',
  label: 'TraceId',
  width: 300,
  align: 'left',
  showOverflowTooltip: false,
  render: ({ row }) =>
    row.traceId ? (
      <el-tooltip content={row.traceId} placement="top">
        <el-tag class="tag-item trace-tag" type="primary">
          {row.traceId}
        </el-tag>
      </el-tooltip>
    ) : (
      <span class="summary-subtitle">-</span>
    )
};

const costColumn: ColumnProps<SysOperationLogRow> = {
  prop: 'costMs',
  label: '耗时',
  width: 110,
  render: ({ row }) => <span class={{ 'cost-value': true, 'is-slow': row.slowFlag === 'T' }}>{formatCost(row.costMs)}</span>
};

const requestUriColumn: ColumnProps<SysOperationLogRow> = {
  prop: 'requestUri',
  label: '接口/路径',
  minWidth: 240,
  showOverflowTooltip: true
};

const errorColumn: ColumnProps<SysOperationLogRow> = {
  prop: 'errorMessage',
  label: '异常摘要',
  minWidth: 260,
  align: 'left',
  showOverflowTooltip: false,
  render: ({ row }) => (
    <div class="operation-summary">
      <span class="summary-title is-error">{row.errorType || row.responseCode || '异常'}</span>
      <span class="summary-subtitle">{row.errorMessage || row.responseMessage || '-'}</span>
    </div>
  )
};

const baseTailColumns: ColumnProps<SysOperationLogRow>[] = [
  userColumn,
  operationTimeColumn,
  requestMethodColumn,
  costColumn,
  operationColumn
];
const auditColumns: ColumnProps<SysOperationLogRow>[] = [operationContentColumn, traceColumn, statusColumn, ...baseTailColumns];
const performanceColumns: ColumnProps<SysOperationLogRow>[] = [
  costColumn,
  requestUriColumn,
  operationContentColumn,
  traceColumn,
  statusColumn,
  userColumn,
  operationTimeColumn,
  operationColumn
];
const exceptionColumns: ColumnProps<SysOperationLogRow>[] = [
  errorColumn,
  requestUriColumn,
  operationContentColumn,
  userColumn,
  operationTimeColumn,
  costColumn,
  operationColumn
];

const columns = computed<ColumnProps<SysOperationLogRow>[]>(() => {
  if (activeTab.value === 'performance') return performanceColumns;
  if (activeTab.value === 'exception') return exceptionColumns;
  return auditColumns;
});

const getTableList = async (params: SysOperationLogQuery) => {
  const listParams = formatParams(params, true);
  await refreshSummary(listParams);
  return getSysOperationLogListApi(listParams);
};

const formatParams = (params: SysOperationLogQuery, withSceneFilter = true) => {
  const newParams: SysOperationLogQuery = {
    ...JSON.parse(JSON.stringify(params || {})),
    ...JSON.parse(JSON.stringify(filterModel))
  };
  if (newParams.operationTime?.length) {
    newParams.operationTimeStart = newParams.operationTime[0];
    newParams.operationTimeEnd = newParams.operationTime[1];
    delete newParams.operationTime;
  }
  Object.keys(newParams).forEach(key => {
    const value = newParams[key as keyof SysOperationLogQuery];
    if (value === '' || value === null || value === undefined) {
      delete newParams[key as keyof SysOperationLogQuery];
    }
  });
  if (withSceneFilter && activeTab.value === 'performance') {
    newParams.slowFlag = 'T';
  }
  if (withSceneFilter && activeTab.value === 'exception') {
    newParams.status = 'FAIL';
  }
  return newParams;
};

const refreshSummary = async (params?: SysOperationLogQuery) => {
  summaryLoading.value = true;
  try {
    const requestParams = params || formatParams({}, true);
    const { data } = await getSysOperationLogSummaryApi(requestParams);
    summary.value = data || {};
  } finally {
    summaryLoading.value = false;
  }
};

const applyQuickFilter = async (value: QuickFilter) => {
  resetFilterModel({ keepTime: value === 'fail' || value === 'slow' || value === 'custom' });
  if (value === 'custom') {
    quickFilter.value = value;
    advancedVisible.value = true;
    filterModel.operationTime ||= createTimeRange(0);
    await nextTick();
    searchTable();
    return;
  }
  quickFilter.value = value;
  advancedVisible.value = false;
  if (value === 'fail') filterModel.status = 'FAIL';
  if (value === 'slow') filterModel.slowFlag = 'T';
  if (value === 'today') filterModel.operationTime = createTimeRange(0);
  if (value === 'sevenDays') filterModel.operationTime = createTimeRange(6);
  await nextTick();
  searchTable();
};

const markCustomTimeRange = () => {
  quickFilter.value = 'custom';
};

const markCustomFilter = () => {
  quickFilter.value = 'custom';
  advancedVisible.value = true;
};

const searchTable = () => {
  proTableRef.value?.search();
};

const resetFilterModel = (options: { keepTime?: boolean } = {}) => {
  const operationTime = options.keepTime ? filterModel.operationTime : undefined;
  Object.keys(filterModel).forEach(key => {
    delete filterModel[key as keyof SysOperationLogQuery];
  });
  filterModel.operationTime = operationTime || createTimeRange(DEFAULT_ALL_DAYS);
};

const resetCustomFilters = () => {
  resetFilterModel();
  quickFilter.value = 'custom';
  searchTable();
};

const createTimeRange = (daysBefore: number) => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - daysBefore);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 0);
  return [formatDateTime(start), formatDateTime(end)];
};

const formatDateTime = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

filterModel.operationTime = createTimeRange(DEFAULT_ALL_DAYS);

const handleTabChange = async () => {
  resetFilterModel();
  quickFilter.value = 'all';
  advancedVisible.value = false;
  await nextTick();
  proTableRef.value?.clearSelection();
};
</script>

<style scoped lang="scss">
.audit-control-card {
  padding: 12px 18px;
  margin-bottom: 12px;
  background: var(--el-bg-color);
  border-radius: 6px;
}

.control-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 34px;
}

.operation-log-tabs {
  flex: 1;

  :deep(.el-tabs__header) {
    margin-bottom: 0;
  }
}

.summary-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
}

.summary-strip.is-single {
  grid-template-columns: minmax(220px, 1fr);
}

.summary-item {
  display: flex;
  gap: 10px;
  align-items: center;
  min-height: 54px;
  padding: 10px 12px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;

  .el-icon {
    width: 30px;
    height: 30px;
    font-size: 17px;
    border-radius: 6px;
  }
}

.summary-label {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.summary-value {
  margin-top: 2px;
  color: var(--el-text-color-primary);
  font-size: 18px;
  font-weight: 600;
}

.is-total {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.is-success {
  color: var(--el-color-success);
  background: var(--el-color-success-light-9);
}

.is-warning {
  color: var(--el-color-warning);
  background: var(--el-color-warning-light-9);
}

.is-danger {
  color: var(--el-color-danger);
  background: var(--el-color-danger-light-9);
}

.filter-panel {
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.quick-filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 34px;
  margin-bottom: 8px;
}

.quick-filter-main {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.quick-filter-label {
  margin-right: 4px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.quick-filter-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
}

.quick-time-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.quick-time-range {
  width: 420px;
  max-width: 100%;
}

.filter-form {
  :deep(.el-form-item) {
    margin-bottom: 10px;
  }
}

.advanced-grid {
  display: grid;
  gap: 0 16px;
  grid-template-columns: repeat(3, minmax(180px, 1fr));
}

.time-range-item {
  :deep(.el-date-editor) {
    width: 100%;
  }
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

:deep(.table-main) {
  padding-top: 12px;
}

:deep(.table-header) {
  display: none;
}

:deep(.operation-summary) {
  display: flex;
  flex-direction: column;
  gap: 4px;
  line-height: 1.35;
  text-align: left;
}

:deep(.summary-title-line) {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
}

:deep(.summary-title) {
  min-width: 0;
  overflow: hidden;
  color: var(--el-text-color-primary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.summary-subtitle) {
  max-width: 100%;
  overflow: hidden;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.status-pill) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-width: 48px;
  height: 24px;
  padding: 0 10px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 24px;
}

:deep(.status-pill.is-success) {
  color: var(--el-color-success);
  background: var(--el-color-success-light-9);
  border: 1px solid var(--el-color-success-light-7);
}

:deep(.status-pill.is-danger) {
  color: var(--el-color-danger);
  background: var(--el-color-danger-light-9);
  border: 1px solid var(--el-color-danger-light-7);
}

:deep(.status-pill.is-info) {
  color: var(--el-color-info);
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-light);
}

:deep(.trace-tag) {
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
  white-space: nowrap;
  cursor: default;
}

:deep(.cost-value) {
  font-weight: 600;
}

:deep(.is-slow) {
  color: var(--el-color-warning);
}

:deep(.is-error) {
  color: var(--el-color-danger);
}

.audit-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 160px;
}

.audit-empty-title {
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.audit-empty-desc {
  margin-top: 6px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

@media (max-width: 1200px) {
  .advanced-grid {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }

  .quick-filter-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .quick-filter-actions {
    justify-content: flex-start;
    width: 100%;
  }

  .quick-time-group {
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .summary-strip,
  .advanced-grid {
    grid-template-columns: 1fr;
  }

  .quick-time-range {
    width: 100%;
  }
}
</style>
