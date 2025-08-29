import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { IPage } from '@/api/types';
import type { SysLoginLogQuery, SysLoginLogRow } from '@/api/types/system/sysLoginLog';

/**
 * 查询列表
 * @param params
 * @returns {*}
 */
export const getSysLoginLogListApi = (params: SysLoginLogQuery) => {
  return http.get<IPage<SysLoginLogRow>>(ADMIN_MODULE + `/sys-login-log`, params);
};

/**
 * 导出excel
 * @param params
 * @returns {*}
 */
export const exportSysLoginLogExcelApi = (params: SysLoginLogQuery) => {
  return http.download(ADMIN_MODULE + `/sys-login-log/export`, params);
};
