import http, { type CustomAxiosRequestConfig } from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type {
  IUploadResult,
  ResourceUploadFile,
  ResourceUploadResult,
  UploadFile,
  UploadResult
} from '@/api/types/system/upload';
import type { AxiosRequestConfig } from 'axios';

/**
 * 上传文件
 * @param params
 * @returns {*}
 */
/** @deprecated 旧上传响应结果，请使用 ResourceUploadResult */
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

/**
 * 统一资源上传接口（POST /resource/upload）
 * @param params sceneCode 必填，bizKey 可选
 * @param config axios 配置
 */
export const uploadResource = (params: ResourceUploadFile, config?: CustomAxiosRequestConfig<any> | undefined) => {
  return http.upload<ResourceUploadResult>(ADMIN_MODULE + `/resource/upload`, params, config);
};
