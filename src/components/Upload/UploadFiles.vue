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
      <el-icon class="upload_icon"><UploadFilled /></el-icon>
      <div class="el-upload__text">
        <template v-if="drag"> 拖拽或<em>点击上传</em> </template>
        <template v-else> 点击上传 </template>
      </div>
    </div>

    <template #tip>
      <div class="el-upload__tip">
        <slot name="tip" />
        {{
          props.tip ||
          (!props.accept || props.accept === '*'
            ? `请上传文件，大小不能超过 ${props.fileSize}M！`
            : `请上传 ${props.accept} 标准格式文件，大小不能超过 ${props.fileSize}M！`)
        }}
      </div>
    </template>

    <template #file="{ file }">
      <li class="el-upload-list__item is-success">
        <div class="el-upload-list__item-row">
          <el-icon class="el-icon--document"><Document /></el-icon>

          <span class="el-upload-list__item-file-name" :title="file.name">
            {{ file.name }}
          </span>

          <span v-if="file.status === 'uploading'" class="file-progress-text"> {{ Math.round(file.percentage || 0) }}% </span>

          <el-tooltip
            v-if="file.status === 'success'"
            :content="downloadingMap[file.url!] ? '下载中...' : '下载'"
            placement="top"
            :show-after="120"
          >
            <el-icon
              class="el-icon--download"
              :class="{ loading: downloadingMap[file.url!] }"
              @click="!downloadingMap[file.url!] && handleDownload(file)"
            >
              <component :is="downloadingMap[file.url!] ? Loading : Download" />
            </el-icon>
          </el-tooltip>

          <el-icon
            v-if="file.status === 'success'"
            class="el-icon--remove"
            :class="{ disabled: downloadingMap[file.url!] }"
            @click="!downloadingMap[file.url!] && handleRemove(file)"
          >
            <Close />
          </el-icon>
        </div>

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
import { Close, Document, Download, UploadFilled, Loading } from '@element-plus/icons-vue';
import { ref, watch, nextTick } from 'vue';
import { uploadFile } from '@/api/modules/system/upload';
import { ElNotification, type UploadFile, type UploadProps, type UploadRequestOptions, type UploadUserFile } from 'element-plus';
import type { IUploadResult } from '@/api/types/system/upload';
import type { AxiosProgressEvent } from 'axios';

defineOptions({ name: 'UploadUploadFiles' });

type Props = {
  type?: string;
  tip?: string;
  multiple?: boolean;
  drag?: boolean;
  limit?: number;
  fileSize?: number;
  accept?: string;
  modelValue?: IUploadResult[] | string[];
  dir?: string;
};

const props = withDefaults(defineProps<Props>(), {
  type: 'image',
  tip: '',
  multiple: false,
  drag: true,
  limit: 1,
  fileSize: 5,
  accept: '',
  modelValue: () => [],
  dir: 'tmp'
});

const emit = defineEmits<{
  'update:modelValue': [IUploadResult[]];
  change: [value: IUploadResult | null];
}>();

/* State */
const _fileList = ref<UploadUserFile[]>([]);
const _uploadResultList = ref<IUploadResult[]>([]);
const downloadingMap = ref<Record<string, boolean>>({});

/* Guard flags */
let isSyncingFromParent = false;
let needNormalizeEmit = false;
let isProcessingResults = false; // 防止递归处理
// 暂存成功的上传结果，避免立即处理导致回调丢失
const pendingSuccessResults = new Map<string, { file: UploadFile; response: IUploadResult }>();

/* Utils */
function notifyWarn(message: string) {
  setTimeout(() => ElNotification({ title: '温馨提示', message, type: 'warning' }), 0);
}
function getExt(name: string) {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i).toLowerCase() : '';
}

function isUploadResult(r: any): r is IUploadResult {
  return !!r && typeof r === 'object' && typeof r.url === 'string' && r.url.length > 0;
}

/**
 * 这里参数允许传入 IUploadResult | null | undefined，但我们会防御处理
 * 以避免 TS 报 'r' possibly null 的错误。
 */
