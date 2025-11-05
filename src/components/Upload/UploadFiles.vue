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
import { ref, watch, nextTick, onBeforeUnmount, defineExpose } from 'vue';
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
  emitUploading?: boolean;
  preserveRaw?: boolean;
  autoAllSuccess?: boolean;
  requireNewUploadForAllSuccess?: boolean; // 新增：是否必须有新上传才触发 all-success（默认 true）
  emitAllSuccessOnInitialHydration?: boolean; // 新增：回显阶段是否触发 all-success（默认 false）
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
  flushDelay: 80,
  debug: false,
  emitUploading: false,
  preserveRaw: true,
  autoAllSuccess: true,
  requireNewUploadForAllSuccess: true,
  emitAllSuccessOnInitialHydration: false
});

const emit = defineEmits<{
  'update:modelValue': [IUploadResult[]];
  change: [value: IUploadResult | null];
  'all-success': [list: IUploadResult[]];
}>();

/* ------------ State ------------ */
const _fileList = ref<UploadUserFile[]>([]);
const _resultMap = ref<Map<string, IUploadResult>>(new Map());
const downloadingMap = ref<Record<string, boolean>>({});
let internalSnapshot: IUploadResult[] = [];

/* ------------ Flags ------------ */
let isProcessingResults = false;
let isInternalEmit = false;
let initialHydrated = false; // 是否已完成首次回显
let uploadCycleActive = false; // 当前上传周期是否激活
let hasNewUploadSuccess = false; // 本周期是否有至少一个成功上传
const pendingSuccessResults = new Map<string, { file: UploadFile; response: IUploadResult }>();
let flushTimer: number | null = null;

/* ------------ All-success 记忆签名 ------------ */
let lastAllSuccessSignature = '';

/* ------------ Utils ------------ */
function logDebug(...args: any[]) {
  if (props.debug) console.log('[UploadFiles]', ...args);
}
function notifyWarn(message: string) {
  setTimeout(() => ElNotification({ title: '温馨提示', message, type: 'warning' }), 0);
}
function getExt(name: string) {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i).toLowerCase() : '';
}
function preserveNormalize(raw: any, dirTag: string): IUploadResult {
  const url = raw?.url ?? '';
  const filename = raw?.filename || raw?.name || (url ? url.split('/').pop() || '' : '');
  const eTag = raw?.eTag || raw?.etag || '';
  return {
    ...(props.preserveRaw ? raw : {}),
    url,
    filename,
    eTag,
    ...(eTag ? { etag: eTag } : {}),
    dirTag: raw?.dirTag || dirTag,
    objectName: raw?.objectName ?? '',
    contextType: raw?.contextType ?? '',
    size: raw?.size ?? 0,
    fileId: raw?.fileId ?? 0
  } as IUploadResult;
}
function buildStableUid(source: { fileId?: number; url?: string; filename?: string }, index: number) {
  if (source.fileId && source.fileId > 0) return 'fid-' + source.fileId;
  const base = (source.url || source.filename || 'item').replace(/\s+/g, '_');
  return 'u:' + base + '#i:' + index;
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
  for (let i = 0; i < a.length; i++) if (!shallowMetaEqual(a[i], b[i])) return false;
  return true;
}
function exportResultList(): IUploadResult[] {
  const out: IUploadResult[] = [];
  _fileList.value.forEach(f => {
    const uid = String((f as any).uid);
    const r = _resultMap.value.get(uid);
    if (r) out.push(r);
    else if (props.emitUploading) {
      out.push(
        preserveNormalize(
          { url: '', filename: f.name, dirTag: props.dir, size: (f as any).size ?? 0, uploading: true },
          props.dir
        )
      );
    }
  });
  return out;
}

