<template>
  <el-dialog v-model="visible" :title="`${paramsProps.title}`" :destroy-on-close="true" width="880px" draggable>
    <el-form label-width="140px" label-suffix=" :" :model="paramsProps.row">
      <div v-html="safeContentHtml" class="rich-content"></div>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { type ElForm } from 'element-plus';
import { sanitizeHtml } from '@/utils/sanitizeHtml';
defineOptions({
  name: 'TeacherStatisticsContentForm'
});
const visible = ref(false);
const paramsProps = ref<View.DefaultParams>({
  title: '',
  row: {},
  api: undefined,
  getTableList: undefined
});
const safeContentHtml = computed(() => sanitizeHtml(paramsProps.value.row?.contentHtml));

// 接收父组件传过来的参数
const acceptParams = (params: View.DefaultParams) => {
  paramsProps.value = params;
  visible.value = true;
};

defineExpose({
  acceptParams
});
</script>

<style scoped lang="scss"></style>
