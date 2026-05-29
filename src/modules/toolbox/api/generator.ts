import { generatorHttp } from '@/api/client';
import type { IPage, IPageQuery } from '@/api/types';
import type {
  GeneratorCheckInfo,
  GeneratorForm,
  GeneratorInfo,
  GeneratorPreviewInfo,
  GeneratorQuery
} from '@/modules/toolbox/types/generator';

/**
 * 查询已经导入的表列表
 * @param params
 * @returns {*}
 */
export const getGeneratorList = (params: GeneratorQuery) => {
  return generatorHttp.get<IPage<GeneratorInfo>>('/list', params);
};

/**
 * 查询要导入的表列表（排除已经导入的表）
 * @param params
 */
export const getGeneratorSchemaList = (params: IPageQuery) => {
  return generatorHttp.get<IPage<GeneratorInfo>>('/schema/list', params);
};

/**
 * 导入指定表
 * @param params
 */
export const importGenerator = (params: { tableName: (string | number)[] }) => {
  return generatorHttp.post('/import', params);
};

/**
 * 更新代码生成配置
 * @param params
 */
export const saveGenerator = (params: GeneratorForm) => {
  return generatorHttp.put('', params);
};

/**
 * 代码生成参数详情
 * @param tableName
 */
export const getGeneratorInfo = (tableName: string) => {
  return generatorHttp.get<GeneratorForm>(`/${tableName}`);
};

/**
 * 代码生成
 * @param params
 */
export const codeGenerator = (tableName: string) => {
  return generatorHttp.post<string[]>(`/generator/${tableName}`);
};

/**
 * 删除导入的表
 * @param params
 */
export const deleteGenerator = (params: { tableNames: (string | number)[] }) => {
  return generatorHttp.delete('', params);
};

/**
 * zip下载
 * @param params
 * @returns {*}
 */
export const downloadZip = (params: { tableNames: string[] }) => {
  return generatorHttp.download('/zip', params);
};

/**
 * 代码预览
 * @param tableName
 */
export const previewCode = (tableName: string) => {
  return generatorHttp.get<GeneratorPreviewInfo[]>(`/preview/${tableName}`);
};
/**
 * 验证磁盘
 * @param tableName
 */
export const checkDisk = (tableName: string) => {
  return generatorHttp.get<GeneratorCheckInfo>(`/check/${tableName}`);
};
