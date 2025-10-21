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
      <li class="el-upload-list__item" :class="['is-' + file.status]">
        <div class="el-upload-list__item-row">
          <el-icon class="el-icon--document"><Document /></el-icon>

          <span class="el-upload-list__item-file-name" :title="file.name">
            {{ file.name }}
          </span>

          <span v-if="file.status === 'uploading'" class="file-progress-text"> {{ Math.round(file.percentage || 0) }}% </span>

          <template v-if="file.status === 'success'">
            <el-tooltip :content="downloadingMap[file.url!] ? '下载中...' : '下载'" placement="top" :show-after="120">
              <el-icon
                class="el-icon--download"
                :class="{ loading: downloadingMap[file.url!] }"
                @click="!downloadingMap[file.url!] && handleDownload(file)"
              >
                <component :is="downloadingMap[file.url!] ? Loading : Download" />
              </el-icon>
            </el-tooltip>

            <el-icon
              class="el-icon--remove"
              :class="{ disabled: downloadingMap[file.url!] }"
              @click="!downloadingMap[file.url!] && handleRemove(file)"
            >
              <Close />
            </el-icon>
          </template>

          <template v-else-if="file.status === 'error'">
            <span class="upload-error-text">上传失败</span>
            <el-icon class="el-icon--remove" @click="handleRemove(file)">
              <Close />
            </el-icon>
          </template>
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
import { ref, watch, nextTick, onBeforeUnmount } from 'vue';
import { uploadFile } from '@/api/modules/system/upload';
import { ElNotification, type UploadFile, type UploadProps, type UploadRequestOptions, type UploadUserFile } from 'element-plus';
import type { IUploadResult } from '@/api/types/system/upload';
import type { AxiosProgressEvent } from 'axios';

defineOptions({ name: 'UploadFiles' });

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
  flushDelay?: number;
  debug?: boolean;
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
  dir: 'tmp',
  flushDelay: 50,
  debug: false
});

const emit = defineEmits<{
  'update:modelValue': [IUploadResult[]];
  change: [value: IUploadResult | null];
}>();

/* ---------------- State ---------------- */
const _fileList = ref<UploadUserFile[]>([]);
const _uploadResultMap = ref<Map<string, IUploadResult>>(new Map());
const _uploadResultList = ref<IUploadResult[]>([]);
const downloadingMap = ref<Record<string, boolean>>({});

/* ---------------- Guards & Flags ---------------- */
let isSyncingFromParent = false;
let needNormalizeEmit = false;
let isProcessingResults = false;

/* Pending success (batching) */
const pendingSuccessResults = new Map<string, { file: UploadFile; response: IUploadResult }>();
let flushTimer: number | null = null;

