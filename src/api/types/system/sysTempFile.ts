import type { IPageQuery } from '@/api/types';
import type { ResourceRef } from '@/api/types/system/upload';

// 查询条件
export type SysTempFileQuery = IPageQuery & {
  tempName?: string;
};

// 历史记录查询条件
export type SysTempFileHistoryQuery = IPageQuery & {
  sysTempFileId: string;
};

// 编辑form表单
export type SysTempFileForm = {
  id?: string;
  sysFileId?: string;
  tempName?: string;
  url?: ResourceRef[];
  remark?: string;
  alias?: string;
};

// list或detail返回结构
export type SysTempFileRow = {
  id?: string;
  sysFileId?: string;
  tempName?: string;
  url?: ResourceRef[];
  remark?: string;
  delFlag?: string;
  createId?: string;
  createTime?: string;
  updateId?: string;
  updateTime?: string;
  alias?: string;
};

// 历史记录
export type SysTempFileHistory = {
  id?: string;
  sysTempFileId?: string;
  sysFileId?: string;
  tempName?: string;
  url?: ResourceRef[];
  remark?: string;
  delFlag?: string;
  createId?: string;
  createTime?: string;
};
