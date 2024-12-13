<template>
  <!--  <div class="upload-box">-->
  <el-upload
    ref="uploadRef"
    :drag="drag"
    :multiple="limit > 1"
    :limit="limit"
    list-type="text"
    :accept="accept"
    :class="['upload', drag ? 'no-border' : '']"
    v-model:file-list="_fileList"
    :http-request="uploadFileRequest"
    :before-upload="beforeUpload"
    :on-exceed="handleExceed"
    :on-success="handleSuccess"
    :on-remove="handleRemove"
  >
    <div class="note-box">
      <el-icon class="upload_icon">
        <UploadFilled />
      </el-icon>
      <div class="el-upload__text">
        <template v-if="drag"> 拖拽或<em>点击上传</em></template>
        <template v-else> 点击上传</template>
      </div>
    </div>
    <template #tip>
      <div class="el-upload__tip">
        <slot name="tip" />
      </div>
    </template>
    <template #file="{ file }">
      <ul class="el-upload-list el-upload-list--text">
        <li class="el-upload-list__item is-success" tabindex="0" style="">
          <div class="el-upload-list__item-info">
            <a class="el-upload-list__item-name">
              <el-icon class="el-icon el-icon--document">
                <Document />
              </el-icon>
              <span class="el-upload-list__item-file-name" :title="file.name">{{ file.name }}</span></a>
          </div>
          <label class="el-upload-list__item-status-label">
            <el-icon class="el-icon el-icon--upload-success el-icon--circle-check">
              <circle-check />
            </el-icon>
            <el-icon class="el-icon el-icon--upload-success el-icon--circle-check">
              <circle-check />
            </el-icon>
          </label>
          <el-icon class="el-icon el-icon--close" @click="handleRemove(file)">
            <Close />
          </el-icon>
            <el-icon class="el-icon el-icon--download" @click="handlerDownloadFile(file)">
              <Download />
            </el-icon>
          <i class="el-icon--close-tip">press delete to remove</i>
        </li>
      </ul>

      <!--      <span class="el-upload-list__item">
        <span class="el-upload-list__item-file-name">{{ file.name }}</span>
        <span class="el-upload-list__item-actions">
          <el-button size="mini" type="text" @click="handlerDownloadFile(file)">下载</el-button>
        </span>
      </span>-->
    </template>
  </el-upload>
  <!--    <template v-if="limit > 1">
        <el-button class="upload-btn" type="success" @click="submitBatch"> 文件上传 </el-button>
      </template>-->
  <!--  </div>-->
</template>

<script setup lang="ts">
import {Download, UploadFilled} from '@element-plus/icons-vue';
import { ref, watch } from 'vue';
import { uploadTmpFile } from '@/api/modules/system/upload';
import {
  ElNotification,
  type UploadFile,
  type UploadInstance,
  type UploadProps,
  type UploadRequestOptions,
  type UploadUserFile
} from 'element-plus';
import type { IUploadResult } from '@/api/interface/system/upload';

defineOptions({
  name: 'UploadFiles'
});

type Props = {
  fileList: UploadUserFile[];
  type?: string;
  tip?: string;
  multiple?: boolean;
  drag?: boolean;
  limit?: number; // 最大图片上传数 ==> 非必传（默认为 5张）
  fileSize?: number; // 图片大小限制 ==> 非必传（默认为 5M）
  accept?: string;
  modelValue?: string | string[];
  height?: string; // 组件高度 ==> 非必传（默认为 150px）
  width?: string; // 组件宽度 ==> 非必传（默认为 150px）
};

const props = withDefaults(defineProps<Props>(), {
  fileList: () => [],
  type: 'image',
  tip: '',
  multiple: false,
  drag: true,
  limit: 1,
  fileSize: 5,
  accept: '',
  height: '150px',
  width: '200px'
});

const emit = defineEmits<{
  'update:modelValue': [string | (string | undefined)[]];
  'update:fileList': [value: UploadUserFile[]];
  change: [value: IUploadResult];
}>();
const _fileList = ref<UploadUserFile[]>(props.fileList);

// 监听 props.fileList 列表默认值改变
watch(
  () => props.fileList,
  (n: UploadUserFile[]) => {
    _fileList.value = n;
  }
);

/**
 * @description 文件上传之前判断
 * @param rawFile 选择的文件
 * */
const beforeUpload: UploadProps['beforeUpload'] = rawFile => {
  const fileSize = rawFile.size / 1024 / 1024 < props.fileSize;
  /*  const imgType = props.fileType.includes(rawFile.type as File.ImageMimeType);
    if (!imgType)
      ElNotification({
        title: '温馨提示',
        message: '上传图片不符合所需的格式！',
        type: 'warning'
      });*/
  if (!fileSize)
    setTimeout(() => {
      ElNotification({
        title: '温馨提示',
        message: `上传文件大小不能超过 ${props.fileSize}M！`,
        type: 'warning'
      });
    }, 0);
  return /*imgType &&*/ fileSize;
};

/**
 * @description 文件数超出
 * */
const handleExceed = () => {
  ElNotification({
    title: '温馨提示',
    message: `当前最多只能上传 ${props.limit} 份文件，请移除后上传！`,
    type: 'warning'
  });
};

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
  emit('update:fileList', _fileList.value);
  emit('change', response);
};

const handleRemove = (file: UploadFile) => {
  _fileList.value = _fileList.value.filter(item => item.url !== file.url || item.name !== file.name);
  emit('update:fileList', _fileList.value);
  emit('change', null);
};

const handlerDownloadFile = (url: string) => {
  // console.log(url)
  // console.log(fileName)
  const link = document.createElement('a'); // 创建一个 a 标签用来模拟点击事件
  link.style.display = 'none';
  link.href = url;
  // link.download = fileName
  const fileName = '1230';
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // exportFile.getImgURLs(url, fileName)
};

const uploadRef = ref<UploadInstance>();
/*const submitBatch = () => {
  uploadRef.value!.submit();
};*/
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

/*.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 30px;
}*/

.el-upload__tip {
  line-height: 15px;
  text-align: center;
}

.upload-box {
  display: flex;
  flex-direction: column;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
}

.upload-file-list .upload-file-item {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upload-file-list .file-name,
.upload-file-list .file-size {
  margin-right: 10px;
}
</style>
