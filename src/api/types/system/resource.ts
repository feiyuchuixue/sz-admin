import type { IPageQuery } from '@/api/types';

// 查询条件
export type SysResourceQuery = IPageQuery & {
  originName?: string;
  sceneCode?: string;
};

// 列表返回结构
export type SysResourceRow = {
  id?: number;
  sceneCode?: string;
  objectKey?: string;
  originName?: string;
  size?: number;
  contentType?: string;
  storageType?: string;
  eTag?: string;
  bizKey?: string;
  accessUrl?: string;
  createId?: number;
  createTime?: string;
};
