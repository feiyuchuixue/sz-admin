<template>
  <el-upload
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
      <template v-if="(_fileList.length === 1 && _fileList[0]?.url) || url">
        <template v-if="accept.includes('video')">
          <video :src="_fileList[0]?.url || url" class="upload-video-preview" controls />
        </template>
        <template v-else>
          <el-image :src="_fileList[0]?.url || url" style="width: 50%; height: 50%" fit="contain" />
        </template>
      </template>
      <template v-else>
        <template v-if="accept.includes('video')">
          <img src="@/assets/images/video-upload.png" alt="上传视频" class="upload-icon-img" />
          <p class="video-size-tip">* 视频大小不超过 50M</p>
        </template>
        <template v-else>
          <img src="@/assets/images/Vector.png" alt="上传图标" class="upload-icon-img" />
        </template>
      </template>
    </div>

    <template #tip>
      <div class="el-upload__tip">
        <slot name="tip" />
      </div>
    </template>

    <!-- 文件列表 -->
    <template #file="{ file }">
      <ul class="el-upload-list el-upload-list--text">
        <li class="el-upload-list__item is-success" tabindex="0">
          <div class="el-upload-list__item-info">
            <a class="el-upload-list__item-name">
              <el-icon class="el-icon el-icon--document"><Document /></el-icon>
              <span class="el-upload-list__item-file-name" :title="file.name" :style="{ width: `calc(${width} - 80px)` }">
                {{ file.name }}
              </span>
            </a>
          </div>
          <el-progress
            v-if="file.status === 'uploading'"
            type="line"
            :stroke-width="2"
            :percentage="file.percentage"
            style="margin-top: 0.5rem"
          />
          <el-icon v-if="file.status === 'success'" class="el-icon el-icon--remove" @click="handleRemove(file)">
            <Close />
          </el-icon>
          <el-icon v-if="file.status === 'success'" class="el-icon el-icon--download" @click="handlerDownloadFile(file)">
            <Download />
          </el-icon>
        </li>
      </ul>
    </template>
  </el-upload>
</template>

<script setup lang="ts">
import { Download } from '@element-plus/icons-vue';
import { ref, watch, onUnmounted } from 'vue';
import { uploadFileToOss } from '@/api/modules/system/upload';
import {
  ElImage,
  ElNotification,
  type UploadProgressEvent,
  type UploadFile,
  type UploadProps,
  type UploadRequestOptions,
  type UploadUserFile
} from 'element-plus';
import type { IUploadResult } from '@/api/types/system/upload';

defineOptions({
  name: 'UploadFilesWithId'
});

type Props = {
  fileList?: UploadUserFile[];
  type?: string;
  tip?: string;
  multiple?: boolean;
  drag?: boolean;
  limit?: number; // 最大图片上传数 ==> 非必传（默认为 5张）
  fileSize?: number; // 图片大小限制 ==> 非必传（默认为 5M）
  accept?: string;
  modelValue?: string | string[];
  height?: string; // 组件高度 ==> 非必传（默认为 150px）
  width?: string; // 组件宽度 ==> 非必传（默认为 100%）
  url?: string; // 图片地址 ==> 非必传
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
  width: '100%',
  url: ''
});

type FileUploadNew = UploadUserFile & {
  fileId?: number;
  url?: string;
  name?: string;
};

const emit = defineEmits<{
  'update:modelValue': [string | (string | undefined)[]];
  'update:fileList': [value: UploadUserFile[]];
  change: [value: IUploadResult];
}>();

const _fileList = ref<FileUploadNew[]>([]);

// 创建 AbortController 来管理上传请求
const abortController = ref<AbortController>(new AbortController());
// 存储正在上传的文件和对应的 AbortController
const uploadingFiles = ref<Map<string, AbortController>>(new Map());

// 监听 props.fileList 列表默认值改变
watch(
  props.fileList,
  (newFileList: UploadUserFile[]) => {
    _fileList.value = [...newFileList]; // 深拷贝防止引用问题
  },
  { immediate: true } // 初始化时执行
);

/**
 * @description 文件上传之前判断
 * @param rawFile 选择的文件
 * */