/* ------------ All-success ------------ */
function computeAllSuccessSignature(list: IUploadResult[]): string {
  return list.map(r => `${r!.url}#${r!.fileId}#${r!.filename}`).join('|') + `|len:${list.length}`;
}
function isAllSuccess(): boolean {
  if (_fileList.value.length === 0) return false;
  if (pendingSuccessResults.size > 0) return false;
  if (_resultMap.value.size !== _fileList.value.length) return false;
  return _fileList.value.every(f => f.status === 'success');
}
function tryEmitAllSuccess(source: string) {
  if (!props.autoAllSuccess) return;
  if (!isAllSuccess()) return;

  // 回显阶段的抑制
  if (!initialHydrated && !props.emitAllSuccessOnInitialHydration) {
    logDebug('跳过回显阶段 all-success');
    return;
  }

  // 需要真实上传
  if (props.requireNewUploadForAllSuccess && !hasNewUploadSuccess) {
    logDebug('未发生新上传成功，跳过 all-success');
    return;
  }

  const list = exportResultList();
  const sig = computeAllSuccessSignature(list);
  if (sig === lastAllSuccessSignature) {
    logDebug('all-success 已触发过，跳过');
    return;
  }
  lastAllSuccessSignature = sig;
  emit('all-success', list.slice());
  logDebug(`触发 all-success(${source}) 数量=`, list.length);

  // 结束本上传周期
  uploadCycleActive = false;
  hasNewUploadSuccess = false;
}

/* ------------ Flush 调度 ------------ */
function scheduleFlush() {
  if (flushTimer != null) return;
  flushTimer = window.setTimeout(() => {
    flushTimer = null;
    processPendingResults();
  }, props.flushDelay);
}
function resetPending() {
  pendingSuccessResults.clear();
  if (flushTimer != null) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
}

/* ------------ 批处理 ------------ */
function processPendingResults() {
  if (pendingSuccessResults.size === 0 || isProcessingResults) return;
  isProcessingResults = true;
  try {
    const entries = Array.from(pendingSuccessResults.values());
    pendingSuccessResults.clear();

    for (const { file, response } of entries) {
      const uid = String(file.uid);
      const idx = _fileList.value.findIndex(f => String((f as any).uid) === uid);
      if (idx < 0) {
        logDebug('文件已移除，忽略成功回调 uid=', uid);
        continue;
      }
      const norm = preserveNormalize(response, props.dir)!;
      const vf = _fileList.value[idx];
      vf.name = norm.filename;
      vf.url = norm.url;
      vf.status = 'success';

      const old = _resultMap.value.get(uid);
      _resultMap.value.set(uid, old ? { ...old, ...norm } : norm);
      emit('change', norm);
      hasNewUploadSuccess = true; // 标记本周期发生真实成功
      if (!uploadCycleActive) uploadCycleActive = true;
    }

    const out = exportResultList();
    internalEmit(out);
    logDebug('批处理完成 成功数=', out.length);
    tryEmitAllSuccess('batch');
  } finally {
    isProcessingResults = false;
  }
}

/* ------------ 内部 emit ------------ */
function internalEmit(list: IUploadResult[]) {
  isInternalEmit = true;
  emit('update:modelValue', list.slice());
  internalSnapshot = list.slice();
  nextTick(() => {
    isInternalEmit = false;
  });
}

/* ------------ 父 -> 子初始化/回显 ------------ */
watch(
  () => props.modelValue,
  newVal => {
    if (!Array.isArray(newVal)) return;
    if (isInternalEmit && isSameList(newVal, internalSnapshot)) {
      logDebug('忽略父组件回声 modelValue');
      return;
    }

    if (newVal.length === 0) {
      _fileList.value = [];
      _resultMap.value.clear();
      internalSnapshot = [];
      lastAllSuccessSignature = '';
      initialHydrated = true;
      return;
    }

    const first = newVal[0] as any;
    const isObj = typeof first === 'object' && first !== null;

    _fileList.value = [];
    _resultMap.value.clear();

    if (isObj) {
      (newVal as any[]).forEach((raw, i) => {
        const norm = preserveNormalize(raw, props.dir)!;
        const uid = buildStableUid(norm, i);
        const file: UploadUserFile = { name: norm.filename, url: norm.url, status: 'success' };
        (file as any).uid = uid;
        _fileList.value.push(file);
        _resultMap.value.set(uid, norm);
      });
    } else {
      (newVal as string[]).filter(Boolean).forEach((u, i) => {
        const norm = preserveNormalize({ url: u, filename: u.split('/').pop() || '' }, props.dir)!;
        const uid = buildStableUid(norm, i);
        const file: UploadUserFile = { name: norm.filename, url: norm.url, status: 'success' };
        (file as any).uid = uid;
        _fileList.value.push(file);
        _resultMap.value.set(uid, norm);
      });
    }
    internalSnapshot = exportResultList();
    // 首次回显完成
    if (!initialHydrated) {
      initialHydrated = true;
      tryEmitAllSuccess('initial-hydration');
    }
  },
  { immediate: true }
);