/* ---------------- Utils ---------------- */
function logDebug(...args: any[]) {
  if (props.debug) {
    console.log('[UploadFiles]', ...args);
  }
}
function notifyWarn(message: string) {
  setTimeout(() => ElNotification({ title: '温馨提示', message, type: 'warning' }), 0);
}
function getExt(name: string) {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i).toLowerCase() : '';
}
function isUploadResult(r: any): r is IUploadResult {
  return !!r && typeof r === 'object' && typeof r.url === 'string';
}
function normalizeResult(r: (Partial<IUploadResult> & { url?: string }) | null | undefined): IUploadResult {
  const safe = r ?? {};
  const url = safe.url || '';
  const filename = safe.filename || (url ? url.split('/').pop() || '' : '');
  const eTag = (safe as any).eTag || (safe as any).etag || '';
  return {
    url,
    filename,
    eTag,
    ...(eTag ? { etag: eTag } : {}),
    objectName: (safe as any).objectName || '',
    dirTag: (safe as any).dirTag || props.dir,
    contextType: (safe as any).contextType || '',
    size: (safe as any).size ?? 0,
    fileId: (safe as any).fileId ?? 0,
    type: (safe as any).type
  } as IUploadResult;
}
function makeStableUid(r: IUploadResult, index: number): string {
  if (r!.fileId && r!.fileId > 0) return 'fid-' + r!.fileId;
  const base = r!.url || r!.filename || 'empty';
  return 'u:' + base + '#i:' + index;
}
function materializeResults(list: UploadUserFile[]): IUploadResult[] {
  return list.map(f => {
    const uid = String((f as any).uid);
    const stored = _uploadResultMap.value.get(uid);
    if (stored) return stored;
    return normalizeResult({ url: f.url || '', filename: f.name, dirTag: props.dir });
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

/* ---------------- Batch Scheduling ---------------- */
function schedulePendingFlush() {
  if (flushTimer !== null) return;
  flushTimer = window.setTimeout(() => {
    flushTimer = null;
    processPendingResults();
  }, props.flushDelay);
}
function resetPending() {
  pendingSuccessResults.clear();
  if (flushTimer !== null) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
}

/* ---------------- Batch Processing ---------------- */
function processPendingResults() {
  if (pendingSuccessResults.size === 0 || isProcessingResults) return;
  isProcessingResults = true;
  isSyncingFromParent = true;
  try {
    const entries = Array.from(pendingSuccessResults.values());
    pendingSuccessResults.clear();

    let changed = false;

    for (const { file, response } of entries) {
      if (!response) continue;
      const uid = String(file.uid);
      const idx = _fileList.value.findIndex(f => String((f as any).uid) === uid);
      if (idx < 0) {
        logDebug('跳过已移除文件 uid=', uid);
        continue;
      }
      const norm = normalizeResult(response);

      // 更新显示用 file（允许后端改文件名）
      const targetFile = _fileList.value[idx];
      targetFile.name = norm!.filename;
      targetFile.url = norm!.url;
      targetFile.status = 'success';

      _uploadResultMap.value.set(uid, norm);
      emit('change', norm);
      changed = true;
    }

    if (changed) {
      const newResults = materializeResults(_fileList.value);
      const listChanged = !isSameList(newResults, _uploadResultList.value);
      if (listChanged) {
        _uploadResultList.value = newResults;
      }
      if (!isSameList(props.modelValue as any, newResults)) {
        emit('update:modelValue', newResults.slice());
      }
      logDebug('批处理完成 map.size=', _uploadResultMap.value.size, 'list.length=', _uploadResultList.value.length);
    }
  } finally {
    isSyncingFromParent = false;
    isProcessingResults = false;
  }
}

/* ---------------- Watch: parent -> internal ---------------- */
watch(
  () => props.modelValue,
  newVal => {
    isSyncingFromParent = true;
    try {
      if (!Array.isArray(newVal) || newVal.length === 0) {
        _fileList.value = [];
        _uploadResultMap.value.clear();
        _uploadResultList.value = [];
        return;
      }

      const first = newVal[0] as any;
      const isObj = typeof first === 'object' && isUploadResult(first);

      if (isObj) {
        const normalized = (newVal as any[]).filter(isUploadResult).map(r => normalizeResult(r));

        _uploadResultMap.value.clear();
        _fileList.value = normalized.map((r, i) => {
          const f: UploadUserFile = {
            name: r!.filename,
            url: r!.url,
            status: 'success'
          };
          (f as any).uid = makeStableUid(r, i);
          _uploadResultMap.value.set(String((f as any).uid), r);
          return f;
        });
        _uploadResultList.value = materializeResults(_fileList.value);
      } else {
        const urls = (newVal as string[]).filter(Boolean);
        const normalized = urls.map(u => normalizeResult({ url: u, filename: u.split('/').pop() || '', dirTag: props.dir }));
        _uploadResultMap.value.clear();
        _fileList.value = normalized.map((r, i) => {
          const f: UploadUserFile = {
            name: r!.filename,
            url: r!.url,
            status: 'success'
          };
          (f as any).uid = makeStableUid(r, i);
          _uploadResultMap.value.set(String((f as any).uid), r);
          return f;
        });
        _uploadResultList.value = materializeResults(_fileList.value);
        needNormalizeEmit = true;
        nextTick(() => {
          if (needNormalizeEmit && !isSameList(props.modelValue as any, _uploadResultList.value)) {
            emit('update:modelValue', _uploadResultList.value.slice());
          }
          needNormalizeEmit = false;
        });
      }
    } finally {
      // 延迟放开，避免立即触发内部 watch 造成递归
      nextTick(() => {
        isSyncingFromParent = false;
      });
    }
  },
  { immediate: true }
);

/* ---------------- Watch: internal fileList -> parent ---------------- */
watch(
  _fileList,
  list => {
    if (isSyncingFromParent || isProcessingResults) return;

    const newResults = materializeResults(list);
    const contentChanged = !isSameList(newResults, _uploadResultList.value);
    if (contentChanged) {
      _uploadResultList.value = newResults;
    }

    if (!isSameList(props.modelValue as any, newResults)) {
      emit('update:modelValue', newResults.slice());
      logDebug('fileList watch emit length=', newResults.length);
    }
  },
  { deep: true, flush: 'post' }
);

/* ---------------- Validation ---------------- */
const beforeUpload: UploadProps['beforeUpload'] = rawFile => {
  if (rawFile.size / 1024 / 1024 >= props.fileSize) {
    notifyWarn(`上传文件大小不能超过 ${props.fileSize}M！`);
    return false;
  }
  if (!props.accept || props.accept === '*') return true;
  const ext = getExt(rawFile.name);
  const accepts = props.accept.split(',').map(s => s.trim().toLowerCase());
  if (!accepts.includes(ext)) {
    notifyWarn(`仅支持 ${props.accept} 格式的文件上传！`);
    return false;
  }
  return true;
};
const handleExceed = () => notifyWarn(`当前最多只能上传 ${props.limit} 份文件，请移除后上传！`);

/* ---------------- Custom Request ---------------- */
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
    logDebug('上传失败', e);
    options.onError(e as any);
  }
};

/* ---------------- Success (deferred batch) ---------------- */
const handleSuccess = (response: IUploadResult | undefined, file: UploadFile) => {
  const uid = String(file.uid);
  if (!response) {
    logDebug('成功回调 response 为空 uid=', uid);
    return;
  }
  pendingSuccessResults.set(uid, { file, response });
  logDebug('暂存成功 uid=', uid, 'name=', file.name, 'resp.url=', response.url);
  schedulePendingFlush();
};

/* ---------------- Remove ---------------- */
const handleRemove = (file: UploadFile) => {
  const uidToRemove = String((file as any).uid);
  _fileList.value = _fileList.value.filter(f => String((f as any).uid) !== uidToRemove);
  _uploadResultMap.value.delete(uidToRemove);

  const newResults = materializeResults(_fileList.value);
  const listChanged = !isSameList(newResults, _uploadResultList.value);
  if (listChanged) {
    _uploadResultList.value = newResults;
  }
  emit('update:modelValue', newResults.slice());
  emit('change', null);
};

/* ---------------- Download Helpers ---------------- */
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
    console.log('[shouldForceFetch] 无法解析 URL:', url);
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
        console.log('[extractFileNameFromCD] 无法解码 RFC5987 编码的文件名:', encodedPart);
      }
    } else {
      try {
        return decodeURIComponent(value);
      } catch {
        console.log('[extractFileNameFromCD] 无法解码文件名:', value);
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
    logDebug('[download error]', e);
    window.open(file.url, '_blank');
  } finally {
    downloadingMap.value[file.url] = false;
  }
}

/* ---------------- Progress Wrapper ---------------- */
class CustomUploadProgressEvent extends ProgressEvent {
  percent: number;
  constructor(e: ProgressEvent) {
    super(e.type, e);
    this.percent = e.lengthComputable ? Math.round((e.loaded / e.total) * 100) : 0;
  }
}

/* ---------------- Lifecycle ---------------- */
onBeforeUnmount(() => {
  resetPending();
});
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
.upload-error-text {
  font-size: 12px;
  color: #e45757;
  margin-left: 6px;
}
</style>
