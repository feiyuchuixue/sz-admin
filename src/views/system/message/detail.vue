<template>
  <ElDialog :model-value="visible" title="消息详情" :before-close="onClose" :width="800">
    <ElDescriptions :column="2" border>
      <ElDescriptionsItem label="id">
        {{ detail?.id }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="类型">
        <el-tag>{{ messageType }} </el-tag>
      </ElDescriptionsItem>

      <ElDescriptionsItem :span="2" label="标题">
        {{ detail?.title }}
      </ElDescriptionsItem>

      <ElDescriptionsItem :span="2" label="内容">
        {{ detail?.content }}
      </ElDescriptionsItem>

      <ElDescriptionsItem label="发送人">
        {{ username }}
      </ElDescriptionsItem>

      <ElDescriptionsItem label="发送时间">
        {{ detail?.createTime }}
      </ElDescriptionsItem>

      <ElDescriptionsItem label="是否已读">
        <el-tag :type="detail?.isRead === 'T' ? 'success' : 'info'">
          {{ detail?.isRead === 'T' ? '已读' : '未读' }}
        </el-tag>
      </ElDescriptionsItem>
    </ElDescriptions>
  </ElDialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { getMessageInfoApi } from '@/api/modules/system/message';
import type { MessageRow } from '@/api/types/system/message';
import { useOptionsStore } from '@/stores/modules/options';

defineOptions({
  name: 'MessageDetail'
});

type Emits = {
  (event: 'complete'): void;
};
const emit = defineEmits<Emits>();

const optionsStore = useOptionsStore();
const visible = ref(false);
const id = ref<string | number>();
const detail = ref<MessageRow>();

const getDetail = () => {
  getMessageInfoApi(id.value!).then(res => {
    detail.value = res.data;
  });
};

const username = computed(() => {
  if (!detail.value) return '';
  const options = optionsStore.getDictOptions('dynamic_user_options');
  const user = options.find(item => item.id === detail.value?.senderId.toString());
  return user?.codeName || '';
});

const messageType = computed(() => {
  if (!detail.value) return '';
  const options = optionsStore.getDictOptions('message_type');
  const user = options.find(item => item.alias === detail.value?.messageTypeCd);
  return user?.codeName || '';
});

const show = (val: string | number) => {
  visible.value = true;
  id.value = val;
  getDetail();
};

const onClose = () => {
  visible.value = false;
  emit('complete');
};

defineExpose({
  show
});
</script>