function createUserFileFromResult(r: IUploadResult | null | undefined): UploadUserFile {
  const url = r?.url ?? '';
  const name = r?.filename || url.split('/').pop() || '';
  return { name, url, status: 'success' };
}

/**
 * 归一化：确保返回非 null 的 IUploadResult
 */
function normalizeResult(r: (Partial<IUploadResult> & { url: string }) | null | undefined): IUploadResult {
  const safe = r ?? { url: '' };
  const eTag = (safe as any).eTag || (safe as any).etag || '';
  return {
    url: safe.url,
    filename: safe.filename || safe.url.split('/').pop() || '',
    eTag,
    ...(eTag ? { etag: eTag } : {}),
    objectName: (safe as any).objectName || '',
    dirTag: (safe as any).dirTag || props.dir,
    contextType: (safe as any).contextType || '',
    size: (safe as any).size ?? 0,
    fileId: (safe as any).fileId ?? 0,
    // 移除 id: safe.id
    // type 属性如果不在接口内，可视需要删除
    type: (safe as any).type
  } as IUploadResult;
}

/**
 * 查找时加上 r?. 避免 r 可能为 null 的告警。
 * 同时我们设计上保证 _uploadResultList 不含 null（赋值时过滤）。
 */
function findStoredResult(file: UploadUserFile): IUploadResult | undefined {
  return _uploadResultList.value.find(
    r => !!r && ((r.fileId && r.fileId > 0 && (file as any).fileId === r.fileId) || r.url === file.url)
  );
}

function materializeResults(list: UploadUserFile[]): IUploadResult[] {
  return list
    .filter(f => !!f?.url)
    .map(f => {
      const stored = findStoredResult(f);
      return stored ? stored : normalizeResult({ url: f.url as string, filename: f.name, dirTag: props.dir });
    });
}

function shallowMetaEqual(a: any, b: any) {
  return (
    a?.url === b?.url &&
    (a?.filename || '') === (b?.filename || '') &&
    (a?.fileId || 0) === (b?.fileId || 0) &&
    (a?.eTag || a?.etag || '') === (b?.eTag || b?.etag || '')
  );
}
function isSameList(a: any, b: any) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (!shallowMetaEqual(a[i], b[i])) return false;
  }
  return true;
}

// 处理暂存的成功结果 - 添加防递归保护
function processPendingResults() {
  if (pendingSuccessResults.size === 0 || isProcessingResults) return;

  isProcessingResults = true;

  try {
    const results = Array.from(pendingSuccessResults.values());
    pendingSuccessResults.clear();

    // 暂停 watch 监听，避免递归更新
    isSyncingFromParent = true;

    // 批量处理所有成功的上传
    for (const { file, response } of results) {
      const norm = normalizeResult(response); // normalizeResult 确保返回非 null 值

      // 更新文件列表中对应的文件
      const fileListIdx = _fileList.value.findIndex(f => (f as any).uid === file.uid);
      if (fileListIdx >= 0) {
        const existingFile = _fileList.value[fileListIdx];
        existingFile.name = norm!.filename;
        existingFile.url = norm!.url;
        existingFile.status = 'success';
      }

      // 添加到结果列表（检查重复）
      const existingResultIdx = _uploadResultList.value.findIndex(r => r && r.url === norm!.url);
      if (existingResultIdx >= 0) {
        _uploadResultList.value[existingResultIdx] = norm;
      } else {
        _uploadResultList.value.push(norm);
      }

      emit('change', norm);
    }

    // 重新启用 watch 监听
    isSyncingFromParent = false;

    // 批量触发更新
    emit('update:modelValue', _uploadResultList.value.slice());
  } finally {
    isProcessingResults = false;
  }
}

