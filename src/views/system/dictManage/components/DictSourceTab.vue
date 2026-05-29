<template>
  <div class="table-box">
    <ProTable
      ref="proTableRef"
      title="字典来源管理"
      :indent="20"
      :columns="columns"
      :search-columns="searchColumns"
      :request-api="getTableList"
    >
      <template #tableHeader>
        <el-button type="primary" v-auth="'sys.dict.source.add_btn'" :icon="CirclePlus" @click="openAddEdit('新增来源')">
          新增来源
        </el-button>
      </template>

      <template #sourceName="{ row }">
        <el-tag :type="row.sourceCode === 'framework' ? 'primary' : 'success'">
          {{ row.sourceName }}
        </el-tag>
      </template>

      <template #sourceRange="{ row }">
        <el-tag type="warning"> {{ row.startId }} - {{ row.endId }} </el-tag>
      </template>

      <template #operation="{ row }">
        <el-button
          type="primary"
          v-auth="'sys.dict.source.update_btn'"
          link
          :icon="EditPen"
          @click="openAddEdit('编辑来源', row, false)"
        >
          编辑
        </el-button>
        <el-button type="danger" v-auth="'sys.dict.source.delete_btn'" link :icon="Delete" @click="handleDelete(row)">
          删除
        </el-button>
      </template>
    </ProTable>
    <DictSourceForm ref="dictSourceFormRef" />
  </div>
</template>

<script setup lang="ts">
import { CirclePlus, EditPen, Delete } from '@element-plus/icons-vue';
import ProTable from '@/components/ProTable/index.vue';
import { addDictSource, editDictSource, getDictSourceList, deleteDictSource } from '@/api/modules/system/dict';
import type { DictSource, DictSourceQuery } from '@/api/types/system/dict';
import type { ColumnProps, ProTableInstance, SearchProps } from '@/components/ProTable/interface';
import { ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import DictSourceForm from '@/views/system/dictManage/components/DictSourceForm.vue';
import { useOptionsStore } from '@/stores/modules/options';

defineOptions({
  name: 'DictSourceTab'
});

const columns: ColumnProps<DictSource>[] = [
  { prop: 'sourceCode', label: '来源编码', width: 160 },
  { prop: 'sourceName', label: '来源名称', width: 140 },
  { prop: 'sourceRange', label: '区间', width: 170 },
  { prop: 'remark', label: '说明', minWidth: 220 },
  { prop: 'operation', label: '操作', width: 150, fixed: 'right' }
];

const searchColumns: SearchProps[] = [
  { prop: 'sourceCode', label: '来源编码', el: 'input' },
  { prop: 'sourceName', label: '来源名称', el: 'input' }
];

const proTableRef = ref<ProTableInstance>();
const getTableList = (params: DictSourceQuery) => getDictSourceList(params);

const optionsStore = useOptionsStore();

const dictSourceFormRef = ref<InstanceType<typeof DictSourceForm>>();
const openAddEdit = (title: string, row = {}, isAdd = true) => {
  const params: View.DefaultParams = {
    title,
    row: { ...row },
    api: isAdd ? addDictSource : editDictSource,
    getTableList: proTableRef.value?.getTableList,
    isAdd
  };
  dictSourceFormRef.value?.acceptParams(params);
};

const handleDelete = (row: DictSource) => {
  ElMessageBox.confirm(`确定删除来源「${row.sourceName}」吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      await deleteDictSource({ ids: [row.id as number] });
      await optionsStore.getDictByCodes(['dynamic_dict_source_options']);
      ElMessage.success('删除成功');
      proTableRef.value?.getTableList();
    })
    .catch(() => {});
};
</script>

<style scoped lang="scss">
/*.header-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}*/
</style>
