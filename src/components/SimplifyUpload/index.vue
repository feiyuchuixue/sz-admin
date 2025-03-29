<template>
  <el-upload
    :drag="drag"
    :multiple="multiple"
    :limit="limit"
    v-model:file-list="fileList"
    :http-request="uploadFileRequest"
    list-type="picture-card"
    :accept="accept"
    :disabled="limit <= fileList.length"
    :on-success="handleSuccess"
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

    <template #file="{ file }">
      <div class="upload-info-box">
        <el-image class="el-upload-list__item-thumbnail" v-if="type === 'image'" :src="file.url" alt="" loading="lazy">
          <template #error>
            <div class="image-slot">
              <el-icon><Picture /></el-icon>
            </div>
          </template>
        </el-image>
        <img class="el-upload-list__item-thumbnail" v-if="type === 'image'" :src="file.url" alt="" />
        <span class="upload-type" v-else>
          <el-icon><Document /></el-icon>
        </span>
        <span class="el-upload-list__item-actions">
          <span v-if="!disabled" class="el-upload-list__item-delete" @click="handleRemove(file)">
            <el-icon><Delete /></el-icon>
          </span>
        </span>
      </div>
    </template>

    <template #tip>
      <div class="el-upload__tip">
        {{ tip }}
      </div>
    </template>
  </el-upload>
</template>

<script setup lang="ts">
import { UploadFilled, Delete, Document, Picture } from '@element-plus/icons-vue';
import { ref } from 'vue';
import { uploadFile } from '@/api/modules/system/upload';
import type { UploadFile, UploadRequestOptions, UploadUserFile } from 'element-plus';
import type { UploadResult } from '@/api/types/system/upload';
import type { IResultData } from '@/api/types';

defineOptions({
  name: 'SimplifyUpload'
});

type Props = {
  type?: string;
  tip?: string;
  multiple?: boolean;
  drag?: boolean;
  limit?: number;
  accept?: string;
  dir: string;
  modelValue?: string | string[];
};

const props = withDefaults(defineProps<Props>(), {
  type: 'image',
  tip: '',
  multiple: false,
  drag: true,
  limit: 1,
  accept: '',
  dir: 'default'
});

const emits = defineEmits<{
  'update:modelValue': [string | (string | undefined)[]];
}>();

const fileList = ref<UploadUserFile[]>([]);

let defaultVal = props.modelValue;
if (defaultVal !== undefined && defaultVal !== '') {
  if (typeof defaultVal === 'string') {
    defaultVal = [defaultVal];
  }
  defaultVal.forEach((val, index) => {
    const time = new Date().getTime() + index;
    fileList.value.push({
      name: '',
      status: undefined,
      uid: time,
      url: val
    });
  });
}

// 重新设置的上传
const uploadFileRequest = (options: UploadRequestOptions) => {
  return uploadFile({ file: options.file, dirTag: props.dir });
};

const handleSuccess = (res: IResultData<UploadResult>, file: UploadFile) => {
  const { uid } = file;
  const index = fileList.value.findIndex(item => item.uid === uid);
  if (index !== -1) {
    fileList.value[index].url = res.data.url;
    fileList.value[index].name = res.data.filename;
    emitChange();
  }
};

const disabled = ref(false);

const handleRemove = (file: UploadFile) => {
  const { uid } = file;
  const index = fileList.value.findIndex(item => item.uid === uid);
  if (index !== -1) {
    fileList.value.splice(index, 1);
    emitChange();
  }
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
