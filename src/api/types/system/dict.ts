import type { IPageQuery } from '@/api/types';

// 获取所有字典信息
export type DictCustom = {
  callbackShowStyle: string;
  codeName: string;
  id: string;
  isLock: string;
  isShow: string;
  sort: number;
  sysDictTypeId: number;
  alias?: string;
};

// 字典类别列表查询
export type DictTypeQuery = IPageQuery & {
  typeName: string;
  typeCode: string;
};

// 字典类别列表
export type DictType = {
  id?: number;
  typeName: string;
  typeCode: string;
  isLock?: string;
  isShow?: string;
  delFlag?: string;
  remark: string;
  createTime?: string;
  updateTime?: string;
  isDynamic: boolean;
};

// 字典分类option
export type DictOption = {
  value: string;
  label: string;
};

// 字典分类类型
export type DictCategory = {
  label: string;
  options: DictOption[];
};

// 字典列表查询
export type DictQuery = IPageQuery & {
  sysDictTypeId: number;
  codeName: string;
};

export type Dict = {
  id?: number;
  sysDictTypeId?: number;
  codeName: string;
  alias?: string;
  sort?: number;
  callbackShowStyle: string;
  remark: string;
  isLock?: string;
  isShow?: string;
  delFlag?: string;
  createTime?: string;
  updateTime?: string;
};
