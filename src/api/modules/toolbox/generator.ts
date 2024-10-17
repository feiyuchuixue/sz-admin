import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { IPage, IPageQuery } from '@/api/interface';
import type { IGenerator } from '@/api/interface/toolbox/generator';

/**
 * 查询已经导入的表列表
 * @param params
 * @returns {*}
 */
export const getGeneratorList = (params: IGenerator.Query) => {
  return http.get<IPage<IGenerator.Info>>(ADMIN_MODULE + `/generator/list`, params);
};

/**
 * 查询要导入的表列表（排除已经导入的表）
 * @param params
 */
export const getGeneratorSchemaList = (params: IPageQuery) => {
  return http.get<IPage<IGenerator.Info>>(ADMIN_MODULE + `/generator/schema/list`, params);
};

/**
 * 导入指定表
 * @param params
 */
export const importGenerator = (params: { tableName: (string | number)[] }) => {
  return http.post(ADMIN_MODULE + `/generator/import`, params);
};

/**
 * 更新代码生成配置
 * @param params
 */
export const saveGenerator = (params: IGenerator.Form) => {
  return http.put(ADMIN_MODULE + `/generator`, params);
};

/**
 * 代码生成参数详情
 * @param tableName
 */
export const getGeneratorInfo = (tableName: string) => {
  return http.get<IGenerator.Form>(ADMIN_MODULE + `/generator/${tableName}`);
};

/**
 * 代码生成
 * @param params
 */
export const codeGenerator = (tableName: string) => {
  return http.post<string[]>(ADMIN_MODULE + `/generator/generator/${tableName}`);
};

/**
 * 删除导入的表
 * @param params
 */
export const deleteGenerator = (params: { tableNames: (string | number)[] }) => {
  return http.delete(ADMIN_MODULE + `/generator`, params);
};

/**
 * zip下载
 * @param params
 * @returns {*}
 */
export const downloadZip = (params: { tableNames: string[] }) => {
  return http.download(ADMIN_MODULE + `/generator/zip`, params);
};

/**
 * 代码预览
 * @param tableName
 */
export const previewCode = (tableName: string) => {
  return http.get<IGenerator.PreviewInfo[]>(ADMIN_MODULE + `/generator/preview/${tableName}`);
};
/**
 * 验证磁盘
 * @param tableName
 */
export const checkDisk = (tableName: string) => {
  return http.get<IGenerator.CheckInfo>(ADMIN_MODULE + `/generator/check/${tableName}`);
};
