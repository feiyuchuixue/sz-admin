import { adminHttp } from '@/api/client';
import type { IPage } from '@/api/types';
import type {
  SysTempFileQuery,
  SysTempFileRow,
  SysTempFileForm,
  SysTempFileHistoryQuery,
  SysTempFileHistory
} from '@/api/types/system/sysTempFile';

/**
 * 鏌ヨ鍒楄〃
 * @param params
 * @returns {*}
 */
export const getSysTempFileListApi = (params: SysTempFileQuery) => {
  return adminHttp.get<IPage<SysTempFileRow>>(`/sys-temp-file`, params);
};

/**
 * 娣诲姞
 * @param params
 * @returns {*}
 */
export const createSysTempFileApi = (params: SysTempFileForm) => {
  return adminHttp.post(`/sys-temp-file`, params);
};

/**
 * 淇敼
 * @param params
 * @returns {*}
 */
export const updateSysTempFileApi = (params: SysTempFileForm) => {
  return adminHttp.put(`/sys-temp-file`, params);
};

/**
 * 鍒犻櫎
 * @param params
 * @returns {*}
 */
export const removeSysTempFileApi = (params: { ids: (string | number)[] }) => {
  return adminHttp.delete(`/sys-temp-file`, params);
};

/**
 * 鑾峰彇璇︽儏
 * @param params
 * @returns {*}
 */
export const getSysTempFileDetailApi = (params: { id: number }) => {
  const { id } = params;
  return adminHttp.get<SysTempFileRow>(`/sys-temp-file/${id}`);
};

/**
 * 鑾峰彇鍘嗗彶璁板綍
 * @param params
 */
export const getSysTempFileHistoryListApi = (params: SysTempFileHistoryQuery) => {
  return adminHttp.get<IPage<SysTempFileHistory>>(`/sys-temp-file-history/history`, params);
};
