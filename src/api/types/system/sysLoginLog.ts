import type { IPageQuery } from '@/api/types';

// 查询条件
export type SysLoginLogQuery = IPageQuery & {
  userName?: string;
  loginStatus?: string;
  loginTimeStart?: string;
  loginTimeEnd?: string;
};

// 编辑form表单
export type SysLoginLogForm = {
  id?: number;
  userName?: string;
  loginStatus?: string;
  loginTime?: string;
  ipAddress?: string;
  loginLocation?: string;
  browser?: string;
  os?: string;
  msg?: string;
  remark?: string;
};

// list或detail返回结构
export type SysLoginLogRow = {
  id?: number;
  userName?: string;
  loginStatus?: string;
  loginTime?: string;
  ipAddress?: string;
  loginLocation?: string;
  browser?: string;
  os?: string;
  msg?: string;
  remark?: string;
};
