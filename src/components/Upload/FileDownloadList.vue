<template>
  <div class="file-download-list" :class="'align-' + align">
    <template v-if="visibleFiles.length">
      <div class="file-row" v-for="file in visibleFiles" :key="file.url" :class="{ 'is-image': isImage(file.url) }">
        <el-icon class="file-icon"><Document /></el-icon>

        <span class="file-name" :title="file.filename || getFileName(file.url)">
          {{ file.filename || getFileName(file.url) }}
          <span v-if="isImage(file.url)" class="img-preview-tag">图片</span>
        </span>

        <div class="op-group">
          <el-tooltip content="下载" placement="top" :show-after="120">
            <span class="op-icon op-download" @click="handleDownload(file)">
              <el-icon><Download /></el-icon>
            </span>
          </el-tooltip>

          <span v-if="isImage(file.url)" class="op-icon op-preview" title="预览" @click="openViewer(file)">
            <el-icon><View /></el-icon>
          </span>
        </div>
      </div>

      <div v-if="needCollapse" class="collapse-toggle" @click="expanded = !expanded">
        <span class="toggle-text"> {{ expanded ? '收起' : '展开' }} ({{ fileList.length - maxRows }}) </span>
        <i :class="['arrow', expanded ? 'up' : 'down']"></i>
      </div>
    </template>
    <span v-else class="no-file">-</span>

    <el-image-viewer
      v-if="viewerVisible"
      :url-list="imageUrls"
      :initial-index="currentIndex"
      :infinite="true"
      :z-index="viewerZIndex"
      hide-on-click-modal
      teleported
      @close="viewerVisible = false"
      @switch="onViewerSwitch"
    />

    <Teleport to="body">
      <transition name="fdl-fade">
        <div v-if="viewerVisible && currentImageName" class="viewer-name-bar" :style="{ zIndex: barZIndex }">
          <span class="bar-accent"></span>
          <span class="bar-text">
            {{ currentImageName }}
            <template v-if="imageFiles.length > 1"> （{{ currentIndex + 1 }}/{{ imageFiles.length }}） </template>
          </span>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { Document, Download, View } from '@element-plus/icons-vue';
import { ref, computed, watch, nextTick } from 'vue';
import type { IUploadResult } from '@/api/types/system/upload';
import { useUrlDownload } from '@/hooks/useUrlDownload';
import { ElMessage } from 'element-plus';

defineOptions({ name: 'FileDownloadList' });

type FileType = IUploadResult & { url: string; filename?: string };

const props = withDefaults(
  defineProps<{
    files?: FileType[] | string[];
    align?: 'left' | 'center' | 'right';
    maxRows?: number;
  }>(),
  { files: () => [] }
);

const align = props.align || 'left';
const maxRows = props.maxRows ?? 0;

const fileList = computed<FileType[]>(() => {
  if (!props.files || !props.files.length) return [];
  if (typeof props.files[0] === 'string') {
    return (props.files as string[]).map(url => ({
      url,
      filename: url.split('/').pop() ?? '',
      eTag: '',
      objectName: '',
      dirTag: '',
      contextType: '',
      size: 0,
      fileId: 0,
      id: undefined,
      type: undefined
    }));
  }
  return props.files as FileType[];
});

function getFileName(url: string) {
  return url.split('/').pop() || url;
}
function isImage(url: string) {
  return /\.(png|jpe?g|gif|bmp|webp|svg)$/i.test(url);
}

/* 折叠显示逻辑 */
const expanded = ref(false);
const needCollapse = computed(() => maxRows > 0 && fileList.value.length > maxRows);
const visibleFiles = computed(() =>
  !needCollapse.value ? fileList.value : expanded.value ? fileList.value : fileList.value.slice(0, maxRows)
);

function handleDownload(file: FileType) {
  useUrlDownload(file).catch(err => {
    ElMessage.error(err?.message || '下载失败');
  });
}

/* 图片预览逻辑 */
const viewerVisible = ref(false);
const currentIndex = ref(0);
const imageFiles = computed(() =>
  fileList.value.filter(f => isImage(f.url)).map(f => ({ url: f.url, name: f.filename || getFileName(f.url) }))
);
const imageUrls = computed(() => imageFiles.value.map(i => i.url));
const currentImageName = computed(() => imageFiles.value[currentIndex.value]?.name || '');

const viewerZIndex = 5000;
const barZIndex = ref(viewerZIndex + 1);

function openViewer(file: FileType) {
  const idx = imageFiles.value.findIndex(i => i.url === file.url);
  currentIndex.value = idx < 0 ? 0 : idx;
  viewerVisible.value = true;
}
function onViewerSwitch(newIndex: number) {
  currentIndex.value = newIndex;
}
watch(viewerVisible, v => {
  if (v) {
    nextTick(() => {
      const wrappers = document.querySelectorAll('.el-image-viewer__wrapper');
      const wrapper = wrappers[wrappers.length - 1] as HTMLElement | null;
      if (wrapper) {
        const z = parseInt(getComputedStyle(wrapper).zIndex || `${viewerZIndex}`, 10);
        barZIndex.value = z + 1;
      }
    });
  }
});
</script>

