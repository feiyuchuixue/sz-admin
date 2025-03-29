import type { IPageQuery } from '@/api/types';

// 查询条件
export type SysClientQuery = IPageQuery & {
  clientKey?: string;
  clientSecret?: string;
  grantTypeCd?: string;
  deviceTypeCd?: string;
  activeTimeout?: number;
  version?: number;
};

// 编辑form表单
export type SysClientForm = {
  clientKey?: string;
  clientSecret?: string;
  grantTypeCdList?: string[];
  grantTypeCd?: string;
  deviceTypeCd?: string;
  activeTimeout?: number;
  timeout?: number;
  clientStatusCd?: string;
  version?: number;
  remark?: string;
};

// list或detail返回结构
export type SysClientRow = {
  clientId?: string;
  clientKey?: string;
  clientSecret?: string;
  grantTypeCd?: string;
  grantTypeCdList?: string[];
  deviceTypeCd?: string;
  activeTimeout?: number;
  timeout?: number;
  clientStatusCd?: string;
  version?: number;
  remark?: string;
  isLock?: string;
};
