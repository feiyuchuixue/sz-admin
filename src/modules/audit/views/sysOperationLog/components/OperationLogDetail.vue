<template>
  <el-drawer
    v-model="drawerVisible"
    :title="drawerTitle"
    :size="drawerSize"
    destroy-on-close
    append-to-body
    class="operation-log-detail"
  >
    <template v-if="detail">
      <div class="detail-hero">
        <div class="detail-hero-main">
          <el-tag :type="getOptionTagType(operationTypeOptions, detail.operationType)">
            {{ formatOption(operationTypeOptions, detail.operationType) }}
          </el-tag>
          <span class="detail-hero-title">{{ detail.operationName || detail.moduleName || detail.requestUri || '-' }}</span>
        </div>
        <el-tag :type="detail.status === 'SUCCESS' ? 'success' : 'danger'">
          {{ formatStatus(detail.status) }}
        </el-tag>
        <div class="detail-hero-meta">
          {{ formatUser(detail) }} · {{ detail.operationTime || '-' }} · 耗时 {{ formatCost(detail.costMs) }} ·
          {{ detail.ipAddress || '未知来源' }}
        </div>
      </div>

      <el-collapse v-model="activeCollapse" class="detail-collapse">
        <el-collapse-item title="基础信息" name="base">
          <el-descriptions :column="2" border>
            <el-descriptions-item v-for="item in summaryItems" :key="item.label" :label="item.label" :span="item.span || 1">
              <el-tag v-if="item.type === 'status'" :type="detail.status === 'SUCCESS' ? 'success' : 'danger'">
                {{ formatStatus(detail.status) }}
              </el-tag>
              <el-tag v-else-if="item.type === 'slowFlag'" :type="detail.slowFlag === 'T' ? 'warning' : 'info'">
                {{ formatYesNo(detail.slowFlag) }}
              </el-tag>
              <el-tag
                v-else-if="item.type === 'operationType'"
                :type="getOptionTagType(operationTypeOptions, detail.operationType)"
              >
                {{ formatOption(operationTypeOptions, detail.operationType) }}
              </el-tag>
              <el-tag
                v-else-if="item.type === 'requestMethod'"
                :type="getOptionTagType(requestMethodOptions, detail.requestMethod)"
              >
                {{ detail.requestMethod || '-' }}
              </el-tag>
              <span v-else-if="item.type === 'request'">
                <el-tag :type="getOptionTagType(requestMethodOptions, detail.requestMethod)" class="request-method-tag">
                  {{ detail.requestMethod || '-' }}
                </el-tag>
                <span class="request-uri">{{ detail.requestUri || '-' }}</span>
              </span>
              <el-tag v-else-if="item.type === 'permission'" type="primary" class="permission-code-tag">
                {{ detail.permissionCode || '-' }}
              </el-tag>
              <span v-else-if="item.type === 'cost'" :class="{ 'is-slow': detail.slowFlag === 'T' }">{{
                formatCost(detail.costMs)
              }}</span>
              <span v-else>{{ item.value || '-' }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-collapse-item>
      </el-collapse>

      <el-tabs v-model="activeDetailTab" class="detail-tabs">
        <el-tab-pane v-for="tab in detailTabs" :key="tab.name" :label="tab.label" :name="tab.name">
          <div v-if="tab.code" class="code-panel">
            <div class="code-toolbar">
              <span>{{ tab.title }}</span>
              <el-button type="primary" link :icon="CopyDocument" @click="copyText(tab.code)">复制</el-button>
            </div>
            <pre>{{ formatCode(tab.code) }}</pre>
          </div>
          <div v-else class="detail-empty">
            <span>暂无内容</span>
          </div>
        </el-tab-pane>
      </el-tabs>
    </template>
    <el-empty v-else description="暂无详情" />
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { CopyDocument } from '@element-plus/icons-vue';
import { useWindowSize } from '@vueuse/core';
import { getSysOperationLogDetailApi } from '@/modules/audit/api/sysOperationLog';
import type { OperationLogTab, SysOperationLogDetail, SysOperationLogRow } from '@/modules/audit/types/sysOperationLog';

defineOptions({
  name: 'OperationLogDetail'
});

type DetailSummaryItem = {
  label: string;
  value?: string | number;
  type?: 'status' | 'slowFlag' | 'operationType' | 'requestMethod' | 'request' | 'permission' | 'cost';
  span?: number;
};

const statusOptions = [
  { label: '成功', value: 'SUCCESS', tagType: 'success' },
  { label: '失败', value: 'FAIL', tagType: 'danger' }
];

const requestMethodOptions = [
  { label: 'GET', value: 'GET', tagType: 'success' },
  { label: 'POST', value: 'POST', tagType: 'primary' },
  { label: 'PUT', value: 'PUT', tagType: 'warning' },
  { label: 'DELETE', value: 'DELETE', tagType: 'danger' },
  { label: 'PATCH', value: 'PATCH', tagType: 'info' }
];

const operationTypeOptions = [
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

const drawerVisible = ref(false);
const detail = ref<SysOperationLogRow>();
const activeDetailTab = ref('requestParams');
const activeCollapse = ref(['base']);
const scene = ref<OperationLogTab>('audit');
const { width } = useWindowSize();

const drawerSize = computed(() => (width.value <= 768 ? '100%' : '70%'));
const drawerTitle = computed(() => {
  if (scene.value === 'performance') return '慢操作详情';
  if (scene.value === 'exception') return '异常详情';
  return '操作详情';
});

const currentDetail = computed<SysOperationLogDetail>(() => detail.value?.details?.[0] || {});

const summaryItems = computed<DetailSummaryItem[]>(() => {
  if (!detail.value) return [];
  const row = detail.value;
  const resultItems: DetailSummaryItem[] =
    row.status === 'FAIL'
      ? [
          { label: '异常类型', value: row.errorType || row.responseCode },
          { label: '异常消息', value: row.errorMessage || row.responseMessage, span: 2 }
        ]
      : [
          { label: '响应码', value: row.responseCode },
          { label: '响应消息', value: row.responseMessage, span: 2 }
        ];
  return [
    { label: '模块', value: row.moduleName },
    { label: '操作类型', type: 'operationType' },
    { label: '结果', type: 'status' },
    { label: '耗时', type: 'cost' },
    { label: '操作人', value: formatUser(row) },
    { label: '权限', type: 'permission' },
    { label: '业务ID', value: row.businessId },
    { label: '慢操作', type: 'slowFlag' },
    { label: '请求', type: 'request', span: 2 },
    { label: '操作时间', value: row.operationTime },
    { label: 'TraceId', value: row.traceId, span: 2 },
    { label: 'EventId', value: row.eventId, span: 2 },
    ...resultItems
  ];
});

const detailTabs = computed(() => {
  const detailValue = currentDetail.value;
  const requestParamsTab = {
    label: '请求参数',
    name: 'requestParams',
    code: detailValue.requestParams,
    title: 'request-params.json'
  };
  const responseBodyTab = {
    label: '响应内容',
    name: 'responseBody',
    code: detailValue.responseBody,
    title: 'response-body.json'
  };
  const exceptionStackTab = {
    label: '异常堆栈',
    name: 'exceptionStack',
    code: detailValue.exceptionStack,
    title: 'exception-stack.txt'
  };
  if (scene.value === 'exception') {
    return [exceptionStackTab, requestParamsTab, responseBodyTab];
  }
  if (scene.value === 'performance') {
    return detail.value?.status === 'FAIL'
      ? [requestParamsTab, responseBodyTab, exceptionStackTab]
      : [requestParamsTab, responseBodyTab];
  }
  return detail.value?.status === 'FAIL'
    ? [requestParamsTab, responseBodyTab, exceptionStackTab]
    : [requestParamsTab, responseBodyTab];
});

const show = async (id: number | string, activeScene: OperationLogTab = 'audit') => {
  drawerVisible.value = true;
  scene.value = activeScene;
  detail.value = undefined;
  activeCollapse.value = ['base'];
  activeDetailTab.value = activeScene === 'exception' ? 'exceptionStack' : 'requestParams';
  const { data } = await getSysOperationLogDetailApi(id);
  detail.value = data;
};

const formatStatus = (value?: string) => formatOption(statusOptions, value);

const formatYesNo = (value?: string) => {
  if (value === 'T') return '是';
  if (value === 'F') return '否';
  return value || '-';
};

const formatUser = (row: SysOperationLogRow) => {
  if (row.userName && row.userId) return `${row.userName}(${row.userId})`;
  return row.userName || String(row.userId || '-');
};

const formatCost = (value?: number) => {
  if (value === null || value === undefined) return '-';
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}s`;
  return `${value}ms`;
};

const formatOption = (options: { label: string; value: string }[], value?: string) => {
  return options.find(item => item.value === value)?.label || value || '-';
};

const getOptionTagType = (options: { value: string; tagType: string }[], value?: string) => {
  return options.find(item => item.value === value)?.tagType || 'info';
};

const formatCode = (value?: string) => {
  if (!value) return '';
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
};

const copyText = async (value?: string) => {
  if (!value) return;
  await navigator.clipboard.writeText(value);
  ElMessage.success('已复制');
};

defineExpose({
  show
});
</script>

<style scoped lang="scss">
.detail-hero {
  padding: 14px 16px;
  margin-bottom: 14px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
}

.detail-hero-main {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
  margin-bottom: 8px;
}

.detail-hero-title {
  min-width: 0;
  overflow: hidden;
  color: var(--el-text-color-primary);
  font-size: 16px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-hero-meta {
  margin-top: 8px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.detail-collapse {
  margin-bottom: 16px;
}

.detail-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 12px;
  }
}

.code-panel {
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  background: var(--el-bg-color);

  pre {
    max-height: calc(100vh - 490px);
    min-height: 240px;
    padding: 14px;
    margin: 0;
    overflow: auto;
    color: var(--el-text-color-primary);
    font-family: Consolas, Monaco, 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
    background: var(--el-fill-color-lighter);
    border-top: 1px solid var(--el-border-color-light);
  }
}

.code-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
  padding: 0 12px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.detail-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  color: var(--el-text-color-secondary);
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  background: var(--el-fill-color-lighter);
}

.is-slow {
  color: var(--el-color-warning);
  font-weight: 600;
}

.request-method-tag {
  margin-right: 8px;
}

.request-uri {
  word-break: break-all;
}

.permission-code-tag {
  max-width: 100%;
  height: auto;
  min-height: 24px;
  line-height: 20px;
  white-space: normal;
  word-break: break-all;
}

@media (max-width: 768px) {
  .code-panel pre {
    max-height: 48vh;
    min-height: 220px;
  }
}
</style>
