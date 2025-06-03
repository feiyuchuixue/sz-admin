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
        <slot name="tip" />
        {{ props.tip || `请上传 ${props.accept} 标准格式文件，大小不能超过 ${props.fileSize}M！` }}
      </div>
    </template>
    <template #file="{ file }">
      <li class="el-upload-list__item is-success">
        <div class="el-upload-list__item-row">
          <el-icon class="el-icon--document"><Document /></el-icon>
          <span class="el-upload-list__item-file-name" :title="file.name">{{ file.name }}</span>
          <span v-if="file.status === 'uploading'" class="file-progress-text"> {{ Math.round(file.percentage || 0) }}% </span>
          <el-icon v-if="file.status === 'success'" class="el-icon--download" @click="handlerDownloadFile(file)">
            <Download />
          </el-icon>
          <el-icon v-if="file.status === 'success'" class="el-icon--remove" @click="handleRemove(file)">
            <Close />
          </el-icon>
        </div>
        <!-- 上传中才显示进度条 -->
        <el-progress
          v-if="file.status === 'uploading'"
          class="el-upload-list__item-progress"
          type="line"
          :stroke-width="2"
          :percentage="file.percentage"
          :show-text="false"
        />
      </li>
    </template>
  </el-upload>
</template>

<script setup lang="ts">
import { Close, Document, Download, UploadFilled } from '@element-plus/icons-vue';
import { ref, watch } from 'vue';
import { uploadTmpFile } from '@/api/modules/system/upload';
import { ElNotification, type UploadFile, type UploadProps, type UploadRequestOptions, type UploadUserFile } from 'element-plus';
import type { IUploadResult } from '@/api/types/system/upload';
import type { AxiosProgressEvent } from 'axios';

defineOptions({
  name: 'UploadFiles'
});

type Props = {
  type?: string;
  tip?: string;
  multiple?: boolean;
  drag?: boolean;
  limit?: number; // 最大图片上传数 ==> 非必传（默认为 1张）
  fileSize?: number; // 图片大小限制 ==> 非必传（默认为 5M）
  accept?: string;
  modelValue?: string | string[];
};

const props = withDefaults(defineProps<Props>(), {
  type: 'image',
  tip: '',
  multiple: false,
  drag: true,
  limit: 1,
  fileSize: 5,
  accept: '.xlsx,.xls,.docx,.doc,.pdf',
  modelValue: () => []
});

const emit = defineEmits<{
  'update:modelValue': [string | string[]];
  change: [value: IUploadResult | null];
}>();
const _fileList = ref<UploadUserFile[]>([]);

// 辅助：把modelValue（url数组）转换成UploadUserFile[]
function urlsToUserFiles(urls: string[]): UploadUserFile[] {
  return urls.filter(Boolean).map(url => {
    // 尽量回显名字，如果url有文件名可以自行处理
    const name = url.split('/').pop();
    return { name, url, status: 'success' } as UploadUserFile;
  });
}

// 辅助：fileList -> url数组
function userFilesToUrls(list: UploadUserFile[]): string[] {
  return list.filter(f => !!f.url).map(f => f.url as string);
}

// modelValue to fileList
watch(
  () => props.modelValue,
  newVal => {
    const urls = Array.isArray(newVal) ? newVal : newVal ? [newVal] : [];
    // 只有当外部变更和内部不一致时才同步
    if (JSON.stringify(userFilesToUrls(_fileList.value)) !== JSON.stringify(urls)) {
      _fileList.value = urlsToUserFiles(urls);
    }
  },
  { immediate: true }
);

// fileList to modelValue
watch(
  _fileList,
  list => {
    const urls = userFilesToUrls(list);
    // 只有当变化时才 emit
    if (JSON.stringify(props.modelValue) !== JSON.stringify(urls)) {
      emit('update:modelValue', props.limit === 1 ? urls[0] || '' : urls);
    }
  },
  { deep: true }
);

/**
 * @description 文件上传之前判断
 * @param rawFile 选择的文件
 * */
