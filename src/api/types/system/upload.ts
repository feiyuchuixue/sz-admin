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
