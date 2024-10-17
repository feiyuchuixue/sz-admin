import type { IPageQuery } from '@/api/interface';

export namespace ISysDept {
  // 查询条件
  export interface Query extends IPageQuery {
    name?: string;
  }

  // 编辑form表单
  export interface Form {
    id?: number;
    name?: string;
    pid?: number;
    sort?: number;
    remark?: string;
    leaders: number[];
  }

  // list或detail返回结构
  export interface Row {
    id: number;
    pid: number;
    name: string;
    deep?: number;
    sort?: number;
    remark?: string;
    isLock?: string;
    leaders: number[];
  }

  export interface Tree {
    id: number;
    pid: number;
    name: string;
    deep?: number;
    sort?: number;
    children: Tree[];
    userTotal?: number;
  }

  export interface Leader {
    id: number;
    nickname: string;
  }

  export interface LeaderData {
    leaderInfoVOS: Leader[];
  }

  export interface DeptSetting {
    userIds: number[];
    deptIds: number[];
  }

  export interface Dept {
    deptLists: DeptTree[];
    selectIds: number[];
  }

  export interface DeptTree {
    id: number;
    pid: number;
    name: string;
    children: DeptTree[];
  }
}
