<template>
  <el-dialog v-model="visible" :title="`${paramsProps.title}`" :destroy-on-close="true" width="580px" draggable append-to-body>
    <el-form
      ref="ruleFormRef"
      label-width="100px"
      label-suffix=" :"
      :rules="rules"
      :model="paramsProps.row"
      @submit.enter.prevent="handleSubmit"
      class="form__label"
      style="padding: 10px"
    >
      <el-form-item label="用户" prop="userIds">
        <el-tag class="user-item" v-for="tag in leaders" :key="tag.id" type="info">
          {{ tag.nickname }}
        </el-tag>
      </el-form-item>
      <el-form-item label="账户类型" prop="userTagCd">
        <el-select v-model="paramsProps.row.userTagCd" clearable placeholder="请选择账户类型">
          <el-option v-for="item in userTagOption" :key="item.id" :label="item.codeName" :value="item.id" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false"> 取消 </el-button>
      <el-button type="primary" @click="handleSubmit"> 确定 </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { type ElForm, ElMessage } from 'element-plus';
import type { SysDeptLeader } from '@/api/types/system/dept';
import { setUserTag } from '@/api/modules/system/user';
import { useDictOptions } from '@/hooks/useDictOptions';

defineOptions({
  name: 'UserTagForm'
});
const leaders = ref<SysDeptLeader[]>([]);

const userTagOption = useDictOptions('user_tag');

const selectIds = ref<number[]>([]);

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
  selectIds.value = params?.selectIds;
  leaders.value = params?.selectedList;
  visible.value = true;
};

const rules = reactive({
  userTagCd: [{ required: true, message: '请选择账户类型' }]
});

const emit = defineEmits(['submit']);

// 提交数据（新增/编辑）
const ruleFormRef = ref<InstanceType<typeof ElForm>>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      const param = {
        userIds: selectIds.value,
        userTagCd: paramsProps.value.row.userTagCd
      };
      await setUserTag(param).then(() => paramsProps.value.getTableList!());
      ElMessage.success({ message: `${paramsProps.value.title}成功！` });
      emit('submit');
      visible.value = false;
    } catch (error) {
      console.log(error);
    }
  });
};

defineExpose({
  acceptParams
});
</script>

<style scoped lang="scss">
.user-item {
  margin: 5px;
}

.el-alert {
  width: 90%;
  margin: 0 auto;
}
</style>
