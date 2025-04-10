<template>
  <el-dialog
    v-model="visible"
    :title="`代码预览：${parameter.tableName}`"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    width="65vw"
    top="5vh"
    append-to-body
  >
    <el-tabs v-model="activeName">
      <el-tab-pane v-for="item in codeList" :key="item.code" :label="item.alias" :name="item.alias">
        <HighCode :code="item.code" :language="item.language" :title="item.name" class="sql-box" />
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script setup lang="ts">
import { previewCode } from '@/api/modules/toolbox/generator';
import type { GeneratorPreviewInfo } from '@/api/types/toolbox/generator';
import type { IResultData } from '@/api/types';
import HighCode from '@/components/HighCode/index.vue';
import { ref } from 'vue';

defineOptions({
  name: 'Preview'
});
const activeName = ref('');
const visible = ref(false);
const codeList = ref<GeneratorPreviewInfo[]>([]);

// 父组件传过来的参数
const parameter = ref<PreviewParameterProps>({
  tableName: ''
});

// 接收父组件参数
const acceptParams = (params: PreviewParameterProps) => {
  parameter.value = { ...parameter.value, ...params };
  getCode();
  visible.value = true;
};

export interface PreviewParameterProps {
  tableName: string;
}

const getCode = () => {
  previewCode(parameter.value.tableName).then((info: IResultData<GeneratorPreviewInfo[]>) => {
    codeList.value = info.data;
    visible.value = true;
    activeName.value = info?.data[0].alias || '';
  });
};

defineExpose({
  acceptParams
});
</script>

<style scoped lang="scss">
.sql-box {
  margin: 0 auto;
  width: 90%;
  max-height: 60vh;
  overflow: auto;
}
</style>
