import type { IPageQuery } from '@/api/types';

// 查询条件
export type SysDeptQuery = IPageQuery & {
  name?: string;
};

// 编辑form表单
export type SysDeptForm = {
  id?: number;
  name?: string;
  pid?: number;
  sort?: number;
  remark?: string;
  leaders: number[];
};

// list或detail返回结构
export type SysDeptRow = {
  id: number;
  pid: number;
  name: string;
  deep?: number;
  sort?: number;
  remark?: string;
  isLock?: string;
  leaders: number[];
};

export type SysDeptTree = {
  id: number;
  pid: number;
  name: string;
  deep?: number;
  sort?: number;
  children: SysDeptTree[];
  userTotal?: number;
};

export type SysDeptLeader = {
  id: number;
  nickname: string;
};

export type SysDeptLeaderData = {
  leaderInfoVOS: SysDeptLeader[];
};

export type SysDeptDeptSetting = {
  userIds: number[];
  deptIds: number[];
};

export type SysDeptDept = {
  deptLists: SysDeptDeptTree[];
  selectIds: number[];
};

export type SysDeptDeptTree = {
  id: number;
  pid: number;
  name: string;
  children: SysDeptDeptTree[];
};

export type DeptRoleForm = {
  roleIds: number[];
  userId: number;
};

export type DeptRoleData = {
  selectIds: number[];
  roleInfoVOS: DeptRoleInfo[];
};

export type DeptRoleInfo = {
  id: number;
  roleName: string;
};