/* Watch: parent -> internal */
watch(
  () => props.modelValue,
  newVal => {
    isSyncingFromParent = true;
    try {
      if (!Array.isArray(newVal) || newVal.length === 0) {
        _fileList.value = [];
        _uploadResultList.value = [];
        return;
      }

      const first = newVal[0] as any;
      const isObj = typeof first === 'object' && first?.url;
      if (isObj) {
        const full = (newVal as any[]).filter(isUploadResult).map(r => normalizeResult(r));
        _uploadResultList.value = full;
        _fileList.value = full.map(createUserFileFromResult);
      } else {
        const strs = (newVal as string[]).filter(Boolean);
        const full = strs.map(url => normalizeResult({ url, filename: url.split('/').pop() || '', dirTag: props.dir }));
        _uploadResultList.value = full;
        _fileList.value = full.map(createUserFileFromResult);
        needNormalizeEmit = true;
        nextTick(() => {
          if (needNormalizeEmit && !isSameList(props.modelValue, full)) {
            emit('update:modelValue', full.slice());
          }
          needNormalizeEmit = false;
        });
      }
    } finally {
      isSyncingFromParent = false;
    }
  },
  { immediate: true }
);

/* Watch: internal UI -> parent (用户操作) - 添加防递归保护 */
watch(
  _fileList,
  list => {
    if (isSyncingFromParent || isProcessingResults) return;

    const newResults = materializeResults(list);
    if (!isSameList(newResults, _uploadResultList.value)) {
      _uploadResultList.value = newResults;
    }
    if (!isSameList(props.modelValue as any, newResults)) {
      emit('update:modelValue', newResults.slice());
    }
  },
  { deep: true, flush: 'post' } // 使用 flush: 'post' 确保在 DOM 更新后执行
);

/* Upload validation */
const beforeUpload: UploadProps['beforeUpload'] = rawFile => {
  if (rawFile.size / 1024 / 1024 >= props.fileSize) {
    notifyWarn(`上传文件大小不能超过 ${props.fileSize}M！`);
    return false;
  }
  // accept 为空或为 * 时不校验类型
  if (!props.accept || props.accept === '*') {
    return true;
  }
  const ext = getExt(rawFile.name);
  const accepts = props.accept.split(',').map(s => s.trim().toLowerCase());
  if (!accepts.includes(ext)) {
    notifyWarn(`仅支持 ${props.accept} 格式的文件上传！`);
    return false;
  }
  return true;
};
const handleExceed = () => notifyWarn(`当前最多只能上传 ${props.limit} 份文件，请移除后上传！`);

