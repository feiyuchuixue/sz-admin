<template>
  <el-dialog v-model="visible" :title="`${paramsProps.title}`" :destroy-on-close="true" width="880px" draggable>
    <el-form label-width="140px" label-suffix=" :" :model="paramsProps.row">
      <div v-html="paramsProps.row.contentHtml" class="rich-content"></div>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { type ElForm } from 'element-plus';
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
