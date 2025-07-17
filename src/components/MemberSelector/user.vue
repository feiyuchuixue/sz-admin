<template>
  <el-row :gutter="20">
    <el-col :span="6">
      <div class="card filter">
        <h4 class="title">部门列表</h4>
        <el-scrollbar :style="{ height: '50vh' }">
          <el-tree
            ref="treeRef"
            default-expand-all
            :node-key="'id'"
            :data="treeData"
            :current-node-key="treeSelected"
            :highlight-current="true"
            :expand-on-click-node="false"
            :props="treeProps"
            @node-click="handleNodeClick"
          >
          </el-tree>
        </el-scrollbar>
      </div>
    </el-col>
    <el-col :span="18">
      <!-- 查询区域 -->
      <div class="search-box" style="margin-bottom: 16px">
        <el-input
          v-model="keyword"
          placeholder="账户/昵称/手机号"
          style="width: 240px; margin-right: 8px"
          clearable
          @keyup.enter="handleSearch"
        />
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
      <div class="table-pagination-wrapper">
        <el-table
          ref="userTableRef"
          :data="tableData"
          row-key="id"
          stripe
          @selection-change="selectionChange"
          class="fixed-table"
        >
          <el-table-column type="selection"></el-table-column>
          <el-table-column prop="username" label="账户"></el-table-column>
          <el-table-column prop="name" label="昵称"></el-table-column>
          <el-table-column prop="phone" label="手机号码"></el-table-column>
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
        >
        </el-pagination>
      </div>
    </el-col>
  </el-row>
</template>
<script setup lang="ts">
import { querySelectorApi } from '@/components/MemberSelector/api/selector';
import type { IPage } from '@/api/types';
import type { SelectorQuery, UserItem } from '@/components/MemberSelector/type/selector';
import { nextTick, onMounted, reactive, ref } from 'vue';
import type { ElTable } from 'element-plus';

defineOptions({
  name: 'UserChoose'
});

type UserChooseProps = {
  selected?: any[];
  changeSelected?: (data: any[]) => void;
};

const props = withDefaults(defineProps<UserChooseProps>(), {
  selected: () => []
});

const treeProps = {
  children: 'children',
  label: 'name'
};

const treeData = ref<any[]>([]);
const treeSelected = ref(-1);

const userTableRef = ref<InstanceType<typeof ElTable>>();
const tableData = ref<any[]>([]);
const pageable = reactive({ pageNum: 1, pageSize: 10, total: 0 });
const keyword = ref<string>('');
const isLoading = ref(false);

const getTreeData = async () => {
  const { data } = await querySelectorApi({ type: 'department' });
  treeData.value = data.data as any[];
  treeData.value.unshift({ id: -1, name: '全部' });
};

// 单选
const handleNodeClick = (data: { [key: string]: any }) => {
  treeSelected.value = data.id;
  getUserList();
};

// 获取table列表
const getUserList = async () => {
  const params: SelectorQuery = {
    type: 'user',
    parentId: treeSelected.value,
    page: pageable.pageNum,
    limit: pageable.pageSize,
    keyword: keyword.value
  };
  isLoading.value = true;
  const res = await querySelectorApi(params);
  const result = res.data.data as IPage<UserItem>;
  pageable.total = result.total;
  pageable.pageNum = result.current;
  pageable.pageSize = result.limit;
  tableData.value = result.rows;
  await nextTick(() => {
    isLoading.value = false;
  });
};

const initData = async () => {
  await getTreeData();
  await initTable();
};

const initTable = async () => {
  await getUserList();
  initSelection();
};

const initSelection = () => {
  const selectedIds = props.selected.map(item => item.id);

  tableData.value.forEach(item => {
    if (selectedIds.includes(item.id)) {
      userTableRef.value?.toggleRowSelection(item, true);
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
  const user = tableData.value.find((i: any) => i.id === item.id);
  if (user) {
    userTableRef.value?.toggleRowSelection(user, false);
  }
};

const handleSizeChange = async (size: number) => {
  pageable.pageSize = size;
  await initTable();
};

const handleCurrentChange = async (page: number) => {
  pageable.pageNum = page;
  await initTable();
};

const clearSelection = () => {
  userTableRef.value?.clearSelection?.();
};

const setSelection = (selected: any[]) => {
  clearSelection();
  const selectedIds = selected.map(item => item.id);
  tableData.value.forEach(item => {
    if (selectedIds.includes(item.id)) {
      userTableRef.value?.toggleRowSelection(item, true);
    }
  });
};

const handleSearch = async () => {
  pageable.pageNum = 1; // 搜索时回到第一页
  await initTable();
};

const handleReset = async () => {
  if (isLoading.value) return;
  keyword.value = '';
  pageable.pageNum = 1;
  await initTable();
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
  height: 55vh; // 你可以根据实际页面高度调整
  min-height: 400px;
  background: #fff;
}
.fixed-table {
  flex: 1 1 auto;
  overflow-y: auto;
}
</style>
