import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { IPage } from '@/api/types';
import type { SysLoginLogQuery, SysLoginLogRow, SysLoginLogForm } from '@/api/types/system/sysLoginLog';

/**
 * 查询列表
 * @param params
 * @returns {*}
 */
export const getSysLoginLogListApi = (params: SysLoginLogQuery) => {
  return http.get<IPage<SysLoginLogRow>>(ADMIN_MODULE + `/sys-login-log`, params);
};

/**
 * 添加
 * @param params
 * @returns {*}
 */
export const createSysLoginLogApi = (params: SysLoginLogForm) => {
  return http.post(ADMIN_MODULE + `/sys-login-log`, params);
};

/**
 * 修改
 * @param params
 * @returns {*}
 */
export const updateSysLoginLogApi = (params: SysLoginLogForm) => {
  return http.put(ADMIN_MODULE + `/sys-login-log`, params);
};

/**
 * 删除
 * @param params
 * @returns {*}
 */
export const removeSysLoginLogApi = (params: { ids: (string | number)[] }) => {
  return http.delete(ADMIN_MODULE + `/sys-login-log`, params);
};

/**
 * 获取详情
 * @param params
 * @returns {*}
 */
export const getSysLoginLogDetailApi = (params: { id: number }) => {
  const { id } = params;
  return http.get<SysLoginLogRow>(ADMIN_MODULE + `/sys-login-log/${id}`);
};

/**
 * 导出excel
 * @param params
 * @returns {*}
 */
export const exportSysLoginLogExcelApi = (params: SysLoginLogQuery) => {
  return http.download(ADMIN_MODULE + `/sys-login-log/export`, params);
};
