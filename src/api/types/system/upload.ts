import type { UploadRawFile } from 'element-plus/es/components/upload/src/upload';

export type UploadFile = {
  file: UploadRawFile;
  dirTag?: string;
};

export type UploadResult = {
  url: string;
  filename: string;
  eTag: string;
  objectName: string;
  dirTag: string;
  contextType: string;
  size: number;
  fileId: number;
};

export type IUploadResult = UploadResult | null;

/**
 * 新上传请求参数（对应 POST /resource/upload）
 */
export type ResourceUploadFile = {
  file: UploadRawFile;
  sceneCode: string;
  bizKey?: string;
  pathSegments?: string; // 路径分段，逗号分割，BIZ/BIZ_DATE 策略时生效，如 "userId,dept"
};

/**
 * 新上传响应结果（对应 ResourceUploadResult）
 */
export type ResourceUploadResult = {
  objectKey: string;
  originName: string;
  eTag: string;
  accessUrl: string;
  contentType: string;
  size: number;
  resourceId: number;
};

/**
 * 附件/文件资源 引用（多文件 JSON 列入库结构）
 */
export type ResourceRef = {
  objectKey: string;
  originName: string;
  contentType: string;
  sceneCode?: string;
  accessUrl?: string;
};

export type IResourceUploadResult = ResourceUploadResult | null;
