<template>
  <el-dialog v-model="visible" :title="`${paramsProps.title}`" :destroy-on-close="true" width="580px" draggable append-to-body>
    <el-form
      ref="ruleFormRef"
      label-width="120px"
      label-suffix=" :"
      :rules="rules"
      :model="paramsProps.row"
      @submit.enter.prevent="handleSubmit"
    >
      <el-form-item label="参数名称" prop="configName">
        <el-input
          :disabled="paramsProps.row.isLock === 'T'"
          v-model="paramsProps.row.configName"
          placeholder="请填写参数名称"
          clearablex
        />
      </el-form-item>
      <el-form-item label="Key" prop="configKey">
        <el-input
          :disabled="paramsProps.row.isLock === 'T'"
          v-model="paramsProps.row.configKey"
          placeholder="请填写Key"
          clearable
        />
      </el-form-item>
      <el-form-item label="Value" prop="configValue">
        <el-input v-model="paramsProps.row.configValue" placeholder="请填写Value" clearable />
      </el-form-item>
      <el-form-item label="是否前端加载" prop="frontendVisible">
        <el-select v-model="paramsProps.row.frontendVisible" clearable placeholder="请选择业务字典类型">
          <el-option v-for="item in yesNoOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="paramsProps.row.remark" placeholder="请填写备注" :rows="6" type="textarea" clearable />
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
import { IS_PREVIEW } from '@/config';
import { yesNoOptions } from '@/config/consts';

defineOptions({
  name: 'DictTypeForm'
});

const rules = reactive({
  configName: [{ required: true, message: '请填写参数类型' }],
  configKey: [{ required: true, message: '请填写Key' }],
  configValue: [{ required: true, message: '请填写Value' }],
  frontendVisible: [{ required: true, message: '请选择业务字典类型' }]
});

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
  const isAdd = params.isAdd;
  if (isAdd) {
    // 新增时，设置默认值
    paramsProps.value.row.frontendVisible = 'F';
  }
  visible.value = true;
};

// 提交数据（新增/编辑）
const ruleFormRef = ref();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async (valid: boolean) => {
    if (!valid) return;
    if (IS_PREVIEW) {
      return ElMessage.warning({ message: '预览环境，禁止修改初始密码，请谅解！' });
    }
    try {
      await paramsProps.value.api!(paramsProps.value.row);
      ElMessage.success({ message: `${paramsProps.value.title}成功！` });
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
