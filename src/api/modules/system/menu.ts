import { adminHttp } from '@/api/client';
import type { MenuQuery, MenuForm, MenuTree, MenuPermissionQuery } from '@/api/types/system/menu';
import type { ScriptExportResult } from '@/api/types/script';

/**
 * 鑾峰彇鑿滃崟鍒楄〃
 * @param params
 * @returns {*}
 */
export const getMenuList = (params: MenuQuery) => {
  return adminHttp.get<Menu.MenuOptions[]>(`/sys-menu`, params);
};

/**
 * 娣诲姞鑿滃崟
 * @param params
 * @returns {*}
 */
export const addMenu = (params: MenuForm) => {
  return adminHttp.post(`/sys-menu`, params);
};

/**
 * 淇敼鑿滃崟
 * @param params
 * @returns {*}
 */
export const editMenu = (params: MenuForm) => {
  return adminHttp.put(`/sys-menu`, params);
};

/**
 * 鍒犻櫎鑿滃崟
 * @param params
 * @returns {*}
 */
export const deleteMenu = (params: { ids: string[] }) => {
  return adminHttp.delete(`/sys-menu`, params);
};

/**
 * 鑾峰彇鑿滃崟璇︽儏
 * @param params
 * @returns {*}
 */
export const getMenuInfo = (params: { id: string }) => {
  const { id } = params;
  return adminHttp.get(`/sys-menu/${id}`);
};

/**
 * 鑾峰彇涓婄骇鑿滃崟鏍? * @param params
 * @returns {*}
 */
export const getMenuTree = (params: { nodeId?: string }) => {
  return adminHttp.get<MenuTree[]>(`/sys-menu/tree`, params);
};

/**
 * 鑿滃崟鏉冮檺鏄惁瀛樺湪楠岃瘉
 * @param params
 * @returns {*}
 */
export const getBtnExits = (params: MenuPermissionQuery) => {
  return adminHttp.get<{ permissionCount: number }>(`/sys-menu/btn/exists`, params);
};

/**
 * 瀵煎嚭鑿滃崟sql
 * @param params
 */
export const exportMenuSql = (params: { ids: string[] }) => {
  return adminHttp.post<string>(`/sys-menu/sql/export`, params);
};

export const exportMenuScript = (params: { ids: string[]; sqlDialect?: string }) => {
  return adminHttp.post<ScriptExportResult>('/sys-menu/script/export', params);
};

/**
 * 淇敼鑿滃崟鏁版嵁鏉冮檺
 * @param params
 * @returns {*}
 */
export const chaneDataRole = (params: { id: string }) => {
  const { id } = params;
  return adminHttp.put(`/sys-menu/datarole/change/${id}`);
};
