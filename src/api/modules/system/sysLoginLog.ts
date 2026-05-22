import { adminHttp } from '@/api/client';
import type { IPage } from '@/api/types';
import type { SysLoginLogQuery, SysLoginLogRow } from '@/api/types/system/sysLoginLog';

/**
 * 鏌ヨ鍒楄〃
 * @param params
 * @returns {*}
 */
export const getSysLoginLogListApi = (params: SysLoginLogQuery) => {
  return adminHttp.get<IPage<SysLoginLogRow>>(`/sys-login-log`, params);
};

/**
 * 瀵煎嚭excel
 * @param params
 * @returns {*}
 */
export const exportSysLoginLogExcelApi = (params: SysLoginLogQuery) => {
  return adminHttp.download(`/sys-login-log/export`, params);
};
