<template>
  <div>
    <!-- 查询区域 -->
    <div class="search-box" style="margin-bottom: 16px">
      <el-input
        v-model="keyword"
        placeholder="角色名称"
        style="width: 240px; margin-right: 8px"
        clearable
        @keyup.enter="handleSearch"
      />
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>
    <div class="table-pagination-wrapper">
      <el-table ref="roleTableRef" :data="tableData" row-key="id" stripe @selection-change="selectionChange" class="fixed-table">
        <el-table-column type="selection" />
        <el-table-column prop="name" label="角色名称" />
      </el-table>
      <el-pagination
        class="page-box"
        :background="true"
        :current-page="pageable.pageNum"
        :page-size="pageable.pageSize"
        :page-sizes="[10, 25, 50, 100]"
        :total="pageable.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { nextTick, onMounted, reactive, ref } from 'vue';
import type { ElTable } from 'element-plus';
import { querySelectorApi } from '@/components/MemberSelector/api/selector';
import type { RoleItem, SelectorQuery } from '@/components/MemberSelector/type/selector';
import type { IPage } from '@/api/types';

defineOptions({ name: 'RoleChoose' });
type RoleChooseProps = {
  selected?: any[];
  changeSelected?: (data: any[]) => void;
};

const props = withDefaults(defineProps<RoleChooseProps>(), {
  selected: () => []
});

const roleTableRef = ref<InstanceType<typeof ElTable>>();
const tableData = ref<any[]>([]);
const pageable = reactive({ pageNum: 1, pageSize: 10, total: 0 });
const keyword = ref<string>('');
const isLoading = ref<boolean>(false);

// 获取table列表
const getRoleList = async () => {
  const params: SelectorQuery = {
    type: 'role',
    page: pageable.pageNum,
    limit: pageable.pageSize,
    keyword: keyword.value
  };
  isLoading.value = true;
  const res = await querySelectorApi(params);
  const result = res.data.data as IPage<RoleItem>;
  pageable.total = result.total;
  pageable.pageNum = result.current;
  pageable.pageSize = result.limit;
  tableData.value = result.rows;
  await nextTick(() => {
    isLoading.value = false;
  });
};

const initData = async () => {
  await getRoleList();
  initSelection();
};

const initSelection = () => {
  const selectedIds = props.selected.map(item => item.id);

  tableData.value.forEach(item => {
    if (selectedIds.includes(item.id)) {
      roleTableRef.value?.toggleRowSelection(item, true);
    }
  });
};

const selectionChange = (selections: any[]) => {
  if (isLoading.value) return;
  // 获取当前列表所有数据
  const allIds = tableData.value.map((item: any) => item.id);
  const lastSelected: any[] = [];
  props.selected.forEach((item: any) => {
    if (!allIds.includes(item.id)) {
      lastSelected.push({ ...item });
    }
  });
  selections.forEach((item: any) => {
    lastSelected.push({
      id: item.id,
      name: item.name
    });
  });
  if (props.changeSelected) props.changeSelected(lastSelected);
};

const removeSelected = (item: any) => {
  const role = tableData.value.find((i: any) => i.id === item.id);
  if (role) {
    roleTableRef.value?.toggleRowSelection(role, false);
  }
};

const clearSelection = () => {
  roleTableRef.value?.clearSelection?.();
};

const setSelection = (selected: any[]) => {
  clearSelection();
  const selectedIds = selected.map(item => item.id);
  tableData.value.forEach(item => {
    if (selectedIds.includes(item.id)) {
      roleTableRef.value?.toggleRowSelection(item, true);
    }
  });
};

const handleSizeChange = async (size: number) => {
  pageable.pageSize = size;
  await getRoleList();
  initSelection();
};

const handleCurrentChange = async (page: number) => {
  pageable.pageNum = page;
  await getRoleList();
  initSelection();
};

const handleSearch = async () => {
  pageable.pageNum = 1; // 搜索时回到第一页
  await initData();
};

const handleReset = async () => {
  if (isLoading.value) return;
  keyword.value = '';
  pageable.pageNum = 1;
  await initData();
};

onMounted(() => {
  initData();
});

defineExpose({
  removeSelected,
  clearSelection,
  setSelection
});
</script>
<style scoped lang="scss">
.page-box {
  margin-top: 12px;
  flex-shrink: 0;
}
.table-pagination-wrapper {
  display: flex;
  flex-direction: column;
  height: 55vh;
  min-height: 400px;
  background: #fff; // 仅亮色，暗色会被覆盖
}
.fixed-table {
  flex: 1 1 auto;
  overflow-y: auto;
}

/* 暗黑模式下样式，仅当[data-theme=dark]或.dark触发 */
[data-theme='dark'] .table-pagination-wrapper,
.dark .table-pagination-wrapper {
  background: #222 !important;
}

[data-theme='dark'] .el-table,
.dark .el-table {
  background: #212121 !important;
  color: #e5eaf3 !important;
}

[data-theme='dark'] .el-table__cell,
.dark .el-table__cell {
  background: #212121 !important;
  color: #e5eaf3 !important;
  border-color: #333 !important;
}

[data-theme='dark'] .el-table__header,
[data-theme='dark'] .el-table__body,
.dark .el-table__header,
.dark .el-table__body {
  background: #212121 !important;
}

[data-theme='dark'] .el-input__inner,
.dark .el-input__inner {
  background: #232323 !important;
  color: #e5eaf3 !important;
  border: 1px solid #555 !important;
}

[data-theme='dark'] .el-button,
.dark .el-button {
  background: #232323 !important;
  color: #e5eaf3 !important;
  border: 1px solid #555 !important;
}

[data-theme='dark'] .el-pagination,
.dark .el-pagination {
  background: #181818 !important;
  color: #e5eaf3 !important;
  border-top: 1px solid #222 !important;
}
[data-theme='dark'] .el-pagination .el-pager li,
.dark .el-pagination .el-pager li {
  background: #222 !important;
  color: #e5eaf3 !important;
}
[data-theme='dark'] .el-pagination.is-background .el-pager li:not(.disabled).active,
.dark .el-pagination.is-background .el-pager li:not(.disabled).active {
  background: #409eff !important;
  color: #fff !important;
}
[data-theme='dark'] .el-pagination__jump,
.dark .el-pagination__jump {
  color: #e5eaf3 !important;
}
[data-theme='dark'] .el-pagination__editor,
.dark .el-pagination__editor {
  background-color: #232323 !important;
  color: #e5eaf3 !important;
  border: 1px solid #333 !important;
}
[data-theme='dark'] .el-pagination__editor.el-input .el-input__inner,
.dark .el-pagination__editor.el-input .el-input__inner {
  background: #232323 !important;
  color: #e5eaf3 !important;
  border: 1px solid #555 !important;
}
[data-theme='dark'] .el-pagination .el-select .el-input__wrapper,
.dark .el-pagination .el-select .el-input__wrapper {
  background: #232323 !important;
  border: 1px solid #333 !important;
}
[data-theme='dark'] .el-pagination .btn-next,
[data-theme='dark'] .el-pagination .btn-prev,
.dark .el-pagination .btn-next,
.dark .el-pagination .btn-prev {
  color: #e5eaf3 !important;
}
</style>
