import type { UploadRawFile } from 'element-plus/es/components/upload/src/upload';

export namespace IUpload {
  export interface File {
    file: UploadRawFile;
    dirTag: string;
  }

  export interface UploadResult {
    url: string;
    filename: string;
    eTag: string;
  }
}
