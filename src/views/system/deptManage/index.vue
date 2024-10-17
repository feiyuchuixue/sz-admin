<template>
  <div class="table-box">
    <ProTable
      ref="proTableRef"
      title="部门管理"
      :indent="20"
      :columns="columns"
      :request-api="getTableList"
      row-key="id"
      :pagination="false"
      :border="false"
      :default-expand-all="defaultExpandAllKey"
    >
      <!-- 表格 header 按钮 -->
      <template #tableHeader>
        <el-button type="primary" v-auth="'sys.dept.create'" :icon="CirclePlus" @click="openAddEdit('新增部门')">
          新增
        </el-button>
        <el-button type="info" :icon="Sort" @click="changeExpand"> 展开/折叠 </el-button>
      </template>
      <template #operation="{ row }">
        <el-button v-auth="'sys.dept.create'" type="primary" link :icon="CirclePlus" @click="openAddEdit('新增部门', row)">
          新增
        </el-button>
        <el-button
          v-auth="'sys.dept.update'"
          type="primary"
          link
          v-if="row.isLock === 'F'"
          :icon="EditPen"
          @click="openAddEdit('编辑部门', row, false)"
        >
          编辑
        </el-button>
        <el-button
          v-auth="'sys.dept.remove'"
          type="primary"
          link
          v-if="row.isLock === 'F'"
          :icon="Delete"
          @click="deleteInfo(row)"
        >
          删除
        </el-button>
      </template>
      <template #leaderInfo="{ row }">
        <el-tag class="user-item" v-for="tag in formatLeaderInfo(row.leaderInfo)" :key="tag.id" type="info">
          {{ tag.name }}
        </el-tag>
      </template>
    </ProTable>
    <SysDeptForm ref="sysDeptRef" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CirclePlus, Delete, EditPen, Sort } from '@element-plus/icons-vue';
import ProTable from '@/components/ProTable/index.vue';
import {
  createSysDeptApi,
  removeSysDeptApi,
  updateSysDeptApi,
  getSysDeptListApi,
  getSysDeptDetailApi
} from '@/api/modules/system/dept';
import { useHandleData } from '@/hooks/useHandleData';
import SysDeptForm from '@/views/system/deptManage/components/SysDeptForm.vue';
import type { ColumnProps, ProTableInstance } from '@/components/ProTable/interface';
import type { ISysDept } from '@/api/interface/system/dept';

defineOptions({
  name: 'SysDeptView'
});
const proTableRef = ref<ProTableInstance>();
// 表格配置项
const columns: ColumnProps<ISysDept.Row>[] = [
  { prop: 'name', label: '部门名称', align: 'left' },
  { prop: 'sort', label: '排序', width: 60, align: 'left' },
  { prop: 'leaderInfo', label: '负责人' },
  { prop: 'remark', label: '备注', width: 120 },
  { prop: 'operation', label: '操作', width: 220, fixed: 'right' }
];
const defaultExpandAllKey = ref(true);
// 获取table列表
const getTableList = (params: ISysDept.Query) => {
  let newParams = formatParams(params);
  return getSysDeptListApi(newParams);
};
const formatParams = (params: ISysDept.Query) => {
  let newParams = JSON.parse(JSON.stringify(params));
  return newParams;
};
// 打开 drawer(新增、查看、编辑)
const sysDeptRef = ref<InstanceType<typeof SysDeptForm>>();
const openAddEdit = async (title: string, row: any = {}, isAdd = true) => {
  let formData = {};
  if (!isAdd) {
    const record = await getSysDeptDetailApi({ id: row?.id });
    formData = record?.data;
  } else {
    let pid = row.id || 0;
    const sort = presort(row, pid);
    formData = {
      pid: pid,
      sort: sort
    };
  }
  const params = {
    title,
    row: { ...formData },
    api: isAdd ? createSysDeptApi : updateSysDeptApi,
    getTableList: proTableRef.value?.getTableList
  };
  sysDeptRef.value?.acceptParams(params);
};
// sort的预计算
const presort = (row: any = {}, pid: number) => {
  let cnt;
  // 如果选择的是根节点
  if (pid == 0) {
    cnt = proTableRef.value?.tableData?.length || 0; // 根据部门列表的长度计算sort
  } else {
    cnt = row?.children?.length || 0; // 根据选中行的children长度计算sort
  }
  return (cnt + 1) * 100;
};

// 删除信息
const deleteInfo = async (params: ISysDept.Row) => {
  await useHandleData(
    removeSysDeptApi,
    { ids: [params.id] },
    `删除【${params.name}】及以下部门（此操作不可逆请谨慎操作！！！）`,
    'error'
  );
  proTableRef.value?.getTableList();
};

const changeExpand = () => {
  defaultExpandAllKey.value = !defaultExpandAllKey.value;
  proTableRef.value?.refresh();
};

const formatLeaderInfo = (deptInfo: string): { id: string; name: string }[] => {
  if (deptInfo.trim() === '') {
    return [];
  }
  let departments: { id: string; name: string }[] = [];

  // 使用逗号分割字符串
  let departmentArray = deptInfo.split(',');

  // 遍历每个部门的键值对
  departmentArray.forEach(function (department: string) {
    // 使用冒号分割键值对
    let keyValue = department.split(':');
    // 构造部门对象
    let departmentObj = {
      id: keyValue[0],
      name: keyValue[1]
    };
    // 添加到数组
    departments.push(departmentObj);
  });
  return departments;
};
</script>
<style scoped lang="scss">
.user-item {
  margin: 5px;
}
</style>
