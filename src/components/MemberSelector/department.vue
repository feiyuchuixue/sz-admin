<template>
  <div>
    <el-table
      ref="departmentTableRef"
      :data="tableData"
      row-key="id"
      default-expand-all
      stripe
      :tree-props="{ hasChildren: 'hasChildren', children: 'children', checkStrictly: true }"
      @selection-change="selectionChange"
    >
      <el-table-column type="selection" />
      <el-table-column prop="name" label="部门名称" />
    </el-table>
  </div>
</template>
<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import type { ElTable } from 'element-plus';
import { querySelectorApi } from '@/components/MemberSelector/api/selector';
import type { DepartmentItem } from '@/components/MemberSelector/type/selector';

defineOptions({ name: 'DepartmentChoose' });

type DepartmentChooseProps = {
  selected?: any[];
  changeSelected?: (data: any[]) => void;
};

const flattenChildren = (items: any[] = []) => {
  return items.flatMap((child: any) => {
    const childList = [child];
    if (child.children) {
      childList.push(...flattenChildren(child.children));
    }
    return childList;
  });
};

const props = withDefaults(defineProps<DepartmentChooseProps>(), {
  selected: () => []
});

const departmentTableRef = ref<InstanceType<typeof ElTable>>();
const tableData = ref<DepartmentItem[]>([]);
const isSyncingSelection = ref(false);
const flatTableData = computed(() => {
  return flattenChildren(tableData.value);
});

// 获取table列表
const getDeptList = async () => {
  const res = await querySelectorApi({ type: 'department' });
  tableData.value = res.data.data as DepartmentItem[];
};

const initData = async () => {
  await getDeptList();
  setSelection(props.selected);
};

const selectionChange = (selections: any[]) => {
  if (isSyncingSelection.value) return;
  // 获取当前列表所有数据
  const allIds = flatTableData.value.map((item: any) => item.id);
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
  const dept = flatTableData.value.find((i: any) => i.id === item.id);
  if (dept) {
    departmentTableRef.value?.toggleRowSelection(dept, false);
  }
};

const clearSelection = async () => {
  isSyncingSelection.value = true;
  departmentTableRef.value?.clearSelection?.();
  await nextTick();
  isSyncingSelection.value = false;
};

const setSelection = async (selected: any[] = []) => {
  isSyncingSelection.value = true;
  departmentTableRef.value?.clearSelection?.();
  const selectedIds = selected.map(item => item.id);
  flatTableData.value.forEach(item => {
    if (selectedIds.includes(item.id)) {
      departmentTableRef.value?.toggleRowSelection(item, true);
    }
  });
  await nextTick();
  isSyncingSelection.value = false;
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
