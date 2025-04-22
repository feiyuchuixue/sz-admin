<template>
  <div class="message">
    <el-popover placement="bottom" :width="310" trigger="click" @show="getData">
      <template #reference>
        <ElBadge :value="allCount" :hidden="allCount === 0" class="item">
          <i :class="'iconfont icon-xiaoxi'" class="toolBar-icon" />
        </ElBadge>
      </template>
      <ElTabs v-model="activeName" @tabChange="getData">
        <ElTabPane :label="`消息(${msgCount})`" name="msg">
          <div class="message-list" v-if="msgList.length > 0">
            <div class="message-item" v-for="item in msgList" :key="item.id" @click="handleView(item)">
              <div class="message-content">
                <span class="message-title">{{ item.title }}</span>
                <span class="message-detail">{{ item.content }}</span>
                <span class="message-date">{{ item.createTime }}</span>
              </div>
            </div>
          </div>
          <div v-else class="message-empty">
            <img src="@/assets/images/notData.png" alt="notData" />
            <div>暂无消息</div>
          </div>
        </ElTabPane>
        <ElTabPane :label="`待办(${todoCount})`" name="todo">
          <div class="message-list" v-if="todoList.length > 0">
            <div class="message-item" v-for="item in todoList" :key="item.id" @click="handleView(item)">
              <div class="message-content">
                <span class="message-title">{{ item.title }}</span>
                <span class="message-detail">{{ item.content }}</span>
                <span class="message-date">{{ item.createTime }}</span>
              </div>
            </div>
          </div>
          <div v-else class="message-empty">
            <img src="@/assets/images/notData.png" alt="notData" />
            <div>暂无消息</div>
          </div>
        </ElTabPane>
      </ElTabs>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import mittBus from '@/utils/mittBus';
import { ElNotification } from 'element-plus';
import { getNoticeMessageListApi, getTodoMessageListApi, getUnreadMessageCountApi } from '@/api/modules/system/message';
import type { MessageRow } from '@/api/types/system/message';
import { useRouter } from 'vue-router';

const router = useRouter();
const activeName = ref('msg');
const allCount = ref(0);
const msgCount = ref(0);
const todoCount = ref(0);

const msgList = ref<MessageRow[]>([]);
const todoList = ref<MessageRow[]>([]);

const getUnreadCount = () => {
  getUnreadMessageCountApi().then(res => {
    allCount.value = res.data.all;
    msgCount.value = res.data.msg;
    todoCount.value = res.data.todo;
  });
};

const getMsgList = () => {
  getNoticeMessageListApi().then(res => {
    msgList.value = res.data;
  });
};

const getTodoList = () => {
  getTodoMessageListApi().then(res => {
    todoList.value = res.data;
  });
};

const handleMessage = (data: any) => {
  const notice = JSON.parse(data);
  ElNotification({
    title: notice.title || '',
    message: notice.content || '',
    type: 'info'
  });
  getUnreadCount();
  getMsgList();
  getTodoList();
};

const handleView = (item: MessageRow) => {
  router.push({
    name: 'MessagePopup',
    params: {
      id: item.id
    }
  });
};

const getData = () => {
  if (activeName.value === 'msg') {
    getMsgList();
  } else {
    getTodoList();
  }
};

mittBus.on('socket.MESSAGE', handleMessage);
mittBus.on('socket.READ', () => {
  getUnreadCount();
});

onMounted(() => {
  getUnreadCount();
});
</script>

<style scoped lang="scss">
.message-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 260px;
  line-height: 45px;
}

.message-list {
  display: flex;
  flex-direction: column;
  max-height: 400px;
  overflow-y: auto;

  .message-item {
    display: flex;
    align-items: center;
    padding: 20px 0;
    border-bottom: 1px solid var(--el-border-color-light);
    cursor: pointer;

    &:last-child {
      border: none;
    }

    .message-content {
      display: flex;
      flex-direction: column;

      .message-title {
        margin-bottom: 5px;
      }

      .message-detail {
        margin-bottom: 5px;
        font-size: 12px;
        color: #888888;
      }

      .message-date {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }
}
</style>
