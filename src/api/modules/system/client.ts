import { adminHttp } from '@/api/client';
import type { IPage } from '@/api/types';
import type { SysClientForm, SysClientQuery, SysClientRow } from '@/api/types/system/client';
/**
 * 鏌ヨ鍒楄〃
 * @param params
 * @returns {*}
 */
export const getSysClientListApi = (params: SysClientQuery) => {
  return adminHttp.get<IPage<SysClientRow>>(`/sys-client`, params);
};

/**
 * 娣诲姞
 * @param params
 * @returns {*}
 */
export const createSysClientApi = (params: SysClientForm) => {
  return adminHttp.post(`/sys-client`, params);
};

/**
 * 淇敼
 * @param params
 * @returns {*}
 */
export const updateSysClientApi = (params: SysClientForm) => {
  return adminHttp.put(`/sys-client`, params);
};

/**
 * 鍒犻櫎
 * @param params
 * @returns {*}
 */
export const removeSysClientApi = (params: { ids: number[] }) => {
  return adminHttp.delete(`/sys-client`, params);
};

/**
 * 鑾峰彇璇︽儏
 * @param params
 * @returns {*}
 */
export const getSysClientDetailApi = (params: { id: number }) => {
  const { id } = params;
  return adminHttp.get<SysClientRow>(`/sys-client/${id}`);
};
