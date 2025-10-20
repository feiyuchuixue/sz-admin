<template>
  <el-dialog v-model="visible" :title="`${paramsProps.title}`" :destroy-on-close="true" width="580px" draggable>
    <el-form
      ref="ruleFormRef"
      label-width="80px"
      label-suffix=" :"
      :rules="rules"
      :model="paramsProps.row"
      @submit.enter.prevent="handleSubmit"
    >
      <el-form-item label="模板文件" prop="url">
        <upload-files
          v-model:modelValue="fileUrls"
          :file-size="3"
          :dir="'excel'"
          @change="fileChange"
          accept=".xlsx,.xls,.docx,.doc,.pdf"
        />
      </el-form-item>
      <el-form-item label="模版名" prop="tempName">
        <el-input v-model="paramsProps.row.tempName" placeholder="请填写模版名" clearable />
      </el-form-item>
      <el-form-item label="标识" prop="alias">
        <el-input v-model="paramsProps.row.alias" placeholder="请填写标识" clearable></el-input>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="paramsProps.row.remark" placeholder="请填写备注" :rows="2" type="textarea" clearable />
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
import UploadFiles from '@/components/Upload/UploadFiles.vue';
import type { IUploadResult } from '@/api/types/system/upload';

defineOptions({
  name: 'SysTempFileForm'
});

const rules = reactive({
  alias: [{ required: true, message: '请填写标识' }]
});

const visible = ref(false);
const paramsProps = ref<View.DefaultParams>({
  title: '',
  row: {},
  api: undefined,
  getTableList: undefined
});

const fileUrls = ref<string[]>([]);

// 接收父组件传过来的参数
const acceptParams = (params: View.DefaultParams) => {
  paramsProps.value = params;
  visible.value = true;
  fileUrls.value = params.row.url;
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<InstanceType<typeof ElForm>>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      paramsProps.value.row.url = fileUrls.value;
      await paramsProps.value.api!(paramsProps.value.row);
      ElMessage.success({ message: `${paramsProps.value.title}成功！` });
      paramsProps.value.getTableList!();
      visible.value = false;
    } catch (error) {
      console.log(error);
    }
  });
};

const fileChange = (file: IUploadResult) => {
  if (paramsProps.value.isAdd || !paramsProps.value.row.tempName) paramsProps.value.row.tempName = file?.filename; // 如果是新增，便利性带入文件名
};

defineExpose({
  acceptParams
});
</script>

<style scoped lang="scss"></style>
