import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { ConfigForm, ConfigInfo, ConfigQuery } from '@/api/types/system/config';
import type { IPage } from '@/api/types';

/**
 * 获取列表
 * @param params
 * @returns {*}
 */
export const getConfigList = (params: ConfigQuery) => {
  return http.get<IPage<ConfigInfo>>(ADMIN_MODULE + `/sys-config`, params);
};

/**
 * 添加
 * @param params
 * @returns {*}
 */
export const addConfig = (params: ConfigForm) => {
  return http.post(ADMIN_MODULE + `/sys-config`, params);
};

/**
 * 修改
 * @param params
 * @returns {*}
 */
export const editConfig = (params: ConfigForm) => {
  return http.put(ADMIN_MODULE + `/sys-config`, params);
};

/**
 * 删除
 * @param params
 * @returns {*}
 */
export const deleteConfig = (params: { ids: number[] }) => {
  return http.delete(ADMIN_MODULE + `/sys-config`, params);
};