const beforeUpload: UploadProps['beforeUpload'] = rawFile => {
  const fileSize = rawFile.size / 1024 / 1024 < props.fileSize;
  if (!fileSize) {
    setTimeout(() => {
      ElNotification({
        title: '温馨提示',
        message: `上传文件大小不能超过 ${props.fileSize}M！`,
        type: 'warning'
      });
    }, 0);
  }
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
  // 为每个文件创建独立的 AbortController
  const controller = new AbortController();
  const fileKey = `${options.file.name}_${options.file.size}_${Date.now()}`;

  // 存储这个文件的控制器
  uploadingFiles.value.set(fileKey, controller);

  try {
    const { data } = await uploadFileToOss(
      {
        file: options.file,
        dirTag: props.type
      },
      {
        onProgress(percent: number) {
          options.onProgress?.({
            percent
          } as UploadProgressEvent);
        },
        signal: controller.signal
      }
    );

    // 上传成功后移除控制器
    uploadingFiles.value.delete(fileKey);
    options.onSuccess(data);
  } catch (error: any) {
    // 移除控制器
    uploadingFiles.value.delete(fileKey);

    // 如果是取消操作，不显示错误
    if (error.name === 'AbortError' || error.code === 'UPLOAD_CANCELLED') {
      console.log('文件上传已取消:', options.file.name);
      return;
    }

    options.onError(error);
  }
};

const handleSuccess = (
  response: IUploadResult | undefined,
  file: UploadFile & {
    fileId?: number;
    url?: string;
    name?: string;
  }
) => {
  if (!response) return;
  file.url = response.url;
  file.name = response.filename;
  file.fileId = response.fileId;
  emit('update:fileList', _fileList.value);
  emit('change', response);
  const emitId = props.limit === 1 ? `${response.fileId}` : _fileList.value.map(item => `${item.fileId}`);
  console.log('emitId', emitId);
  emit('update:modelValue', emitId.length === 1 ? emitId[0] : emitId);
};

const handleRemove = (file: UploadFile) => {
  // 如果文件正在上传，取消上传
  const fileKey = Array.from(uploadingFiles.value.keys()).find(key => key.includes(file.name || ''));

  if (fileKey && uploadingFiles.value.has(fileKey)) {
    const controller = uploadingFiles.value.get(fileKey);
    controller?.abort();
    uploadingFiles.value.delete(fileKey);
  }

  _fileList.value = _fileList.value.filter(item => item.url !== file.url || item.name !== file.name);
  emit('update:fileList', _fileList.value);
  emit('change', null);
};

const handlerDownloadFile = (file: UploadFile) => {
  const link = document.createElement('a'); // 创建一个 a 标签用来模拟点击事件
  link.style.display = 'none';
  link.href = file.url + '';
  const fileName = file.name;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * @description 取消所有正在上传的文件
 */
const cancelAllUploads = () => {
  // 取消所有正在上传的文件
  uploadingFiles.value.forEach((controller, fileKey) => {
    console.log('取消上传文件:', fileKey);
    controller.abort();
  });

  // 清空上传文件映射
  uploadingFiles.value.clear();

  // 也可以取消全局控制器（如果有需要的话）
  abortController.value.abort();
};

/**
 * @description 组件卸载时取消所有正在上传的文件
 */
onUnmounted(() => {
  console.log('组件即将卸载，取消所有正在上传的文件');
  cancelAllUploads();
});

// 暴露取消上传的方法，以便父组件手动调用
defineExpose({
  cancelAllUploads
});
</script>

<style scoped lang="scss">
.upload {
  width: 100%;
}

:deep(.el-upload) {
  width: 100%;
}

:deep(.el-upload-dragger) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100% !important;
  height: v-bind(height);
  padding: 0;
  overflow: hidden;
  background-color: transparent;
  border: 1px solid #dcdfe6;
  transition: border-color 0.2s;
  &:hover {
    border-color: var(--el-color-primary);
  }
}
.upload-video-preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
}

.upload-icon-img {
  width: 56px;
  height: 56px;
  margin-bottom: 8px;
  object-fit: contain;
}

.video-size-tip {
  font-size: 12px;
  color: red;
  margin-top: 4px;
}

.el-upload-list__item-file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

:deep(.el-upload-list__item) {
  transition: none;
}

.el-upload-list__item .el-icon--remove,
.el-upload-list__item .el-icon--download {
  font-size: medium;
  color: var(--el-text-color-regular);
  cursor: pointer;
  opacity: 0.8;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  transition: opacity var(--el-transition-duration);
}

.el-upload-list__item .el-icon--remove {
  right: 5px;
  &:hover {
    color: crimson;
  }
}

.el-upload-list__item .el-icon--download {
  right: 28px;
  &:hover {
    color: deepskyblue;
  }
}

:deep(.el-progress__text) {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
</style>
