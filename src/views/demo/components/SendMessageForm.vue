<template>
  <el-dialog v-model="visible" :title="`${paramsProps.title}`" :destroy-on-close="true" width="580px" draggable>
    <el-form
      ref="ruleFormRef"
      label-width="140px"
      label-suffix=" :"
      :rules="rules"
      :model="paramsProps.row"
      @submit.enter.prevent="handleSubmit"
    >
      <el-form-item label="消息类型" prop="messageTypeCd">
        <el-select v-model="paramsProps.row.messageTypeCd" clearable placeholder="请选择">
          <el-option v-for="item in messageType" :key="item.alias" :label="item.codeName" :value="item.alias" />
        </el-select>
      </el-form-item>

      <el-form-item label="发送人" prop="senderId">
        <el-select v-model="paramsProps.row.senderId" clearable placeholder="请选择">
          <el-option v-for="item in userOptions" :key="item.id" :label="item.codeName" :value="Number(item.id)" />
        </el-select>
      </el-form-item>

      <el-form-item label="消息标题" prop="title">
        <el-input v-model="paramsProps.row.title" placeholder="请填写" clearable />
      </el-form-item>

      <el-form-item label="消息内容" prop="content">
        <el-input type="textarea" v-model="paramsProps.row.content" placeholder="请填写" clearable />
      </el-form-item>

      <el-form-item label="接收人" prop="receiverIds">
        <el-select v-model="paramsProps.row.receiverIds" multiple clearable placeholder="请选择">
          <el-option v-for="item in userOptions" :key="item.id" :label="item.codeName" :value="Number(item.id)" />
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
import { useDictOptions } from '@/hooks/useDictOptions';

defineOptions({
  name: 'SendMessageForm'
});
const messageType = useDictOptions('message_type');
const userOptions = useDictOptions('dynamic_user_options');

const rules = reactive({
  messageTypeCd: [{ required: true, message: '请填写' }],
  senderId: [{ required: true, message: '请填写' }],
  title: [{ required: true, message: '请填写' }],
  content: [{ required: true, message: '请填写' }],
  receiverIds: [{ required: true, message: '请填写' }]
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
  visible.value = true;
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<InstanceType<typeof ElForm>>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      await paramsProps.value.api!(paramsProps.value.row);
      ElMessage.success({ message: `消息发送成功！` });
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
