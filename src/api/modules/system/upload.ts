import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { IUploadResult, UploadFile, UploadResult } from '@/api/types/system/upload';
import type { AxiosRequestConfig } from 'axios';

/**
 * 上传文件
 * @param params
 * @returns {*}
 */
export const uploadFile = (params: UploadFile, config?: AxiosRequestConfig<any> | undefined) => {
  return http.upload<UploadResult>(ADMIN_MODULE + `/sys-file/upload`, params, config);
};

/**
 * 上传模板文件
 * @param params
 * @param config
 * @returns {*}
 */
export const uploadTmpFile = (params: UploadFile, config?: AxiosRequestConfig<any> | undefined) => {
  return http.upload<IUploadResult>(ADMIN_MODULE + `/sys-temp-file/upload`, params, config);
};
