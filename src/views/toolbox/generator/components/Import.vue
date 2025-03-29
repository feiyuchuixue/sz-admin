<template>
  <div class="dialog-table-box">
    <el-dialog v-model="visible" title="导入表" width="60%" :destroy-on-close="true" :close-on-click-modal="false" append-to-body>
      <ProTable
        ref="proTableRef"
        :indent="20"
        :columns="columns"
        :search-columns="searchColumns"
        :request-api="getTableList"
        row-key="tableName"
      />

      <template #footer>
        <el-button type="primary" @click="handleSubmit"> 确定 </el-button>
        <el-button @click="visible = false"> 取消 </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import ProTable from '@/components/ProTable/index.vue';
import type { ColumnProps, ProTableInstance, SearchProps } from '@/components/ProTable/interface';
import type { GeneratorInfo } from '@/api/types/toolbox/generator';
import { getGeneratorSchemaList, importGenerator } from '@/api/modules/toolbox/generator';
import type { IPageQuery } from '@/api/types';
import { ref } from 'vue';

defineOptions({
  name: 'Import'
});

const emits = defineEmits<{
  finished: [];
}>();

const visible = ref(false);

// 接收父组件传过来的参数
const show = () => {
  visible.value = true;
};

defineExpose({
  show
});

// 表格配置项
const columns: ColumnProps<GeneratorInfo>[] = [
  { type: 'selection', width: 80 },
  { prop: 'tableName', label: '表名称' },
  { prop: 'tableComment', label: '表描述' },
  { prop: 'createTime', label: '创建时间' },
  { prop: 'updateTime', label: '修改时间' }
];

const searchColumns: SearchProps[] = [
  { prop: 'tableName', label: '表名称', el: 'input' },
  { prop: 'tableComment', label: '表描述', el: 'input' },
  { prop: 'filterSys', label: '是否过滤系统表', el: 'switch' }
];
// 获取 ProTable 元素，调用其获取刷新数据方法（还能获取到当前查询参数，方便导出携带参数）
const proTableRef = ref<ProTableInstance>();

// 获取table列表
const getTableList = (params: IPageQuery) => getGeneratorSchemaList(params);

const handleSubmit = () => {
  const ids = proTableRef.value!.selectedListIds;
  if (ids.length <= 0) return;
  importGenerator({ tableName: ids }).then(() => {
    visible.value = false;
    emits('finished');
  });
};
</script>

<style scoped lang="scss"></style>
