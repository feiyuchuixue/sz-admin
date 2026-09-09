import { adminHttp } from '@/api/client';
import type { IPage } from '@/api/types';
import type { SysResourceQuery, SysResourceRow } from '@/api/types/system/resource';

/**
 * 资源分页查询
 */
export const getSysResourcePageApi = (params: SysResourceQuery) => {
  return adminHttp.get<IPage<SysResourceRow>>(`/resource`, params);
};

// 用途选项：场景编码 -> 显示名称
export const getSysResourceScenesApi = () => {
  return adminHttp.get<Record<string, string>>('/resource/scenes');
};
