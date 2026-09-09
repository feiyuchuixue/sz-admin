<template>
  <div class="table-box">
    <ProTable
      ref="proTableRef"
      title="文件管理"
      :indent="20"
      :columns="columns"
      :search-columns="searchColumns"
      :request-api="getTableList"
      row-key="id"
    >
      <template #tableHeader>
        <el-text type="info" size="small">受保护文件请在相应业务记录中预览或下载，用途不代表具体记录关联</el-text>
      </template>
      <template #originName="{ row }">
        <div class="file-name">
          <el-icon><Document /></el-icon>
          <span>{{ row.originName || '未命名文件' }}</span>
        </div>
      </template>
      <template #sceneCode="{ row }">
        <el-tooltip :content="row.sceneCode || '未记录场景编码'" placement="top">
          <span>{{ row.sceneName || row.sceneCode || '--' }}</span>
        </el-tooltip>
      </template>
      <template #serveMode="{ row }">
        <el-tooltip :content="getAccess(row).description" placement="top">
          <el-tag :type="getAccess(row).type" effect="plain">{{ getAccess(row).label }}</el-tag>
        </el-tooltip>
      </template>
      <template #operation="{ row }">
        <div class="file-actions">
          <el-link
            v-if="getAccessUrl(row)"
            :href="getAccessUrl(row)"
            target="_blank"
            rel="noopener noreferrer"
            type="primary"
            underline="never"
          >
            {{ row.serveMode === 'PRESIGNED' ? '打开临时链接' : '打开' }}
          </el-link>
          <el-button
            v-if="row.serveMode === 'DIRECT' && getAccessUrl(row)"
            type="primary"
            link
            @click="copyText(getAccessUrl(row))"
            >复制链接</el-button
          >
          <el-button type="primary" link @click="showDetail(row)">详情</el-button>
        </div>
      </template>
    </ProTable>
    <el-drawer v-model="detailVisible" title="文件详情" size="min(640px, 100vw)">
      <template v-if="currentFile">
        <el-alert
          :title="getAccess(currentFile).label"
          :description="getAccess(currentFile).description"
          :type="getAccess(currentFile).type"
          :closable="false"
          show-icon
          class="access-tip"
        />
        <el-descriptions :column="1" border>
          <el-descriptions-item v-for="item in detailItems" :key="item.label" :label="item.label">
            <div class="detail-value">
              <el-link
                v-if="item.link && item.value"
                class="detail-link"
                :href="String(item.value)"
                target="_blank"
                rel="noopener noreferrer"
                type="primary"
                underline="never"
              >
                {{ item.value }}
              </el-link>
              <span v-else>{{ item.value || '--' }}</span>
              <el-button
                v-if="item.copy && item.value"
                type="primary"
                link
                :icon="CopyDocument"
                :aria-label="`复制${item.label}`"
                @click="copyText(String(item.value))"
              />
            </div>
          </el-descriptions-item>
        </el-descriptions>
        <el-text class="detail-note" type="info" size="small"
          >登记时间是资源记录入库时间，不一定是原始上传时间。命名业务标识不代表所属业务记录 ID。</el-text
        >
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { CopyDocument, Document } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import ProTable from '@/components/ProTable/index.vue';
import { getSysResourcePageApi, getSysResourceScenesApi } from '@/api/modules/system/resource';
import type { ColumnProps, EnumProps, ProTableInstance, SearchProps } from '@/components/ProTable/interface';
import type { SysResourceRow, SysResourceQuery } from '@/api/types/system/resource';
import { useDictOptions } from '@/hooks/useDictOptions';

defineOptions({
  name: 'SysFileView'
});

const proTableRef = ref<ProTableInstance>();
const sceneOptions = ref<EnumProps[]>([]);
const users = useDictOptions('dynamic_user_options');
const detailVisible = ref(false);
const currentFile = ref<SysResourceRow>();

const getAccessUrl = (row: SysResourceRow) => {
  if (row.serveMode !== 'DIRECT' && row.serveMode !== 'PRESIGNED') return '';
  const url = row.accessUrl?.trim();
  if (!url || !/^(https?:\/\/|\/)/i.test(url)) return '';
  try {
    const parsed = new URL(url, window.location.origin);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : '';
  } catch {
    return '';
  }
};

const getAccess = (row: SysResourceRow) => {
  if (row.serveMode === 'PROTECTED') {
    const purpose = row.sceneName || row.sceneCode || '未注明用途';
    return {
      label: '受保护',
      type: 'info' as const,
      description:
        row.sceneCode === 'system.protected'
          ? '此文件使用通用受保护场景，无法区分具体业务用途。请在相应业务记录中预览或下载，文件管理不提供访问入口。'
          : `此文件用于「${purpose}」，请在相应业务记录中预览或下载，文件管理不提供访问入口。`
    };
  }
  if (!row.serveMode) {
    return {
      label: '访问配置异常',
      type: 'warning' as const,
      description: '未找到有效的资源场景配置，请管理员检查场景编码与配置。'
    };
  }
  if (!getAccessUrl(row)) {
    return {
      label: '链接不可用',
      type: 'warning' as const,
      description: '未能生成有效访问链接，请刷新列表或检查存储配置；不代表文件已丢失。'
    };
  }
  if (row.serveMode === 'PRESIGNED') {
    return {
      label: '临时链接',
      type: 'warning' as const,
      description: '链接有有效期，过期后请刷新列表重新获取，不适合作为长期分享地址。'
    };
  }
  return { label: '公开访问', type: 'success' as const, description: '持有链接即可访问，请勿用于敏感附件。' };
};