const beforeUpload: UploadProps['beforeUpload'] = rawFile => {
  // 1. 校验文件大小
  const fileSize = rawFile.size / 1024 / 1024 < props.fileSize;
  if (!fileSize) {
    setTimeout(() => {
      ElNotification({
        title: '温馨提示',
        message: `上传文件大小不能超过 ${props.fileSize}M！`,
        type: 'warning'
      });
    }, 0);
    return false; // 阻止上传
  }

  // 2. 校验文件类型
  const ext = rawFile.name.substring(rawFile.name.lastIndexOf('.')).toLowerCase();
  const acceptList = props.accept.split(',').map(item => item.trim().toLowerCase());
  console.log('acceptList', acceptList);
  if (!acceptList.includes(ext)) {
    setTimeout(() => {
      ElNotification({
        title: '温馨提示',
        message: `仅支持 ${props.accept}格式的文件上传！`,
        type: 'warning'
      });
    }, 0);
    return false;
  }

  return true;
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
    const { data } = await uploadTmpFile(
      { file: options.file },
      {
        onUploadProgress(event: AxiosProgressEvent) {
          const progressEvent = new ProgressEvent('upload', {
            lengthComputable: event.total !== undefined,
            loaded: event.loaded || 0,
            total: event.total || 0
          });
          options.onProgress(new CustomUploadProgressEvent(progressEvent));
        }
      }
    );
    options.onSuccess(data);
  } catch (error) {
    options.onError(error as any);
  }
};

const handleSuccess = (response: IUploadResult | undefined, file: UploadFile) => {
  if (!response) return;
  file.url = response.url;
  file.name = response.filename;
  emit('change', response);
};

const handleRemove = (file: UploadFile) => {
  _fileList.value = _fileList.value.filter(item => item.url !== file.url || item.name !== file.name);
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

class CustomUploadProgressEvent extends ProgressEvent {
  percent: number;
  constructor(event: ProgressEvent) {
    super(event.type, event);
    this.percent = event.lengthComputable ? Math.round((event.loaded / event.total) * 100) : 0;
  }
}
</script>

<style scoped lang="scss">
.upload {
  width: 100%;
  min-width: 240px;
  min-height: 120px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.el-upload-list__item-row {
  display: flex;
  align-items: center;
  gap: 3px;
  min-width: 0;
}
.el-upload-list__item-row .el-icon--document {
  color: #409eff; // 主色蓝
  font-size: 18px; // 合适大小
  margin-right: 5px; // 和文件名间距
  vertical-align: middle;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.el-upload-list__item-file-name {
  flex: 1 1 0;
  min-width: 0;
  max-width: 60vw; // 或 100%，根据父容器调整
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}
.file-progress-text {
  font-size: 13px;
  color: #409eff;
  min-width: 32px;
  text-align: right;
  margin-left: 6px;
}
.el-icon--download,
.el-icon--remove {
  margin-left: 8px;
  cursor: pointer;
  color: #b0b0b0;
  font-size: 17px;
  transition:
    color 0.18s,
    transform 0.18s;
  opacity: 0.88;
}

.el-icon--download:hover {
  color: #409eff; // 下载高亮为主题蓝
  opacity: 1;
  transform: scale(1.18); // 放大一点点
}

.el-icon--remove:hover {
  color: #e45757; // 删除高亮为红色
  opacity: 1;
  transform: scale(1.18);
}
.el-upload-list__item-progress {
  margin-top: 8px;
  margin-bottom: 4px;
  width: 96%;
  align-self: flex-start;
}
:deep(.el-upload-dragger) {
  width: 100% !important;
  min-height: 112px;
  border: 1.5px dashed #d4d8dd; // 柔和浅灰色边框
  border-radius: 8px;
  background: #fafbfc; // 更淡的灰白底色
  transition:
    border-color 0.22s,
    background 0.22s;
  color: #999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover,
  &.is-dragover {
    border-color: #6ea8fa; // 仅hover/drag时主色变蓝
    background: #f3f8ff;
  }
}

.upload_icon {
  font-size: 32px;
  color: #7fb8ec; // 柔和中性蓝
  margin-bottom: 8px;
  transition: color 0.18s;
}

.el-upload__text {
  font-size: 16px;
  color: #3a4256; // 深灰色更稳重
  font-weight: 500;
  margin-bottom: 2px;
}

.el-upload__text a {
  color: #4594e3; // 低饱和蓝
  text-decoration: underline;
  font-weight: 500;
  transition: color 0.15s;
}
.el-upload__text a:hover {
  color: #1867c0;
}

.el-upload__tip {
  margin-top: 8px;
  font-size: 13px;
  color: #b0b6bc;
}
.upload :deep(.el-list-enter-active),
.upload :deep(.el-list-leave-active),
.upload :deep(.el-list-move),
.upload :deep(.el-upload-list__item) {
  animation: none !important;
  transition: none !important;
}
</style>
