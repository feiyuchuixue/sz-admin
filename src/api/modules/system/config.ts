import { adminHttp } from '@/api/client';
import type { ConfigForm, ConfigInfo, ConfigQuery } from '@/api/types/system/config';
import type { IPage } from '@/api/types';

/**
 * 鑾峰彇鍒楄〃
 * @param params
 * @returns {*}
 */
export const getConfigList = (params: ConfigQuery) => {
  return adminHttp.get<IPage<ConfigInfo>>(`/sys-config`, params);
};

/**
 * 娣诲姞
 * @param params
 * @returns {*}
 */
export const addConfig = (params: ConfigForm) => {
  return adminHttp.post(`/sys-config`, params);
};

/**
 * 淇敼
 * @param params
 * @returns {*}
 */
export const editConfig = (params: ConfigForm) => {
  return adminHttp.put(`/sys-config`, params);
};

/**
 * 鍒犻櫎
 * @param params
 * @returns {*}
 */
export const deleteConfig = (params: { ids: number[] }) => {
  return adminHttp.delete(`/sys-config`, params);
};

/**
 * 鑾峰彇鍓嶇鍙傛暟淇℃伅
 * @returns {*}
 */
export const getFrontendConfig = () => {
  return adminHttp.get<Record<string, string>>(`/sys-config/frontend-configs`, {});
};
