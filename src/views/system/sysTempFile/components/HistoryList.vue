<template>
  <div class="dialog-table-box">
    <el-dialog
      v-model="visible"
      :title="`模板: ${info?.tempName}`"
      width="90%"
      :destroy-on-close="true"
      :close-on-click-modal="false"
      append-to-body
    >
      <ProTable
        ref="proTableRef"
        title="历史记录"
        :indent="20"
        :columns="columns"
        :request-api="getTableList"
        :init-param="initParam"
      >
        <template #url="{ row }">
          <FileDownloadList :files="row?.url" />
        </template>
      </ProTable>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import ProTable from '@/components/ProTable/index.vue';
import type { Dict } from '@/api/types/system/dict';
import type { ColumnProps, ProTableInstance } from '@/components/ProTable/interface';
import { reactive, ref } from 'vue';
import { getSysTempFileHistoryListApi } from '@/api/modules/system/sysTempFile';
import type { SysTempFileHistory, SysTempFileRow, SysTempFileHistoryQuery } from '@/api/types/system/sysTempFile';
import { useDictOptions } from '@/hooks/useDictOptions';
import FileDownloadList from '@/components/Upload/FileDownloadList.vue';

defineOptions({
  name: 'SysTemplateHistoryList'
});

const visible = ref(false);
const info = ref<SysTempFileHistory>();

// 接收父组件传过来的参数
const show = (params: SysTempFileRow) => {
  initParam.sysTempFileId = params.id as number;
  info.value = params;
  visible.value = true;
};

defineExpose({
  show
});

const columns: ColumnProps<Dict>[] = [
  { prop: 'sysTempFileId', label: '模板标识', width: 100 },
  { prop: 'tempName', label: '模版名', tag: true },
  { prop: 'url', label: '文件', width: 350 },
  { prop: 'remark', label: '备注' },
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
    width: 120
  },
  { prop: 'createTime', label: '创建时间', width: 180 }
];

// 如果表格需要初始化请求参数，直接定义传给 ProTable(之后每次请求都会自动带上该参数，此参数更改之后也会一直带上，改变此参数会自动刷新表格数据)
const initParam = reactive({ sysTempFileId: 0 });

// 获取 ProTable 元素，调用其获取刷新数据方法（还能获取到当前查询参数，方便导出携带参数）
const proTableRef = ref<ProTableInstance>();

// 获取table列表
const getTableList = (params: SysTempFileHistoryQuery) => getSysTempFileHistoryListApi(params);
</script>

<style scoped lang="scss"></style>
