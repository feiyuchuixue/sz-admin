<template>
  <div class="table-box">
    <div class="card mb10">
      <SelectFilter :data="selectFilterData" :default-values="selectFilterValues" @change="changeSelectFilter" />
    </div>
    <ProTable ref="proTableRef" title="消息列表" :indent="20" :columns="columns" :request-api="getTableList">
      <template #operation="{ row }">
        <el-button type="primary" link :icon="View" @click="handleDetail(row.id)"> 详情 </el-button>
      </template>
    </ProTable>
    <MessageDetail ref="messageDetailRef" @complete="refresh" />
  </div>
</template>

<script setup lang="ts">
import { View } from '@element-plus/icons-vue';
import ProTable from '@/components/ProTable/index.vue';
import type { ColumnProps, ProTableInstance } from '@/components/ProTable/interface';
import { onMounted, reactive, ref } from 'vue';
import { getMessageListApi } from '@/api/modules/system/message';
import type { MessageQuery, MessageRow } from '@/api/types/system/message';
import { useRoute } from 'vue-router';
import MessageDetail from '@/views/system/message/detail.vue';
import { useOptionsStore } from '@/stores/modules/options';
import SelectFilter from '@/components/SelectFilter/index.vue';

defineOptions({
  name: 'Message'
});

const route = useRoute();
const optionsStore = useOptionsStore();

// 表格配置项
const columns: ColumnProps<MessageRow>[] = [
  { type: 'selection', width: 80 },
  {
    prop: 'messageTypeCd',
    label: '类型',
    tag: true,
    enum: optionsStore.getDictOptions('message_type'),
    fieldNames: {
      label: 'codeName',
      value: 'alias',
      tagType: 'callbackShowStyle'
    }
  },
  { prop: 'title', label: '标题' },
  { prop: 'content', label: '内容', minWidth: 240 },
  {
    prop: 'senderId',
    label: '发送人',
    enum: optionsStore.getDictOptions('dynamic_user_options'),
    fieldNames: {
      label: 'codeName',
      value: 'id',
      tagType: 'callbackShowStyle'
    }
  },
  {
    prop: 'isRead',
    tag: true,
    label: '是否已读',
    enum: [
      { label: '已读', value: 'T', tagType: 'success' },
      { label: '未读', value: 'F', tagType: 'info' }
    ]
  },
  { prop: 'createTime', label: '发送日期' },
  { prop: 'operation', label: '操作', fixed: 'right' }
];

// selectFilter 数据（用户角色为后台数据）
const selectFilterData = reactive([
  {
    title: '消息类型',
    key: 'messageTypeCd',
    options: [
      { label: '全部', value: '' },
      { label: '消息', value: 'msg', icon: 'User' },
      { label: '待办', value: 'todo', icon: 'Bell' }
    ]
  },
  {
    title: '已读未读',
    key: 'readType',
    options: [
      { label: '全部', value: '' },
      { label: '已读', value: 'read', icon: 'Reading' },
      { label: '未读', value: 'unread', icon: 'Bell' }
    ]
  }
]);

// 获取 ProTable 元素，调用其获取刷新数据方法（还能获取到当前查询参数，方便导出携带参数）
const proTableRef = ref<ProTableInstance>();

// 默认 selectFilter 参数
const selectFilterValues = ref({ messageTypeCd: '', readType: '' });
const changeSelectFilter = (value: typeof selectFilterValues.value) => {
  selectFilterValues.value = value;
  proTableRef.value?.getTableList();
};

const messageDetailRef = ref<InstanceType<typeof MessageDetail>>();

// 获取table列表
const getTableList = (params: MessageQuery) => {
  params.messageTypeCd = selectFilterValues.value.messageTypeCd;
  params.readType = selectFilterValues.value.readType;
  return getMessageListApi(params);
};

const handleDetail = (id: string | number) => {
  messageDetailRef.value?.show(id);
};

const refresh = () => {
  proTableRef.value?.getTableList();
};

onMounted(() => {
  if (route.params.id) {
    setTimeout(() => {
      handleDetail(route.params.id as string);
    }, 500);
  }
});
</script>
