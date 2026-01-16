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
      <template #url="{ row }">
        <el-button link type="primary" @click="handleDownload(row.url)">下载</el-button>
      </template>
    </ProTable>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ProTable from '@/components/ProTable/index.vue';
import { getSysFileListApi } from '@/api/modules/system/file';
import type { ColumnProps, ProTableInstance, SearchProps } from '@/components/ProTable/interface';
import type { SysFileRow, SysFileQuery } from '@/api/types/system/file';
import { useDictOptions } from '@/hooks/useDictOptions';
import { useUrlDownload } from '@/hooks/useUrlDownload';
import { ElMessage } from 'element-plus';
defineOptions({
  name: 'SysFileView'
});
const proTableRef = ref<ProTableInstance>();
// 表格配置项
const columns: ColumnProps<SysFileRow>[] = [
  { type: 'selection', width: 80 },
  { prop: 'id', label: '文件标识', width: 120 },
  { prop: 'filename', label: '文件名' },
  { prop: 'dirTag', label: '目录标识', tag: true, width: 120 },
  { prop: 'size', label: '文件大小', width: 100 },
  { prop: 'objectName', label: 'objectName' },
  { prop: 'contextType', label: 'contextType', tag: true, width: 180 },
  { prop: 'eTag', label: 'eTag标识' },
  { prop: 'url', label: '文件', width: 80 },
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
const searchColumns: SearchProps[] = [{ prop: 'filename', label: '文件名', el: 'input' }];
// 获取table列表
const getTableList = (params: SysFileQuery) => {
  let newParams = formatParams(params);
  return getSysFileListApi(newParams);
};
const formatParams = (params: SysFileQuery) => {
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