<style scoped lang="scss">
.file-download-list {
  --fdl-row-height: 24px;
  --fdl-color-text: var(--el-text-color-primary, #303133);
  --fdl-color-text-secondary: #b0b0b0;
  --fdl-hover-bg: var(--el-color-primary-light-9, #f2f8ff);
  --fdl-border-radius: 3px;
  --fdl-image-badge-bg: #fdf6ec;
  --fdl-image-badge-border: #f5dab1;
  --fdl-image-badge-text: #b88230;
  --fdl-icon-color: var(--el-text-color-secondary, #b0b0b0);
  --fdl-icon-hover-primary: #409eff;
  --fdl-icon-hover-warning: #409eff;
  --fdl-namebar-bg: rgba(0, 0, 0, 0.55);
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
  width: 100%;
}

.align-left {
  align-items: flex-start;
}
.align-center {
  align-items: center;
}
.align-right {
  align-items: flex-end;
}

.file-row {
  position: relative;
  display: grid;
  grid-template-columns: 18px 1fr auto;
  align-items: center;
  column-gap: 6px;
  min-width: 0;
  height: var(--fdl-row-height);
  line-height: var(--fdl-row-height);
  padding: 0 2px;
  font-size: 13px;
  color: var(--fdl-color-text);
  border-radius: var(--fdl-border-radius);
  transition: background 0.16s;
}
.file-row + .file-row {
  margin-top: 2px;
}
.file-row:hover {
  background: var(--fdl-hover-bg);
}
.file-row::before {
  content: '';
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--el-color-primary, #409eff);
  opacity: 0.35;
  position: absolute;
  left: 6px;
  top: 50%;
  transform: translateY(-50%);
}
.file-row:hover::before {
  opacity: 0.65;
}
.file-icon {
  color: var(--fdl-icon-hover-primary);
  font-size: 18px;
  transition: color 0.18s;
}
.file-row.is-image:hover .file-icon {
  color: var(--fdl-icon-hover-primary);
}
.file-name {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--fdl-color-text);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding-right: 4px;
}
.img-preview-tag {
  font-size: 11px;
  line-height: 14px;
  padding: 2px 6px;
  border-radius: 10px;
  border: 1px solid var(--fdl-image-badge-border);
  background: var(--fdl-image-badge-bg);
  color: var(--fdl-image-badge-text);
  font-weight: 400;
  display: inline-flex;
  align-items: center;
}
.op-group {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding-right: 2px;
  font-size: 0;
}
.op-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  cursor: pointer;
  color: var(--fdl-icon-color);
  transition: color 0.18s;
  padding: 2px;
  border-radius: 4px;
}
.op-icon:hover {
  background: rgba(0, 0, 0, 0.05);
}
.op-icon.op-download:hover {
  color: var(--fdl-icon-hover-primary);
}
.op-icon.op-preview:hover {
  color: var(--fdl-icon-hover-warning);
}
.no-file {
  color: var(--el-text-color-placeholder, #c0c4cc);
  font-size: 13px;
  text-align: center;
  padding: 6px 0;
}
.collapse-toggle {
  display: inline-flex;
  align-items: center;
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-color-primary, #409eff);
  cursor: pointer;
  user-select: none;
  padding: 2px 6px;
  border-radius: 4px;
  line-height: 16px;
  background: var(--fdl-hover-bg);
  transition: background 0.15s;
}
.collapse-toggle:hover {
  background: var(--el-color-primary-light-8, #ecf5ff);
}
.toggle-text {
  margin-right: 4px;
}
.arrow {
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
}
.arrow.down {
  border-top: 6px solid var(--el-color-primary, #409eff);
}
.arrow.up {
  border-bottom: 6px solid var(--el-color-primary, #409eff);
}
:deep(.el-image-viewer__wrapper) {
  background: rgba(0, 0, 0, 0.78);
  backdrop-filter: blur(2px);
}
.viewer-name-bar {
  position: fixed;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  max-width: 60vw;
  background: var(--fdl-namebar-bg);
  color: #fff;
  font-size: 12px;
  padding: 5px 16px;
  line-height: 1.4;
  border-radius: 18px;
  backdrop-filter: blur(4px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.25);
  pointer-events: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  letter-spacing: 0.5px;
}
.fdl-fade-enter-active,
.fdl-fade-leave-active {
  transition: opacity 0.18s;
}
.fdl-fade-enter-from,
.fdl-fade-leave-to {
  opacity: 0;
}
</style>
