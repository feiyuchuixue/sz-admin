<template>
  <div class="table-box">
    <ProTable
      ref="proTableRef"
      title="资源管理"
      :indent="20"
      :columns="columns"
      :search-columns="searchColumns"
      :request-api="getTableList"
      row-key="id"
    >
      <template #accessUrl="{ row }">
        <el-button link type="primary" @click="handleDownload(row.accessUrl)">下载</el-button>
      </template>
    </ProTable>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ProTable from '@/components/ProTable/index.vue';
import { getSysResourcePageApi } from '@/api/modules/system/resource';
import type { ColumnProps, ProTableInstance, SearchProps } from '@/components/ProTable/interface';
import type { SysResourceRow, SysResourceQuery } from '@/api/types/system/resource';
import { useDictOptions } from '@/hooks/useDictOptions';
import { useUrlDownload } from '@/hooks/useUrlDownload';
import { ElMessage } from 'element-plus';

defineOptions({
  name: 'SysFileView'
});

const proTableRef = ref<ProTableInstance>();

// 表格配置项
const columns: ColumnProps<SysResourceRow>[] = [
  { type: 'selection', width: 80 },
  { prop: 'id', label: '资源ID', width: 120 },
  { prop: 'originName', label: '文件名' },
  { prop: 'sceneCode', label: '场景编码', tag: true },
  { prop: 'objectKey', label: '存储键' },
  { prop: 'contentType', label: 'MIME类型', tag: true, width: 180 },
  { prop: 'storageType', label: '存储类型', tag: true, width: 100 },
  { prop: 'size', label: '文件大小', width: 100 },
  { prop: 'eTag', label: 'eTag标识' },
  { prop: 'accessUrl', label: '文件', width: 80 },
  { prop: 'createTime', label: '创建时间', width: 165 },
  {
    prop: 'createId',
    label: '创建人',
    tag: true,
    enum: useDictOptions('dynamic_user_options'),
    fieldNames: {
      label: 'codeName',
      value: 'id',
      tagType: 'callbackShowStyle'
    },
    width: 140
  }
];

// 搜索条件项
const searchColumns: SearchProps[] = [
  { prop: 'originName', label: '文件名', el: 'input' },
  { prop: 'sceneCode', label: '场景编码', el: 'input' }
];

// 获取table列表
const getTableList = (params: SysResourceQuery) => {
  let newParams = formatParams(params);
  return getSysResourcePageApi(newParams);
};

const formatParams = (params: SysResourceQuery) => {
  let newParams = JSON.parse(JSON.stringify(params));
  if (newParams.createTime) newParams.createTimeStart = newParams.createTime[0];
  if (newParams.createTime) newParams.createTimeEnd = newParams.createTime[1];
  delete newParams.createTime;
  return newParams;
};

function handleDownload(url: string) {
  const file = {
    url: url
  };
  useUrlDownload(file).catch(err => {
    ElMessage.error(err?.message || '下载失败');
  });
}
</script>
