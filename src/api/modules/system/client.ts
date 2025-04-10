import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { IPage } from '@/api/types';
import type { SysClientForm, SysClientQuery, SysClientRow } from '@/api/types/system/client';
/**
 * 查询列表
 * @param params
 * @returns {*}
 */
export const getSysClientListApi = (params: SysClientQuery) => {
  return http.get<IPage<SysClientRow>>(ADMIN_MODULE + `/sys-client`, params);
};

/**
 * 添加
 * @param params
 * @returns {*}
 */
export const createSysClientApi = (params: SysClientForm) => {
  return http.post(ADMIN_MODULE + `/sys-client`, params);
};

/**
 * 修改
 * @param params
 * @returns {*}
 */
export const updateSysClientApi = (params: SysClientForm) => {
  return http.put(ADMIN_MODULE + `/sys-client`, params);
};

/**
 * 删除
 * @param params
 * @returns {*}
 */
export const removeSysClientApi = (params: { ids: number[] }) => {
  return http.delete(ADMIN_MODULE + `/sys-client`, params);
};

/**
 * 获取详情
 * @param params
 * @returns {*}
 */
export const getSysClientDetailApi = (params: { id: number }) => {
  const { id } = params;
  return http.get<SysClientRow>(ADMIN_MODULE + `/sys-client/${id}`);
};
