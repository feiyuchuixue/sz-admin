import { adminHttp } from '@/api/client';
import type { DictTypeQuery, DictType, DictQuery, Dict, DictCustom, DictSourceQuery, DictSource } from '@/api/types/system/dict';
import type { IPage } from '@/api/types';
import type { ScriptExportResult } from '@/api/types/script';

/**
 * 瀛楀吀绫诲埆鍒楄〃
 * @param params
 * @returns {*}
 */
export const getDictType = (params: DictTypeQuery) => {
  return adminHttp.get<IPage<DictType>>(`/sys-dict-type`, params);
};

/**
 * 娣诲姞瀛楀吀绫诲埆
 * @param params
 * @returns {*}
 */
export const addDictType = (params: DictType) => {
  return adminHttp.post(`/sys-dict-type`, params);
};

/**
 * 淇敼瀛楀吀绫诲瀷
 * @param params
 * @returns {*}
 */
export const editDictType = (params: DictType) => {
  return adminHttp.put(`/sys-dict-type`, params);
};

/**
 * 鍒犻櫎瀛楀吀绫诲瀷
 * @param params
 * @returns {*}
 */
export const deleteDictType = (params: { ids: number[] }) => {
  return adminHttp.delete(`/sys-dict-type`, params);
};

/**
 * 鑾峰彇瀛楀吀鏁版嵁鍒楄〃
 * @param params
 * @returns {*}
 */
export const getDictData = (params: DictQuery) => {
  return adminHttp.get<IPage<Dict>>(`/sys-dict`, params);
};

/**
 * 娣诲姞瀛楀吀绫诲埆
 * @param params
 * @returns {*}
 */
export const addDictData = (params: Dict) => {
  return adminHttp.post(`/sys-dict`, params);
};

/**
 * 淇敼瀛楀吀绫诲瀷
 * @param params
 * @returns {*}
 */
export const editDictData = (params: Dict) => {
  return adminHttp.put(`/sys-dict`, params);
};

/**
 * 鍒犻櫎瀛楀吀
 * @param params
 * @returns {*}
 */
export const deleteDictData = (params: { ids: number[] }) => {
  return adminHttp.delete(`/sys-dict`, params);
};

/**
 * 鑾峰彇鎵€鏈夊瓧鍏镐俊鎭? * @returns {*}
 */
export const getAllDict = () => {
  return adminHttp.get<Record<string, DictCustom[]>>(`/sys-dict/dict`, {});
};

export const getStaticDict = () => {
  return adminHttp.get<Record<string, DictCustom[]>>(`/sys-dict/static`, {});
};

export const getDictTypeOptions = () => {
  return adminHttp.get<DictType[]>(`/sys-dict-type/selectOptionsType`);
};

export const getDictSourceList = (params: DictSourceQuery) => {
  return adminHttp.get<IPage<DictSource>>(`/sys-dict-source`, params);
};

export const addDictSource = (params: DictSource) => {
  return adminHttp.post(`/sys-dict-source`, params);
};

export const editDictSource = (params: DictSource) => {
  return adminHttp.put(`/sys-dict-source`, params);
};

export const deleteDictSource = (params: { ids: number[] }) => {
  return adminHttp.delete(`/sys-dict-source`, params);
};

/**
 * 瀵煎嚭瀛楀吀sql
 * @param params
 */
export const exportDictSql = (params: { ids: number[] }) => {
  return adminHttp.post<string>(`/sys-dict/sql/export`, params);
};

export const exportDictScript = (params: { ids: number[]; sqlDialect?: string }) => {
  return adminHttp.post<ScriptExportResult>('/sys-dict/script/export', params);
};

/**
 * 鑾峰彇鎸囧畾瀛楀吀
 * @param params
 * @returns {*}
 */
export const getDictByCode = (params: { typeCode: string[] }) => {
  const searchParams = new URLSearchParams();
  params.typeCode.forEach(code => searchParams.append('typeCode', code));
  return adminHttp.get<Record<string, DictCustom[]>>(`/sys-dict/code?${searchParams.toString()}`);
};
