import { adminHttp } from '@/api/client';
import type { IPage } from '@/api/types';
import type { TeacherStatisticsQuery, TeacherStatisticsRow, TeacherStatisticsForm } from '@/api/types/teacher/teacherStatistics';
import type { UploadRawFile } from 'element-plus/es/components/upload/src/upload';
import type { AxiosRequestConfig } from 'axios';
/**
 * 鏌ヨ鍒楄〃
 * @param params
 * @returns {*}
 */
export const getTeacherStatisticsListApi = (params: TeacherStatisticsQuery) => {
  return adminHttp.get<IPage<TeacherStatisticsRow>>(`/teacher-statistics`, params);
};

/**
 * 娣诲姞
 * @param params
 * @returns {*}
 */
export const createTeacherStatisticsApi = (params: TeacherStatisticsForm) => {
  return adminHttp.post(`/teacher-statistics`, params);
};

/**
 * 淇敼
 * @param params
 * @returns {*}
 */
export const updateTeacherStatisticsApi = (params: TeacherStatisticsForm) => {
  return adminHttp.put(`/teacher-statistics`, params);
};

/**
 * 鍒犻櫎
 * @param params
 * @returns {*}
 */
export const removeTeacherStatisticsApi = (params: { ids: (string | number)[] }) => {
  return adminHttp.delete(`/teacher-statistics`, params);
};

/**
 * 鑾峰彇璇︽儏
 * @param params
 * @returns {*}
 */
export const getTeacherStatisticsDetailApi = (params: { id: number }) => {
  const { id } = params;
  return adminHttp.get<TeacherStatisticsRow>(`/teacher-statistics/${id}`);
};

/**
 * 瀵煎叆excel
 * @param params
 */
export const importTeacherStatisticsExcelApi = (params: UploadRawFile, config?: AxiosRequestConfig<any> | undefined) => {
  return adminHttp.upload(`/teacher-statistics/import`, params, config);
};

/**
 * 瀵煎嚭excel
 * @param params
 * @returns {*}
 */
export const exportTeacherStatisticsExcelApi = (params: TeacherStatisticsQuery) => {
  return adminHttp.download(`/teacher-statistics/export`, params);
};

/**
 * 杩滅▼鎼滅储
 * @param params
 */
export const remoteTeacherStaticsSearchApi = (params: { keyword: string }) => {
  const { keyword } = params;
  return adminHttp.get<string[]>(`/teacher-statistics/remote/${keyword}`);
};
