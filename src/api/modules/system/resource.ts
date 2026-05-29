import { adminHttp } from '@/api/client';
import type { IPage } from '@/api/types';
import type { SysResourceQuery, SysResourceRow } from '@/api/types/system/resource';

/**
 * 璧勬簮鍒嗛〉鏌ヨ
 */
export const getSysResourcePageApi = (params: SysResourceQuery) => {
  return adminHttp.get<IPage<SysResourceRow>>(`/resource`, params);
};
