import type { IPageQuery } from '@/api/types';

// 查询条件
export type SysResourceQuery = IPageQuery & {
  originName?: string;
  sceneCode?: string;
};

// 列表返回结构
export type SysResourceRow = {
  id?: string;
  sceneCode?: string;
  objectKey?: string;
  sceneName?: string;
  serveMode?: 'DIRECT' | 'PRESIGNED' | 'PROTECTED' | '' | null;
  originName?: string;
  size?: number;
  contentType?: string;
  storageType?: string;
  eTag?: string;
  bizKey?: string;
  accessUrl?: string | null;
  createId?: string;
  createTime?: string;
};
