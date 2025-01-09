import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { IPage } from '@/api/interface';
import type { ITeacherStatistics } from '@/api/interface/teacher/teacherStatistics';
import type { UploadRawFile } from 'element-plus/es/components/upload/src/upload';
import type { AxiosRequestConfig } from 'axios';
/**
 * 查询列表
 * @param params
 * @returns {*}
 */
export const getTeacherStatisticsListApi = (params: ITeacherStatistics.Query) => {
  return http.get<IPage<ITeacherStatistics.Row>>(ADMIN_MODULE + `/teacher-statistics`, params);
};

/**
 * 添加
 * @param params
 * @returns {*}
 */
export const createTeacherStatisticsApi = (params: ITeacherStatistics.Form) => {
  return http.post(ADMIN_MODULE + `/teacher-statistics`, params);
};

/**
 * 修改
 * @param params
 * @returns {*}
 */
export const updateTeacherStatisticsApi = (params: ITeacherStatistics.Form) => {
  return http.put(ADMIN_MODULE + `/teacher-statistics`, params);
};

/**
 * 删除
 * @param params
 * @returns {*}
 */
export const removeTeacherStatisticsApi = (params: { ids: (string | number)[] }) => {
  return http.delete(ADMIN_MODULE + `/teacher-statistics`, params);
};

/**
 * 获取详情
 * @param params
 * @returns {*}
 */
export const getTeacherStatisticsDetailApi = (params: { id: number }) => {
  const { id } = params;
  return http.get<ITeacherStatistics.Row>(ADMIN_MODULE + `/teacher-statistics/${id}`);
};

/**
 * 导入excel
 * @param params
 */
export const importTeacherStatisticsExcelApi = (params: UploadRawFile, config?: AxiosRequestConfig<{}> | undefined) => {
  return http.upload(ADMIN_MODULE + `/teacher-statistics/import`, params, config);
};

/**
 * 导出excel
 * @param params
 * @returns {*}
 */
export const exportTeacherStatisticsExcelApi = (params: ITeacherStatistics.Query) => {
  return http.download(ADMIN_MODULE + `/teacher-statistics/export`, params);
};

/**
 * 远程搜索
 * @param params
 */
export const remoteTeacherStaticsSearchApi = (params: { keyword: string }) => {
  const { keyword } = params;
  return http.get<string[]>(ADMIN_MODULE + `/teacher-statistics/remote/${keyword}`);
};
