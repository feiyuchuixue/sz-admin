<template>
  <div class="card content-box">
    <span class="text"> 功能演示 </span>
    <el-divider content-position="left"> 消息通知 </el-divider>
    <el-row class="mb20">
      <el-button type="primary" :icon="Position" @click="sendMessage('发送系统消息')"> 发送系统消息 </el-button>
    </el-row>
    <SendMessageForm ref="senderMessageFormRef" />
    <el-divider content-position="left"> 多维选择器 </el-divider>
    <el-row class="mb20">
      <el-button type="primary" :icon="Select" @click="openChooseSelector"> 多维选择器 </el-button>
      <el-button type="primary" :icon="Select" @click="openChooseSelector2"> 赋值回显：多维选择器 </el-button>
    </el-row>
    <MemberSelector v-model:visible="isChooseSelector" :data="selectorData" @change-selected="changeSelector" />
  </div>
</template>

<script setup lang="ts" name="authButton">
import { Position, Select } from '@element-plus/icons-vue';
import SendMessageForm from '@/views/demo/components/SendMessageForm.vue';
import { ref } from 'vue';
import { sendMessageApi } from '@/api/modules/demo/demo';
import MemberSelector from '@/components/MemberSelector/index.vue';
import { ElMessageBox } from 'element-plus';

const selectorData = ref<any>({});

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
const isChooseSelector = ref(false);

const openChooseSelector = () => {
  selectorData.value = {}; // 打开时重置为未选状态
  isChooseSelector.value = true;
};

const openChooseSelector2 = () => {
  selectorData.value = {
    user: [
      {
        id: 4,
        name: '测试2-仅本部'
      }
    ],
    role: [
      {
        id: 2,
        name: '字典管理'
      },
      {
        id: 1,
        name: '超级管理员'
      }
    ],
    department: [
      {
        id: 4,
        name: '研发团队'
      },
      {
        id: 16,
        name: '算法组'
      },
      {
        id: 2,
        name: '运营部'
      }
    ]
  };
  isChooseSelector.value = true;
};

const changeSelector = (data: any) => {
  ElMessageBox({
    title: '多维选择器JSON信息',
    message: `
      <div>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      </div>
    `,
    dangerouslyUseHTMLString: true,
    confirmButtonText: '关闭'
  });
};
</script>

<style scoped lang="scss">
@use './index';
</style>
