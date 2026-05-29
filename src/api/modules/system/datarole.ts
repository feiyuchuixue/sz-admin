import { adminHttp } from '@/api/client';
import type { IPage } from '@/api/types';
import type { SysDataRoleQuery, SysDataRoleRow, SysDataRoleForm, SysDataRoleMeta } from '@/api/types/system/datarole';
/**
 * 鏌ヨ鍒楄〃
 * @param params
 * @returns {*}
 */
export const getSysDataRoleListApi = (params: SysDataRoleQuery) => {
  return adminHttp.get<IPage<SysDataRoleRow>>(`/sys-data-role`, params);
};

/**
 * 娣诲姞
 * @param params
 * @returns {*}
 */
export const createSysDataRoleApi = (params: SysDataRoleForm) => {
  return adminHttp.post(`/sys-data-role`, params);
};

/**
 * 淇敼
 * @param params
 * @returns {*}
 */
export const updateSysDataRoleApi = (params: SysDataRoleForm) => {
  return adminHttp.put(`/sys-data-role`, params);
};

/**
 * 鍒犻櫎
 * @param params
 * @returns {*}
 */
export const removeSysDataRoleApi = (params: { ids: (string | number)[] }) => {
  return adminHttp.delete(`/sys-data-role`, params);
};

/**
 * 鑾峰彇璇︽儏
 * @param params
 * @returns {*}
 */
export const getSysDataRoleDetailApi = (params: { id: number }) => {
  const { id } = params;
  return adminHttp.get<SysDataRoleRow>(`/sys-data-role/${id}`);
};

/**
 * 鑾峰彇鏁版嵁瑙掕壊鍒濆鑿滃崟淇℃伅
 * @param params
 * @returns {*}
 */
export const getSysDataRoleMenuApi = () => {
  return adminHttp.get<SysDataRoleMeta>(`/sys-data-role/menu`);
};
