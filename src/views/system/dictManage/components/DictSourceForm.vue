<template>
  <el-dialog v-model="visible" :title="`${paramsProps.title}`" :destroy-on-close="true" width="620px" draggable append-to-body>
    <el-form
      ref="ruleFormRef"
      label-width="110px"
      label-suffix=" :"
      :rules="rules"
      :model="paramsProps.row"
      @submit.enter.prevent="handleSubmit"
    >
      <el-form-item label="来源编码" prop="sourceCode">
        <el-input v-model="paramsProps.row.sourceCode" :disabled="!isAdd" placeholder="请填写来源编码" clearable />
      </el-form-item>
      <el-form-item label="来源名称" prop="sourceName">
        <el-input v-model="paramsProps.row.sourceName" placeholder="请填写来源名称" clearable />
      </el-form-item>
      <el-form-item label="起始ID" prop="startId">
        <el-input-number v-model="paramsProps.row.startId" :precision="0" :min="1" :max="999999" />
      </el-form-item>
      <el-form-item label="结束ID" prop="endId">
        <el-input-number v-model="paramsProps.row.endId" :precision="0" :min="1" :max="999999" />
      </el-form-item>
      <el-form-item label="启用状态" prop="status">
        <el-select v-model="paramsProps.row.status" clearable placeholder="请选择状态">
          <el-option v-for="item in yesNoOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="paramsProps.row.remark" placeholder="请填写备注" :rows="3" type="textarea" clearable />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false"> 取消 </el-button>
      <el-button type="primary" @click="handleSubmit"> 确定 </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { yesNoOptions } from '@/config/consts';
import { useOptionsStore } from '@/stores/modules/options';

defineOptions({
  name: 'DictSourceForm'
});

const rules = reactive({
  sourceCode: [{ required: true, message: '请填写来源编码' }],
  sourceName: [{ required: true, message: '请填写来源名称' }],
  startId: [{ required: true, message: '请填写起始ID' }],
  endId: [{ required: true, message: '请填写结束ID' }],
  status: [{ required: true, message: '请选择状态' }]
});

const optionsStore = useOptionsStore();
const isAdd = ref(true);
const visible = ref(false);
const paramsProps = ref<View.DefaultParams>({
  title: '',
  row: {},
  api: undefined,
  getTableList: undefined
});

const acceptParams = (params: View.DefaultParams) => {
  paramsProps.value = params;
  isAdd.value = !!params.isAdd;
  if (params.isAdd) {
    paramsProps.value.row.status = 'T';
  }
  visible.value = true;
};

const ruleFormRef = ref();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async (valid: boolean) => {
    if (!valid) return;
    try {
      await paramsProps.value.api!(paramsProps.value.row);
      ElMessage.success({ message: `${paramsProps.value.title}成功！` });
      await optionsStore.getDictByCodes(['dynamic_dict_source_options']);
      paramsProps.value.getTableList!();
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

<style scoped lang="scss"></style>
