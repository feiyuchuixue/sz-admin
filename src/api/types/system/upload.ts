export type UploadFile = {
  file: File;
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

// 预签名上传请求类型
export interface PreSignedUploadRequest {
  filename: string;
  dirTag: string;
  fileSize: number;
  contentType?: string;
}

// 预签名上传响应类型
export interface PreSignedUploadResponse {
  fileId: number;
  uploadUrl: string;
  objectName: string;
  expireTime: string;
  headers?: Record<string, string>;
}

// 确认上传请求类型
export interface ConfirmUploadRequest {
  fileId: number;
}

// 上传进度回调类型
export interface UploadProgressCallback {
  (progress: number): void;
}

// 新的上传方法配置
export interface DirectUploadConfig {
  onProgress?: UploadProgressCallback;
  signal?: AbortSignal; // 支持取消上传
}

export type IUploadResult = UploadResult | null;