/* Upload request */
const uploadFileRequest = async (options: UploadRequestOptions) => {
  try {
    const { data } = await uploadFile(
      { file: options.file, dirTag: props.dir },
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
  } catch (e) {
    options.onError(e as any);
  }
};

/* Upload success - 修复并发问题，避免立即处理 */
const handleSuccess = (response: IUploadResult | undefined, file: UploadFile) => {
  if (!response || !response.url) return;

  console.log('handleSuccess called for file:', file.name, 'uid:', file.uid);

  // 确保 file.uid 是字符串类型，如果不是则转换
  const fileUid = String(file.uid);

  // 暂存成功结果，避免立即处理导致后续回调丢失
  pendingSuccessResults.set(fileUid, { file, response });

  // 延迟批量处理，确保所有并发上传的 handleSuccess 都能被调用
  nextTick(() => {
    // 再次延迟，确保 Element Plus 内部状态稳定
    setTimeout(() => {
      processPendingResults();
    }, 50); // 增加延迟时间到 50ms
  });
};

/* Remove */
const handleRemove = (file: UploadFile) => {
  _fileList.value = _fileList.value.filter(f => !(f.url === file.url && f.name === file.name));
  const beforeLen = _uploadResultList.value.length;
  _uploadResultList.value = _uploadResultList.value.filter(r => r?.url !== file.url);
  if (_uploadResultList.value.length !== beforeLen) {
    if (!isSameList(props.modelValue as any, _uploadResultList.value)) {
      emit('update:modelValue', _uploadResultList.value.slice());
    }
    emit('change', null);
  }
};

/* Download */
function isPreviewLike(name: string) {
  return /\.(png|jpe?g|gif|bmp|webp|svg|pdf|txt)$/i.test(name);
}
function shouldForceFetch(file: UploadFile) {
  const url = file.url || '';
  let cross = false;
  try {
    const u = new URL(url, location.href);
    cross = u.origin !== location.origin;
  } catch {
    /* empty */
  }
  const name = (file.name || url).toLowerCase();
  return cross || isPreviewLike(name);
}
function extractFileNameFromCD(cd?: string | null): string | undefined {
  if (!cd) return;

  const starMatch = /filename\*\s*=\s*([^;]+)/i.exec(cd);
  if (starMatch) {
    let value = starMatch[1].trim().replace(/^"(.*)"$/, '$1');
    const rfc5987 = /^([^']*)'[^']*'(.*)$/.exec(value);
    if (rfc5987) {
      const encodedPart = rfc5987[2];
      try {
        return decodeURIComponent(encodedPart);
      } catch {
        /* ignore */
      }
    } else {
      try {
        return decodeURIComponent(value);
      } catch {
        /* ignore */
      }
      return value;
    }
  }

  const normalMatch = /filename\s*=\s*([^;]+)/i.exec(cd);
  if (normalMatch) {
    return normalMatch[1].trim().replace(/^"(.*)"$/, '$1');
  }
}
async function forceBlobDownload(url: string, filename?: string) {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(`下载失败: ${res.status}`);
  const cdName = extractFileNameFromCD(res.headers.get('Content-Disposition'));
  const finalName = filename || cdName || url.split('/').pop() || 'download';
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.style.display = 'none';
  a.download = finalName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
async function handleDownload(file: UploadFile) {
  if (!file.url) return;
  if (downloadingMap.value[file.url]) return;
  downloadingMap.value[file.url] = true;
  try {
    if (shouldForceFetch(file)) {
      await forceBlobDownload(file.url, file.name);
    } else {
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = file.url;
      a.download = file.name || file.url.split('/').pop() || 'download';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  } catch (e) {
    console.error('[download error]', e);
    window.open(file.url, '_blank');
  } finally {
    downloadingMap.value[file.url] = false;
  }
}

/* Progress wrapper */
class CustomUploadProgressEvent extends ProgressEvent {
  percent: number;
  constructor(e: ProgressEvent) {
    super(e.type, e);
    this.percent = e.lengthComputable ? Math.round((e.loaded / e.total) * 100) : 0;
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
  color: #409eff;
  font-size: 18px;
  margin-right: 5px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}
.el-upload-list__item-file-name {
  flex: 1 1 0;
  min-width: 0;
  max-width: 60vw;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
    transform 0.18s,
    opacity 0.18s;
  opacity: 0.88;
  display: inline-flex;
}
.el-icon--download:hover {
  color: #409eff;
  opacity: 1;
  transform: scale(1.14);
}
.el-icon--remove:hover {
  color: #e45757;
  opacity: 1;
  transform: scale(1.14);
}
.el-icon--download.loading {
  color: #409eff;
  cursor: default;
  opacity: 0.9;
  transform: none;
}
.el-icon--download.loading:hover {
  transform: none;
}
.el-icon--remove.disabled {
  pointer-events: none;
  opacity: 0.4;
  transform: none;
}
.el-icon--download .loading,
.el-icon--download.loading .loading {
  animation: spin 1s linear infinite;
  font-size: 16px;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.el-upload-list__item-progress {
  margin-top: 8px;
  margin-bottom: 4px;
  width: 96%;
}
:deep(.el-upload-dragger) {
  width: 100% !important;
  min-height: 112px;
  border: 1.5px dashed #d4d8dd;
  border-radius: 8px;
  background: #fafbfc;
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
    border-color: #6ea8fa;
    background: #f3f8ff;
  }
}
.upload_icon {
  font-size: 32px;
  color: #7fb8ec;
  margin-bottom: 8px;
}
.el-upload__text {
  font-size: 16px;
  color: #3a4256;
  font-weight: 500;
  margin-bottom: 2px;
  em {
    color: #409eff;
    font-style: normal;
  }
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