/* ------------ 上传请求 ------------ */
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

/* ------------ 成功回调 ------------ */
const handleSuccess = (response: IUploadResult | undefined, file: UploadFile) => {
  if (!response) {
    logDebug('成功回调无 response uid=', file.uid);
    return;
  }
  pendingSuccessResults.set(String(file.uid), { file, response });
  if (!uploadCycleActive) uploadCycleActive = true; // 周期开始
  scheduleFlush();
};

/* ------------ 删除 ------------ */
const handleRemove = (file: UploadFile) => {
  const uid = String((file as any).uid);
  _fileList.value = _fileList.value.filter(f => String((f as any).uid) !== uid);
  _resultMap.value.delete(uid);
  pendingSuccessResults.delete(uid);
  const out = exportResultList();
  internalEmit(out);
  emit('change', null);
  tryEmitAllSuccess('remove');
};

/* ------------ 上传前校验 ------------ */
const beforeUpload: UploadProps['beforeUpload'] = rawFile => {
  if (rawFile.size / 1024 / 1024 >= props.fileSize) {
    notifyWarn(`上传文件大小不能超过 ${props.fileSize}M！`);
    return false;
  }
  if (!props.accept || props.accept === '*') {
    uploadCycleActive = true; // 有新上传加入
    return true;
  }
  const ext = getExt(rawFile.name);
  const accepts = props.accept.split(',').map(s => s.trim().toLowerCase());
  if (!accepts.includes(ext)) {
    notifyWarn(`仅支持 ${props.accept} 格式的文件上传！`);
    return false;
  }
  uploadCycleActive = true;
  return true;
};
const handleExceed = () => notifyWarn(`当前最多只能上传 ${props.limit} 份文件，请移除后上传！`);

/* ------------ 下载 ------------ */
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
    console.log('无法解析 URL，强制下载', url);
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
      try {
        return decodeURIComponent(rfc5987[2]);
      } catch {
        console.log('无法解码 RFC5987 编码的文件名');
      }
    } else {
      try {
        return decodeURIComponent(value);
      } catch {
        console.log('无法解码 URL 编码的文件名');
      }
      return value;
    }
  }
  const normalMatch = /filename\s*=\s*([^;]+)/i.exec(cd);
  if (normalMatch) return normalMatch[1].trim().replace(/^"(.*)"$/, '$1');
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

/* ------------ 进度包装 ------------ */
class CustomUploadProgressEvent extends ProgressEvent {
  percent: number;
  constructor(e: ProgressEvent) {
    super(e.type, e);
    this.percent = e.lengthComputable ? Math.round((e.loaded / e.total) * 100) : 0;
  }
}

/* ------------ 对外暴露 ------------ */
function getAllUploadResults(): IUploadResult[] {
  const ordered: IUploadResult[] = [];
  _fileList.value.forEach(f => {
    const uid = String((f as any).uid);
    const r = _resultMap.value.get(uid);
    if (r) ordered.push(r);
  });
  return ordered;
}
function forceEmitAllSuccess() {
  // 强制触发，不受 requireNewUploadForAllSuccess 约束
  if (!isAllSuccess()) {
    logDebug('forceEmitAllSuccess 条件未满足');
    return;
  }
  const list = exportResultList();
  lastAllSuccessSignature = ''; // 重置签名允许再次触发
  emit('all-success', list.slice());
  logDebug('forceEmitAllSuccess 触发 数量=', list.length);
  return list;
}

defineExpose({
  getAllUploadResults,
  forceEmitAllSuccess
});

/* ------------ 生命周期 ------------ */
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
