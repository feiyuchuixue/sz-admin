<template>
  <el-dialog
    v-model="visible"
    :title="`${paramsProps.title}-${paramsProps.row?.name}`"
    :destroy-on-close="true"
    width="650px"
    draggable
    append-to-body
  >
    <el-alert
      title="提示"
      type="warning"
      show-icon
      :closable="false"
      description="绑定角色后，该部门下的用户将自动继承此角色权限。若后续解除部门角色绑定，用户的已继承角色不会被自动移除，需手动调整用户角色。"
      class="el-alert"
    />
    <el-transfer
      v-model="selectIds"
      filterable
      :filter-method="filterMethod"
      style="text-align: center"
      :titles="['未设置角色', '已设置角色']"
      filter-placeholder="筛选角色"
      :props="transferProps"
      :data="roleLists"
    />
    <template #footer>
      <el-button @click="visible = false"> 取消 </el-button>
      <el-button type="primary" @click="handleSubmit"> 确定 </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { getDeptRole } from '@/api/modules/system/dept';
import type { DeptRoleInfo } from '@/api/types/system/dept';
import { ref } from 'vue';
import { ElMessage } from 'element-plus';

defineOptions({
  name: 'DeptPermissions'
});

const transferProps = {
  key: 'id',
  label: 'roleName'
};

/**
 * 过滤角色
 * @param query
 * @param item
 * @returns {boolean}
 */
const filterMethod = (query: string, item: Record<string, any>) => {
  return item.roleName.toLowerCase().includes(query.toLowerCase());
};

const visible = ref(false);
const paramsProps = ref<View.DefaultParams>({
  title: '',
  row: {},
  api: undefined,
  getTableList: undefined
});

// 接收父组件传过来的参数
const acceptParams = (params: View.DefaultParams) => {
  paramsProps.value = params;
  visible.value = true;
  getInfo(params.row.id);
};

const roleLists = ref<DeptRoleInfo[]>([]);
const selectIds = ref<number[]>([]);

/**
 * 获取权限信息
 * @param deptId
 */
const getInfo = (deptId: number) => {
  getDeptRole({ deptId }).then(res => {
    roleLists.value = res.data.roleInfoVOS;
    selectIds.value = res.data.selectIds;
  });
};

const handleSubmit = async () => {
  try {
    await paramsProps.value.api!({
      deptId: paramsProps.value.row.id,
      roleIds: selectIds.value
    }).then(() => paramsProps.value.getTableList!());
    ElMessage.success({ message: `${paramsProps.value.title}成功！` });
    visible.value = false;
  } catch (error) {
    console.log(error);
  }
};

defineExpose({
  acceptParams
});
</script>

<style scoped lang="scss">
.el-alert {
  width: 90%;
  margin: 0 auto 20px;
}
</style>
