<template>
  <div class="card content-box">
    <span class="text"> 功能演示 </span>
    <el-divider content-position="left"> 消息通知 </el-divider>
    <el-row class="mb20">
      <el-button type="primary" :icon="Position" @click="sendMessage('发送系统消息')"> 发送系统消息 </el-button>
    </el-row>
    <SendMessageForm ref="senderMessageFormRef" />
  </div>
</template>

<script setup lang="ts" name="authButton">
import { Position } from '@element-plus/icons-vue';
import SendMessageForm from '@/views/demo/components/SendMessageForm.vue';
import { ref } from 'vue';
import { sendMessageApi } from '@/api/modules/demo/demo';

// 发送消息
const senderMessageFormRef = ref<InstanceType<typeof SendMessageForm>>();
const sendMessage = async (title: string, row: any = {}) => {
  const params = {
    title,
    row: { ...row },
    api: sendMessageApi,
    getTableList: () => {
      return new Promise(resolve => {
        resolve({ code: 200, data: [] });
      });
    }
  };
  senderMessageFormRef.value?.acceptParams(params);
};
</script>

<style scoped lang="scss">
@use './index';
</style>
