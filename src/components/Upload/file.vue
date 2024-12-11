<template>
  <el-upload
    :drag="drag"
    :multiple="multiple"
    :limit="limit"
    :class="['upload', drag ? 'no-border' : '']"
    v-model:file-list="fileList"
    :http-request="uploadFileRequest"
    list-type="text"
    :accept="accept"
    :on-success="handleSuccess"
    :on-remove="handleRemove"
  >
    <div class="note-box">
      <el-icon class="upload_icon">
        <UploadFilled />
      </el-icon>
      <div class="el-upload__text">
        <template v-if="drag"> 拖拽或<em>点击上传</em> </template>
        <template v-else> 点击上传 </template>
      </div>
    </div>
    <template #tip>
      <div class="el-upload__tip">
        {{ tip }}
      </div>
    </template>
  </el-upload>
</template>

<script setup lang="ts">
import { UploadFilled } from '@element-plus/icons-vue';
import { ref } from 'vue';
import { uploadTmpFile } from '@/api/modules/system/upload';
import type { UploadFile, UploadRequestOptions } from 'element-plus';
import type { IUploadResult } from '@/api/interface/system/upload';
import type { ISysFile } from '@/api/interface/system/file';

defineOptions({
  name: 'UploadFiles'
});

type Props = {
  type?: string;
  tip?: string;
  multiple?: boolean;
  drag?: boolean;
  limit?: number;
  accept?: string;
  modelValue?: string | string[];
  height?: string; // 组件高度 ==> 非必传（默认为 150px）
  width?: string; // 组件宽度 ==> 非必传（默认为 150px）
};

const props = withDefaults(defineProps<Props>(), {
  type: 'image',
  tip: '',
  multiple: false,
  drag: true,
  limit: 5,
  accept: '',
  height: '150px',
  width: '200px'
});

const emits = defineEmits<{
  'update:modelValue': [string | (string | undefined)[]];
  change: [value: IUploadResult[]];
}>();

const fileList = ref<ISysFile.Row[]>([]);

let defaultVal = props.modelValue;
if (defaultVal !== undefined && defaultVal !== '') {
  if (typeof defaultVal === 'string') {
    defaultVal = [defaultVal];
  }
  defaultVal.forEach((val, index) => {
    const time = new Date().getTime() + index;
    fileList.value.push({});
  });
}

// 重新设置的上传
const uploadFileRequest = async (options: UploadRequestOptions) => {
  try {
    const { data } = await uploadTmpFile({ file: options.file });
    options.onSuccess(data);
  } catch (error) {
    options.onError(error as any);
  }
};

const handleSuccess = (response: IUploadResult | undefined, file: UploadFile) => {
  if (!response) return;
  file.url = response.url;
  file.name = response.filename;
  const index = fileList.value.findIndex(item => item.url === file.url);
  if (index !== -1) {
    fileList.value[index].url = response.url;
    fileList.value[index].filename = response.filename;
    emitChange();
  }
};

const handleRemove = (file: UploadFile) => {
  const { url } = file;
  const index = fileList.value.findIndex(item => item.url === url);
  if (index !== -1) {
    fileList.value.splice(index, 1);
    emitChange();
  }
  console.log('fileList', fileList.value);
};

const emitChange = () => {
  if (props.limit > 1) {
    const map = fileList.value.map(item => item.url);
    emits('update:modelValue', map);
  } else {
    emits('update:modelValue', fileList.value[0]?.url || '');
  }
};
</script>

<style scoped lang="scss">
:deep(.el-upload-dragger) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: v-bind(width);
  height: v-bind(height);
  padding: 0;
  overflow: hidden;
  background-color: transparent;
  border: 1px dashed var(--el-border-color-darker);
  &:hover {
    border: 1px dashed var(--el-color-primary);
  }
}

.note-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .upload_icon {
    font-size: 32px;
    margin-bottom: 1px;
  }
}

.upload-info-box {
  width: 100%;

  .upload-type {
    height: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    font-size: 24px;
  }
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 30px;
}
</style>
