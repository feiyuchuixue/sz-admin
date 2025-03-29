import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { RoleQuery, RoleInfo, RoleForm, RoleMenu, RoleMenuForm } from '@/api/types/system/role';
import type { IPage } from '@/api/types';

/**
 * 获取角色列表
 * @param params
 * @returns {*}
 */
export const getRoleList = (params: RoleQuery) => {
  return http.get<IPage<RoleInfo>>(ADMIN_MODULE + `/sys-role`, params);
};

/**
 * 添加角色
 * @param params
 * @returns {*}
 */
export const addRole = (params: RoleForm) => {
  return http.post(ADMIN_MODULE + `/sys-role`, params);
};

/**
 * 修改角色
 * @param params
 * @returns {*}
 */
export const editRole = (params: RoleForm) => {
  return http.put(ADMIN_MODULE + `/sys-role`, params);
};

/**
 * 删除角色
 * @param params
 * @returns {*}
 */
export const deleteRole = (params: { ids: number[] }) => {
  return http.delete(ADMIN_MODULE + `/sys-role`, params);
};

/**
 * 获取角色菜单权限
 * @param params
 * @returns {*}
 */
export const getRoleMenus = (params: { roleId: number }) => {
  return http.get<RoleMenu>(ADMIN_MODULE + `/sys-role/menu`, params);
};

/**
 * 设置角色菜单权限
 * @param params
 * @returns {*}
 */
export const setRoleMenus = (params: RoleMenuForm) => {
  return http.put(ADMIN_MODULE + `/sys-role/menu`, params);
};
