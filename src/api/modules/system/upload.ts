import type { CustomAxiosRequestConfig } from '@/api';
import { adminHttp } from '@/api/client';
import type {
  IUploadResult,
  ResourceUploadFile,
  ResourceUploadResult,
  UploadFile,
  UploadResult
} from '@/api/types/system/upload';
import type { AxiosRequestConfig } from 'axios';

/**
 * 涓婁紶鏂囦欢
 * @param params
 * @returns {*}
 */
/** @deprecated 鏃т笂浼犲搷搴旂粨鏋滐紝璇蜂娇鐢?ResourceUploadResult */
export const uploadFile = (params: UploadFile, config?: AxiosRequestConfig<any> | undefined) => {
  return adminHttp.upload<UploadResult>(`/sys-file/upload`, params, config);
};

/**
 * 涓婁紶妯℃澘鏂囦欢
 * @param params
 * @param config
 * @returns {*}
 */
export const uploadTmpFile = (params: UploadFile, config?: AxiosRequestConfig<any> | undefined) => {
  return adminHttp.upload<IUploadResult>(`/sys-temp-file/upload`, params, config);
};

/**
 * 缁熶竴璧勬簮涓婁紶鎺ュ彛锛圥OST /resource/upload锛? * @param params sceneCode 蹇呭～锛宐izKey 鍙€? * @param config axios 閰嶇疆
 */
export const uploadResource = (params: ResourceUploadFile, config?: CustomAxiosRequestConfig<any> | undefined) => {
  return adminHttp.upload<ResourceUploadResult>(`/resource/upload`, params, config);
};
