<template>
  <el-dialog v-model="visible" :title="`${paramsProps.title}`" :destroy-on-close="true" width="580px" draggable append-to-body>
    <el-form
      ref="ruleFormRef"
      label-width="140px"
      label-suffix=" :"
      :rules="rules"
      :model="paramsProps.row"
      @submit.enter.prevent="handleSubmit"
    >
      <el-form-item label="上级部门" prop="pid">
        <el-tree-select
          v-model="paramsProps.row.pid"
          :data="parentMenus"
          check-strictly
          placeholder="请选择上级"
          :render-after-expand="false"
          clearable
          :default-expand-all="true"
          :props="treeProps"
        />
      </el-form-item>
      <el-form-item label="部门名称" prop="name">
        <el-input v-model="paramsProps.row.name" placeholder="请填写部门名称" clearable />
      </el-form-item>
      <el-form-item label="负责人" prop="leaderIds">
        <el-tag class="user-item" v-for="tag in leaders" :key="tag.id" type="info" closable @close="removeUser(tag.id)">
          {{ tag.nickname }}
        </el-tag>
        <el-button @click="chooseUser(paramsProps.row)"> 选择人员 </el-button>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="paramsProps.row.sort" :precision="0" :min="1" :max="999999" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="paramsProps.row.remark" placeholder="请填写备注" clearable />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false"> 取消 </el-button>
      <el-button type="primary" @click="handleSubmit"> 确定 </el-button>
    </template>
  </el-dialog>

  <DeptLeaderTransfer ref="deptLeaderTransferRef" v-model="selectLeaderIds" />
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { type ElForm, ElMessage } from 'element-plus';
import type { SysDeptLeader, SysDeptTree } from '@/api/types/system/dept';
import { getMenuTree, getSysDeptLeaderApi } from '@/api/modules/system/dept';
import DeptLeaderTransfer from '@/views/system/deptManage/components/DeptLeaderTransfer.vue';
defineOptions({
  name: 'SysDeptForm'
});
const parentMenus = ref<SysDeptTree[]>([]);
const treeProps = {
  label: 'name',
  value: 'id'
};

const deptLeaderTransferRef = ref<InstanceType<typeof DeptLeaderTransfer>>();
const allLeaders = ref<SysDeptLeader[]>([]);
const selectLeaderIds = ref<number[]>([]);
const leaders = computed(() => {
  return allLeaders.value.filter(item => selectLeaderIds.value.includes(item.id));
});
// 接收父组件传过来的参数
const acceptParams = (params: View.DefaultParams) => {
  paramsProps.value = params;
  selectLeaderIds.value = paramsProps.value.row?.leaders || [];
  visible.value = true;
  loadParentMenus();
  loadLeaderInfo();
};

const loadParentMenus = () => {
  getMenuTree({ excludeNodeId: paramsProps.value.row?.id }).then(res => {
    parentMenus.value = res.data;
  });
};

const loadLeaderInfo = () => {
  getSysDeptLeaderApi().then(res => {
    allLeaders.value = res.data.leaderInfoVOS;
  });
};

const rules = reactive({
  name: [{ required: true, message: '请填写部门名称' }],
  pid: [{ required: true, message: '请选择上级部门' }]
});

const visible = ref(false);
const paramsProps = ref<View.DefaultParams>({
  title: '',
  row: {},
  api: undefined,
  getTableList: undefined
});

// 提交数据（新增/编辑）
const ruleFormRef = ref<InstanceType<typeof ElForm>>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      paramsProps.value.row.leaders = selectLeaderIds.value;
      await paramsProps.value.api!(paramsProps.value.row);
      ElMessage.success({ message: `${paramsProps.value.title}成功！` });
      paramsProps.value.getTableList!();
      visible.value = false;
    } catch (error) {
      console.log(error);
    }
  });
};
// 选择人员
const chooseUser = (row = {}) => {
  const params = {
    title: '设置负责人',
    row: row,
    api: undefined,
    leaderList: allLeaders.value,
    selectIds: selectLeaderIds.value
  };
  deptLeaderTransferRef.value?.acceptParams(params);
};

// 移除人员
const removeUser = (id: number) => {
  const index = selectLeaderIds.value.findIndex(item => item === id);
  if (index !== -1) {
    selectLeaderIds.value.splice(index, 1);
  }
};

defineExpose({
  acceptParams
});
</script>

<style scoped lang="scss">
.user-item {
  margin: 5px;
}
</style>
