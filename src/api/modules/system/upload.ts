import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { IUpload, IUploadResult } from '@/api/interface/system/upload';

/**
 * 上传文件
 * @param params
 * @returns {*}
 */
export const uploadFile = (params: IUpload.File) => {
  return http.upload<IUpload.UploadResult>(ADMIN_MODULE + `/sys-file/upload`, params);
};

/**
 * 上传模板文件
 * @param params
 * @returns {*}
 */
export const uploadTmpFile = (params: IUpload.File) => {
  return http.upload<IUploadResult>(ADMIN_MODULE + `/sys-temp-file/upload`, params);
};
