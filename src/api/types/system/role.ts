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
  menuLists: RoleMenuTree[];
  selectIds: string[];
};

export type RoleMenuTree = {
  id: string;
  pid: string;
  title: string;
  children: RoleMenuTree[];
};

export type RoleMenuForm = {
  menuIds: string[];
  roleId: number;
};
