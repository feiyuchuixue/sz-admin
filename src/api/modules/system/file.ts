import { adminHttp } from '@/api/client';
import type { IPage } from '@/api/types';
import type { SysFileQuery, SysFileRow } from '@/api/types/system/file';

/**
 * 鏌ヨ鍒楄〃
 * @param params
 * @returns {*}
 */
export const getSysFileListApi = (params: SysFileQuery) => {
  return adminHttp.get<IPage<SysFileRow>>(`/sys-file`, params);
};
