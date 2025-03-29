import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { IPage } from '@/api/types';
import type { SysFileQuery, SysFileRow } from '@/api/types/system/file';

/**
 * 查询列表
 * @param params
 * @returns {*}
 */
export const getSysFileListApi = (params: SysFileQuery) => {
  return http.get<IPage<SysFileRow>>(ADMIN_MODULE + `/sys-file`, params);
};
