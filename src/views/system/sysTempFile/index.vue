<template>
  <div class="table-box">
    <ProTable
      ref="proTableRef"
      title="模版文件管理"
      :indent="20"
      :columns="columns"
      :search-columns="searchColumns"
      :request-api="getTableList"
      row-key="id"
    >
      <!-- 表格 header 按钮 -->
      <template #tableHeader="scope">
        <el-button type="primary" v-auth="'sys.temp.file.create'" :icon="CirclePlus" @click="openAddEdit('新增模版文件管理')">
          新增
        </el-button>
        <el-button
          v-auth="'sys.temp.file.remove'"
          type="danger"
          :icon="Delete"
          plain
          :disabled="!scope.isSelected"
          @click="batchDelete(scope.selectedListIds)"
        >
          批量删除
        </el-button>
      </template>

      <template #url="{ row }">
        <FileDownloadList :files="row?.url" />
      </template>
      <template #history="{ row }">
        <span>
          <el-button type="primary" link @click="openFileHistory(row)"> 文件历史 </el-button>
        </span>
      </template>

      <template #operation="{ row }">
        <el-button
          v-auth="'sys.temp.file.update'"
          type="primary"
          link
          :icon="EditPen"
          @click="openAddEdit('编辑模版文件管理', row, false)"
        >
          编辑
        </el-button>
        <el-button v-auth="'sys.temp.file.remove'" type="primary" link :icon="Delete" @click="deleteInfo(row)"> 删除 </el-button>
      </template>
    </ProTable>
    <SysTempFileForm ref="sysTempFileRef" />
    <SysTemplateHistoryList ref="sysTempFileHistoryListRef" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CirclePlus, Delete, EditPen } from '@element-plus/icons-vue';
import ProTable from '@/components/ProTable/index.vue';
import {
  createSysTempFileApi,
  removeSysTempFileApi,
  updateSysTempFileApi,
  getSysTempFileListApi,
  getSysTempFileDetailApi
} from '@/api/modules/system/sysTempFile';
import { useHandleData } from '@/hooks/useHandleData';
import SysTempFileForm from '@/views/system/sysTempFile/components/SysTempFileForm.vue';
import type { ColumnProps, ProTableInstance, SearchProps } from '@/components/ProTable/interface';
import type { SysTempFileQuery, SysTempFileRow } from '@/api/types/system/sysTempFile';
import SysTemplateHistoryList from '@/views/system/sysTempFile/components/HistoryList.vue';
import { useDictOptions } from '@/hooks/useDictOptions';
import FileDownloadList from '@/components/Upload/FileDownloadList.vue';
defineOptions({
  name: 'SysTempFileView'
});
const proTableRef = ref<ProTableInstance>();
// 表格配置项
const columns: ColumnProps<SysTempFileRow>[] = [
  { type: 'selection', width: 80 },
  { prop: 'id', label: '模板标识', width: 100 },
  { prop: 'tempName', label: '模版名', width: 180, align: 'center' },
  { prop: 'alias', label: '标识', tag: true },
  { prop: 'url', label: '文件', width: 300 },
  { prop: 'remark', label: '备注' },
  { prop: 'history', label: '历史', width: 100 },
  {
    prop: 'createId',
    label: '创建人',
    tag: true,
    enum: useDictOptions('dynamic_user_options'),
    fieldNames: {
      label: 'codeName',
      value: 'id',
      tagType: 'callbackShowStyle'
    }
  },
  { prop: 'createTime', label: '创建时间' },
  {
    prop: 'updateId',
    label: '更新人',
    tag: true,
    enum: useDictOptions('dynamic_user_options'),
    fieldNames: {
      label: 'codeName',
      value: 'id',
      tagType: 'callbackShowStyle'
    }
  },
  { prop: 'updateTime', label: '更新时间' },
  { prop: 'operation', label: '操作', width: 180, fixed: 'right' }
];
// 搜索条件项
const searchColumns: SearchProps[] = [{ prop: 'tempName', label: '模版名', el: 'input' }];
// 获取table列表
const getTableList = (params: SysTempFileQuery) => {
  let newParams = formatParams(params);
  return getSysTempFileListApi(newParams);
};
const formatParams = (params: SysTempFileQuery) => {
  let newParams = JSON.parse(JSON.stringify(params));
  if (newParams.createTime) {
    newParams.createTimeStart = newParams.createTime[0];
    newParams.createTimeEnd = newParams.createTime[1];
  }
  delete newParams.createTime;
  if (newParams.updateTime) {
    newParams.updateTimeStart = newParams.updateTime[0];
    newParams.updateTimeEnd = newParams.updateTime[1];
  }
  delete newParams.updateTime;
  return newParams;
};
// 打开 drawer(新增、查看、编辑)
const sysTempFileRef = ref<InstanceType<typeof SysTempFileForm>>();
const openAddEdit = async (title: string, row: any = {}, isAdd = true) => {
  if (!isAdd) {
    const record = await getSysTempFileDetailApi({ id: row?.id });
    row = record?.data;
  }
  const params = {
    title,
    row: { ...row },
    api: isAdd ? createSysTempFileApi : updateSysTempFileApi,
    getTableList: proTableRef.value?.getTableList,
    isAdd: isAdd
  };
  sysTempFileRef.value?.acceptParams(params);
};

const sysTempFileHistoryListRef = ref<InstanceType<typeof SysTemplateHistoryList>>();

// 删除信息
const deleteInfo = async (params: SysTempFileRow) => {
  await useHandleData(removeSysTempFileApi, { ids: [params.id] }, `删除【${params.id}】模版文件管理`);
  proTableRef.value?.getTableList();
};
// 批量删除信息
const batchDelete = async (ids: (string | number)[]) => {
  await useHandleData(removeSysTempFileApi, { ids }, '删除所选模版文件管理');
  proTableRef.value?.clearSelection();
  proTableRef.value?.getTableList();
};

// 打开历史记录页
const openFileHistory = (row: SysTempFileRow) => {
  sysTempFileHistoryListRef.value?.show(row);
};
</script>
