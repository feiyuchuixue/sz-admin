import type { IPageQuery } from '@/api/types';

// 查询条件
export type SysTempFileQuery = IPageQuery & {
  tempName?: string;
};

// 历史记录查询条件
export type SysTempFileHistoryQuery = IPageQuery & {
  sysTempFileId: number;
};

// 编辑form表单
export type SysTempFileForm = {
  id?: number;
  sysFileId?: number;
  tempName?: string;
  url?: string;
  remark?: string;
  alias?: string;
};

// list或detail返回结构
export type SysTempFileRow = {
  id?: number;
  sysFileId?: number;
  tempName?: string;
  url?: string;
  remark?: string;
  delFlag?: string;
  createId?: number;
  createTime?: string;
  updateId?: number;
  updateTime?: string;
  alias?: string;
};

// 历史记录
export type SysTempFileHistory = {
  id?: number;
  sysTempFileId?: number;
  sysFileId?: number;
  tempName?: string;
  url?: string;
  remark?: string;
  delFlag?: string;
  createId?: number;
  createTime?: string;
};
