import type { IPageQuery } from '@/api/types';

// 查询条件
export type SysDataRoleQuery = IPageQuery & {
  roleName?: string;
  isLock?: string;
};

// 编辑form表单
export type SysDataRoleForm = {
  id?: number;
  roleName?: string;
  remark?: string;
  isLock?: string;
};

// list或detail返回结构
export type SysDataRoleRow = {
  id?: number;
  roleName?: string;
  remark?: string;
  isLock?: string;
};

// 数据角色Form初始化数据：菜单树、部门树、用户列等
export type SysDataRoleMeta = {
  menuLists: SysDataRoleMenuTree[];
};

export type SysDataRoleMenuTree = {
  id: string;
  pid: string;
  title: string;
  children: SysDataRoleMenuTree[];
};
