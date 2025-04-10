import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { MenuQuery, MenuForm, MenuTree, MenuPermissionQuery } from '@/api/types/system/menu';

/**
 * 获取菜单列表
 * @param params
 * @returns {*}
 */
export const getMenuList = (params: MenuQuery) => {
  return http.get<Menu.MenuOptions[]>(ADMIN_MODULE + `/sys-menu`, params);
};

/**
 * 添加菜单
 * @param params
 * @returns {*}
 */
export const addMenu = (params: MenuForm) => {
  return http.post(ADMIN_MODULE + `/sys-menu`, params);
};

/**
 * 修改菜单
 * @param params
 * @returns {*}
 */
export const editMenu = (params: MenuForm) => {
  return http.put(ADMIN_MODULE + `/sys-menu`, params);
};

/**
 * 删除菜单
 * @param params
 * @returns {*}
 */
export const deleteMenu = (params: { ids: string[] }) => {
  return http.delete(ADMIN_MODULE + `/sys-menu`, params);
};

/**
 * 获取菜单详情
 * @param params
 * @returns {*}
 */
export const getMenuInfo = (params: { id: string }) => {
  const { id } = params;
  return http.get(ADMIN_MODULE + `/sys-menu/${id}`);
};

/**
 * 获取上级菜单树
 * @param params
 * @returns {*}
 */
export const getMenuTree = (params: { nodeId?: string }) => {
  return http.get<MenuTree[]>(ADMIN_MODULE + `/sys-menu/tree`, params);
};

/**
 * 菜单权限是否存在验证
 * @param params
 * @returns {*}
 */
export const getBtnExits = (params: MenuPermissionQuery) => {
  return http.get<{ permissionCount: number }>(ADMIN_MODULE + `/sys-menu/btn/exists`, params);
};

/**
 * 导出菜单sql
 * @param params
 */
export const exportMenuSql = (params: { ids: string[] }) => {
  return http.post<string>(ADMIN_MODULE + `/sys-menu/sql/export`, params);
};

/**
 * 修改菜单数据权限
 * @param params
 * @returns {*}
 */
export const chaneDataRole = (params: { id: string }) => {
  const { id } = params;
  return http.put(ADMIN_MODULE + `/sys-menu/datarole/change/${id}`);
};
