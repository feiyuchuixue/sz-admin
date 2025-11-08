<template>
  <el-dialog v-model="dialogVisible" :title="`导入：${parameter.title}`" :destroy-on-close="true" width="580px" draggable>
    <el-form class="drawer-multiColumn-form" label-width="100px">
      <!-- 优化背景和标签的模板信息区域 -->
      <div class="template-info-card">
        <div class="template-content">
          <div class="template-meta">
            <div class="meta-row">
              <span class="meta-label">标识：</span>
              <el-tooltip :content="parameter.alias" effect="dark" placement="top">
                <el-tag type="info" size="small" effect="plain">
                  {{ parameter.alias }}
                </el-tag>
              </el-tooltip>
            </div>
            <div class="meta-row">
              <span class="meta-label">文件名：</span>
              <el-tooltip :content="parameter.fileName" effect="dark" placement="top">
                <el-tag type="info" size="small" effect="plain">
                  {{ parameter.fileName }}
                </el-tag>
              </el-tooltip>
            </div>
            <div v-if="parameter.templateName && parameter.templateName !== parameter.fileName" class="meta-row">
              <span class="meta-label">展示名：</span>
              <el-tag type="warning" size="small" effect="plain">{{ parameter.templateName }}</el-tag>
            </div>
          </div>
          <div class="template-actions">
            <el-button type="primary" :icon="Download" @click="downloadTemp"> 下载模板 </el-button>
          </div>
        </div>
      </div>

      <!-- 文件上传 -->
      <el-form-item label="文件上传：">
        <el-upload
          action="#"
          class="upload"
          :drag="true"
          :limit="excelLimit"
          :multiple="true"
          :show-file-list="true"
          :http-request="uploadExcel"
          :before-upload="beforeExcelUpload"
          :on-exceed="handleExceed"
          :on-success="excelUploadSuccess"
          :on-error="excelUploadError"
          :accept="parameter.fileType!.join(',')"
        >
          <slot name="empty">
            <el-icon class="el-icon--upload">
              <upload-filled />
            </el-icon>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          </slot>
          <template #tip>
            <slot name="tip">
              <div class="el-upload__tip">请上传 .xls , .xlsx 标准格式文件，文件最大为 {{ parameter.fileSize }}M</div>
            </slot>
          </template>
        </el-upload>
      </el-form-item>

      <!-- 数据覆盖选项 -->
      <el-form-item label="数据覆盖：">
        <div class="cover-option">
          <el-switch v-model="isCover" />
          <span class="cover-hint">启用后将覆盖相同主键的数据</span>
        </div>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDownload } from '@/hooks/useDownload';
import { Download } from '@element-plus/icons-vue';
import { type UploadRequestOptions, type UploadRawFile, ElNotification } from 'element-plus';
import type { AxiosProgressEvent, AxiosRequestConfig } from 'axios';

defineOptions({
  name: 'ImportExcel'
});

export interface ExcelParameterProps {
  title: string; // 标题
  templateName?: string; // 模板展示/下载文件名
  templateFileType?: File.ExcelFileType; //  模板文件类型
  fileSize?: number; // 上传文件的大小
  fileType?: File.ExcelMimeType[]; // 上传文件的类型
  tempApi?: (params: any) => Promise<any>; // 下载模板的Api
  importApi?: (params: any, config?: AxiosRequestConfig<any> | undefined) => Promise<any>; // 批量导入的Api
  getTableList?: () => void; // 获取表格数据的Api
  alias: string; // 导入查询别名（必填）
  fileName: string; // 查询的文件名（必填）
  param?: Record<string, any>; // 其他查询参数（优先级最高，透传）
}

// 是否覆盖数据
const isCover = ref(false);
// 最大文件上传数
const excelLimit = ref(1);
// dialog状态
const dialogVisible = ref(false);
// 父组件传过来的参数
const parameter = ref<ExcelParameterProps>({
  title: '',
  fileSize: 5,
  fileType: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  alias: '',
  fileName: ''
});

// 接收父组件参数
const acceptParams = (params: ExcelParameterProps) => {
  // 校验必填
  if (!params.alias || !params.fileName) {
    throw new Error('ImportExcel 参数 alias 和 fileName 必填');
  }
  parameter.value = { ...parameter.value, ...params };
  isCover.value = false; // 每次初始化时重置
  dialogVisible.value = true;
};

// Excel 导入模板下载
const downloadTemp = () => {
  if (!parameter.value.tempApi) return;
  const downloadParams = parameter.value.param
    ? parameter.value.param
    : { alias: parameter.value.alias, templateName: parameter.value.fileName };
  useDownload(parameter.value.tempApi, parameter.value.templateName, downloadParams);
};

// 文件上传
const uploadExcel = async (options: UploadRequestOptions) => {
  let excelFormData = new FormData();
  excelFormData.append('file', options.file);
  excelFormData.append('isCover', isCover.value as unknown as Blob);
  await parameter.value.importApi!(excelFormData, {
    onUploadProgress(event: AxiosProgressEvent) {
      const progressEvent = new ProgressEvent('upload', {
        lengthComputable: event.total !== undefined,
        loaded: event.loaded || 0,
        total: event.total || 0
      });
      options.onProgress(new CustomUploadProgressEvent(progressEvent));
    }
  });
  if (parameter.value.getTableList) parameter.value.getTableList();
  dialogVisible.value = false;
};

/**
 * @description 文件上传之前判断
 * @param file 上传的文件
 * */
const beforeExcelUpload = (file: UploadRawFile) => {
  const isExcel = parameter.value.fileType!.includes(file.type as File.ExcelMimeType);
  const fileSize = file.size / 1024 / 1024 < parameter.value.fileSize!;
  if (!isExcel)
    ElNotification({
      title: '温馨提示',
      message: '上传文件只能是 xls / xlsx 格式！',
      type: 'warning'
    });
  if (!fileSize)
    setTimeout(() => {
      ElNotification({
        title: '温馨提示',
        message: `上传文件大小不能超过 ${parameter.value.fileSize}MB！`,
        type: 'warning'
      });
    }, 0);
  return isExcel && fileSize;
};

// 文件数超出提示
const handleExceed = () => {
  ElNotification({
    title: '温馨提示',
    message: '最多只能上传一个文件！',
    type: 'warning'
  });
};

// 上传错误提示
const excelUploadError = () => {
  ElNotification({
    title: '温馨提示',
    message: `导入${parameter.value.title}失败，请您重新上传！`,
    type: 'error'
  });
};

// 上传成功提示
const excelUploadSuccess = () => {
  ElNotification({
    title: '温馨提示',
    message: `导入${parameter.value.title}成功！`,
    type: 'success'
  });
};

class CustomUploadProgressEvent extends ProgressEvent {
  percent: number;
  constructor(event: ProgressEvent) {
    super(event.type, event);
    this.percent = event.lengthComputable ? Math.round((event.loaded / event.total) * 100) : 0;
  }
}
defineExpose({
  acceptParams
});
</script>
<style lang="scss" scoped>
@use './index';
</style>