const formatSize = (size?: number) => {
  if (size == null || !Number.isFinite(size) || size < 0) return '--';
  if (size < 1024) return `${size} B`;
  const units = ['KiB', 'MiB', 'GiB', 'TiB'];
  let value = size / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${Number(value.toFixed(2))} ${units[unit]}`;
};

const storageName = (type?: string) => ({ LOCAL: '本地存储', OSS: '对象存储' })[type ?? ''] || type || '--';
const creatorName = (id?: string) => users.value.find(user => String(user.id) === String(id))?.codeName || id || '--';

const showDetail = (row: SysResourceRow) => {
  currentFile.value = row;
  detailVisible.value = true;
};

type DetailItem = { label: string; value?: string | number; copy?: boolean; link?: boolean };

const detailItems = computed<DetailItem[]>(() => {
  const row = currentFile.value;
  if (!row) return [];
  const publicUrl = row.serveMode === 'DIRECT' ? getAccessUrl(row) : '';
  return [
    { label: '文件名', value: row.originName, copy: true },
    { label: '用途', value: row.sceneName || row.sceneCode },
    { label: '场景编码', value: row.sceneCode, copy: true },
    { label: '文件大小', value: formatSize(row.size) },
    { label: '存储方式', value: storageName(row.storageType) },
    ...(publicUrl ? [{ label: '访问地址', value: publicUrl, copy: true, link: true }] : []),
    { label: '创建人', value: creatorName(row.createId) },
    { label: '登记时间', value: row.createTime },
    { label: '资源 ID', value: row.id, copy: true },
    { label: '存储键', value: row.objectKey, copy: true },
    { label: 'MIME 类型', value: row.contentType, copy: true },
    { label: 'ETag', value: row.eTag, copy: true },
    { label: '命名业务标识', value: row.bizKey, copy: true }
  ];
});

const copyText = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value);
    ElMessage.success('已复制');
  } catch {
    ElMessage.warning('复制失败，请手动选中文本复制');
  }
};

onMounted(async () => {
  try {
    const { data } = await getSysResourceScenesApi();
    sceneOptions.value = Object.entries(data).map(([value, name]) => ({
      value,
      label: name === value ? value : `${name} (${value})`
    }));
  } catch {
    ElMessage.warning('用途选项加载失败，可输入场景编码筛选');
  }
});

// 表格配置项
const columns: ColumnProps<SysResourceRow>[] = [
  { prop: 'originName', label: '文件名', minWidth: 260, align: 'left' },
  { prop: 'sceneCode', label: '用途', minWidth: 160 },
  { prop: 'size', label: '大小', width: 110, render: ({ row }) => formatSize(row.size) },
  { prop: 'serveMode', label: '访问方式', width: 140 },
  { prop: 'storageType', label: '存储方式', width: 110, render: ({ row }) => storageName(row.storageType) },
  { prop: 'createId', label: '创建人', width: 130, render: ({ row }) => creatorName(row.createId) },
  { prop: 'createTime', label: '登记时间', width: 165 },
  { prop: 'operation', label: '操作', width: 205, fixed: 'right' }
];

// 搜索条件项
const searchColumns: SearchProps[] = [
  { prop: 'originName', label: '文件名', el: 'input' },
  {
    prop: 'sceneCode',
    label: '用途',
    el: 'select',
    enum: sceneOptions,
    props: { filterable: true, allowCreate: true, defaultFirstOption: true, placeholder: '选择用途或输入场景编码' }
  }
];

// 获取table列表
const getTableList = (params: SysResourceQuery) => {
  return getSysResourcePageApi(params);
};
</script>

<style scoped lang="scss">
.file-name,
.file-actions,
.detail-value {
  display: flex;
  gap: 8px;
  align-items: center;
}
.file-name span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file-name .el-icon {
  flex-shrink: 0;
  color: var(--el-text-color-secondary);
}
.file-actions {
  justify-content: center;
}
.file-actions .el-button + .el-button {
  margin-left: 0;
}
.access-tip {
  margin-bottom: 20px;
}
.detail-value span {
  min-width: 0;
  overflow-wrap: anywhere;
}
.detail-link {
  min-width: 0;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-all;
  text-align: left;
}
.detail-value .el-button {
  flex-shrink: 0;
}
.detail-note {
  display: block;
  margin-top: 16px;
  line-height: 1.6;
}
</style>
