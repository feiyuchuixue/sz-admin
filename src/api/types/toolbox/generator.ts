import type { IPageQuery } from '@/api/types';

export type GeneratorQuery = IPageQuery & {
  tableName?: string;
  tableComment?: string;
};

export type GeneratorInfo = {
  tableId: number;
  tableName: string;
  tableComment: string;
  className: string;
  camelClassName: string;
  tplCategory: string;
  packageName: string;
  moduleName: string;
  businessName: string;
  functionName: string;
  functionAuthor: string;
  type: string;
  options: string;
  path: string;
  createId: number;
  createTime: string;
  updateId: number;
  updateTime: string;
};

export type GeneratorForm = {
  baseInfo: GeneratorBaseInfo;
  columns: GeneratorColumnInfo[];
  generatorInfo: GeneratorGeneratorInfo;
};

export type GeneratorBaseInfo = {
  tableId?: number;
  tableName: string;
  tableComment: string;
  className: string;
  functionAuthor: string;
  remark: string;
};

export type GeneratorColumnInfo = {
  autofillType: string;
  columnComment: string;
  columnId: number;
  columnName: string;
  columnType: string;
  dictType: string;
  htmlType: string;
  isAutofill: string;
  isEdit: string;
  isIncrement: string;
  isInsert: string;
  isList: string;
  isLogicDel: string;
  isPk: string;
  isQuery: string;
  isRequired: string;
  isUniqueValid: string;
  javaField: string;
  javaType: string;
  javaTypePackage: string;
  options: string;
  queryType: string;
  specialPackages: string;
  tableId: number;
  upCamelField: string;
};

export type GeneratorGeneratorInfo = {
  tplCategory?: string;
  packageName: string;
  moduleName: string;
  businessName: string;
  functionName: string;
  options: string;
  type: string;
  parentMenuId: string;
  hasImport: string;
  hasExport: string;
  pathApi: string;
  pathWeb: string;
  generateType: string;
  menuInitType: string;
  btnPermissionType: string;
  isAutofill: string;
  btnDataScopeType: string;
};

export type GeneratorPreviewInfo = {
  name: string;
  code: string;
  language: string;
  alias: string;
};

export type GeneratorCheckInfo = {
  checkedApiPath: boolean;
  checkedWebPath: boolean;
  pathApi: string;
  pathWeb: string;
};
