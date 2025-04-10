import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { IPage } from '@/api/types';
import type {
  SysTempFileQuery,
  SysTempFileRow,
  SysTempFileForm,
  SysTempFileHistoryQuery,
  SysTempFileHistory
} from '@/api/types/system/sysTempFile';

/**
 * 查询列表
 * @param params
 * @returns {*}
 */
export const getSysTempFileListApi = (params: SysTempFileQuery) => {
  return http.get<IPage<SysTempFileRow>>(ADMIN_MODULE + `/sys-temp-file`, params);
};

/**
 * 添加
 * @param params
 * @returns {*}
 */
export const createSysTempFileApi = (params: SysTempFileForm) => {
  return http.post(ADMIN_MODULE + `/sys-temp-file`, params);
};

/**
 * 修改
 * @param params
 * @returns {*}
 */
export const updateSysTempFileApi = (params: SysTempFileForm) => {
  return http.put(ADMIN_MODULE + `/sys-temp-file`, params);
};

/**
 * 删除
 * @param params
 * @returns {*}
 */
export const removeSysTempFileApi = (params: { ids: (string | number)[] }) => {
  return http.delete(ADMIN_MODULE + `/sys-temp-file`, params);
};

/**
 * 获取详情
 * @param params
 * @returns {*}
 */
export const getSysTempFileDetailApi = (params: { id: number }) => {
  const { id } = params;
  return http.get<SysTempFileRow>(ADMIN_MODULE + `/sys-temp-file/${id}`);
};

/**
 * 获取历史记录
 * @param params
 */
export const getSysTempFileHistoryListApi = (params: SysTempFileHistoryQuery) => {
  return http.get<IPage<SysTempFileHistory>>(ADMIN_MODULE + `/sys-temp-file-history/history`, params);
};
