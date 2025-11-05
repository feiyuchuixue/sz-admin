import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type {
  UserQuery,
  UserInfo,
  UserForm,
  UserRoleData,
  UserRoleForm,
  UserPasswordForm,
  UserTagOptions
} from '@/api/types/system/user';
import type { IPage } from '@/api/types';
import type { SysDeptDeptSetting, SysDeptTree } from '@/api/types/system/dept';

/**
 * 获取用户列表
 * @param params
 * @returns {*}
 */
export const getUserList = (params: UserQuery) => {
  return http.get<IPage<UserInfo>>(ADMIN_MODULE + `/sys-user`, params);
};

/**
 * 添加用户
 * @param params
 * @returns {*}
 */
export const addUser = (params: UserForm) => {
  return http.post(ADMIN_MODULE + `/sys-user`, params);
};

/**
 * 修改用户
 * @param params
 * @returns {*}
 */
export const editUser = (params: UserForm) => {
  return http.put(ADMIN_MODULE + `/sys-user`, params);
};

/**
 * 删除用户
 * @param params
 * @returns {*}
 */
export const deleteUser = (params: { ids: number[] }) => {
  return http.delete(ADMIN_MODULE + `/sys-user`, params);
};

/**
 * 获取用户角色
 * @param params
 * @returns {*}
 */
export const getUserRole = (params: { userId: number }) => {
  return http.get<UserRoleData>(ADMIN_MODULE + `/sys-user/role`, params);
};

/**
 * 设置用户角色
 * @param params
 * @returns {*}
 */
export const setUserRole = (params: UserRoleForm) => {
  return http.put(ADMIN_MODULE + `/sys-user/role`, params);
};

/**
 * （个人）修改密码
 * @param params
 * @returns {*}
 */
export const changePassword = (params: UserPasswordForm) => {
  return http.put(ADMIN_MODULE + `/sys-user/password`, params);
};

/**
 * 重置密码
 * @param params
 */
export const resetPassword = (params: { id: number }) => {
  const { id } = params;
  return http.put(ADMIN_MODULE + `/sys-user/reset/password/${id}`, {});
};

/**
 * 获取登录用户信息
 * @returns {*}
 */
export const getUserinfo = () => {
  return http.get<UserInfo>(ADMIN_MODULE + `/sys-user/userinfo`);
};

/**
 * 添加
 * @param params
 * @returns {*}
 */
export const bindUserDeptApi = (params: SysDeptDeptSetting) => {
  return http.post(ADMIN_MODULE + `/sys-user/dept/bind`, params);
};

/**
 * 用户部门属性列表
 */
export const getUserDeptTree = () => {
  return http.get<SysDeptTree[]>(ADMIN_MODULE + `/sys-user/dept/tree`);
};

/**
 * 解锁用户
 * @param params
 * @returns {*}
 */
export const unlockUser = (params: { ids: (string | number)[] }) => {
  return http.post(ADMIN_MODULE + `/sys-user/unlock`, params);
};

/**
 * 获取详情
 * @param params
 * @returns {*}
 */
export const getUserDetailApi = (params: { id: string }) => {
  const { id } = params;
  return http.get<UserInfo>(ADMIN_MODULE + `/sys-user/${id}`);
};

/**
 * 获取用户数据角色
 * @param params
 * @returns {*}
 */
export const getDataUserRole = (params: { userId: number }) => {
  return http.get<UserRoleData>(ADMIN_MODULE + `/sys-user/datarole`, params);
};

/**
 * 设置用户类型
 * @param params
 */
export const setUserTag = (params: UserTagOptions) => {
  return http.post(ADMIN_MODULE + `/sys-user/changeset/usertag`, params);
};
