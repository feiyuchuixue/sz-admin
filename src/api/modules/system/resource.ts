import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { IPage } from '@/api/types';
import type { SysResourceQuery, SysResourceRow } from '@/api/types/system/resource';

/**
 * 资源分页查询
 */
export const getSysResourcePageApi = (params: SysResourceQuery) => {
  return http.get<IPage<SysResourceRow>>(ADMIN_MODULE + `/resource`, params);
};
