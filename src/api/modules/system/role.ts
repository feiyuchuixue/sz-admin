import { adminHttp } from '@/api/client';
import type { RoleQuery, RoleInfo, RoleForm, RoleMenu, RoleMenuForm } from '@/api/types/system/role';
import type { IPage } from '@/api/types';

/**
 * 鑾峰彇瑙掕壊鍒楄〃
 * @param params
 * @returns {*}
 */
export const getRoleList = (params: RoleQuery) => {
  return adminHttp.get<IPage<RoleInfo>>(`/sys-role`, params);
};

/**
 * 娣诲姞瑙掕壊
 * @param params
 * @returns {*}
 */
export const addRole = (params: RoleForm) => {
  return adminHttp.post(`/sys-role`, params);
};

/**
 * 淇敼瑙掕壊
 * @param params
 * @returns {*}
 */
export const editRole = (params: RoleForm) => {
  return adminHttp.put(`/sys-role`, params);
};

/**
 * 鍒犻櫎瑙掕壊
 * @param params
 * @returns {*}
 */
export const deleteRole = (params: { ids: number[] }) => {
  return adminHttp.delete(`/sys-role`, params);
};

/**
 * 鑾峰彇瑙掕壊鑿滃崟鏉冮檺
 * @param params
 * @returns {*}
 */
export const getRoleMenus = (params: { roleId: number }) => {
  return adminHttp.get<RoleMenu>(`/sys-role/menu`, params);
};

/**
 * 璁剧疆瑙掕壊鑿滃崟鏉冮檺
 * @param params
 * @returns {*}
 */
export const setRoleMenus = (params: RoleMenuForm) => {
  return adminHttp.put(`/sys-role/menu`, params);
};
