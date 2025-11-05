import type { IPageQuery } from '@/api/types';

export type RoleQuery = IPageQuery & {
  roleName?: string;
};

export type RoleForm = {
  id?: number;
  roleName: string;
  remark: string;
};

export type RoleInfo = {
  id: number;
  roleName: string;
  remark: string;
  delFlag: string;
  createTime: string;
  updateTime: string;
  isLock?: string;
  permissions?: string;
};

export type RoleMenu = {
  selectMenuIds: string[];
  menuLists: RoleMenuTree[];
  deptLists: DeptTree[];
  userLists: UserInfo[];
  scope: Scope;
};

export type RoleMenuTree = {
  id: string;
  pid: string;
  title: string;
  children: RoleMenuTree[];
  useDataScope: string;
  menuTypeCd: string;
  permissions: string;
};

export type DeptTree = {
  id: number;
  pid: string;
  name: string;
  children: RoleMenuTree[];
};

export type UserInfo = {
  id: number;
  nickname: string;
  username: string;
};

export type RoleMenuForm = {
  menuIds: string[];
  roleId: number;
};

export type Scope = {
  menuId: string;
  dataScope: string;
  deptIds: number[];
  userIds: number[];
};
