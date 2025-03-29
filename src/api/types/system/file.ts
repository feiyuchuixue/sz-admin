import type { IPageQuery } from '@/api/types';

// 查询条件
export type SysFileQuery = IPageQuery & {
  filename?: string;
  dirTag?: string;
  objectName?: string;
};

// 编辑form表单
export type SysFileForm = {};

// list或detail返回结构
export type SysFileRow = {
  id?: number;
  filename?: string;
  dirTag?: string;
  size?: number;
  url?: string;
  objectName?: string;
  contextType?: string;
  eTag?: string;
  fileId?: number;
};
