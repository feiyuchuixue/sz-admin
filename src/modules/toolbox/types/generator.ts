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
  backendTargetType?: string;
  backendModuleName?: string;
  apiPrefixModule?: string;
  apiPrefix?: string;
  frontendLayout?: string;
  frontendModuleName?: string;
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
  dictShowWay: string;
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
  searchType: string;
  specialPackages: string;
  tableId: number;
  upCamelField: string;
};

export type GeneratorGeneratorInfo = {
  tplCategory?: string;
  packageName: string;
  moduleName: string;
  backendTargetType: string;
  backendModuleName: string;
  apiPrefixModule: string;
  apiPrefix: string;
  frontendLayout: string;
  frontendModuleName: string;
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
  windowShowType: string;
};

export type GeneratorPreviewInfo = {
  name: string;
  code: string;
  content?: string;
  diff?: string;
  relativePath?: string;
  fullPath?: string;
  projectName?: string;
  operationType?: 'CREATE_FILE' | 'MODIFY_FILE' | 'SKIP_EXISTS' | 'SCRIPT';
  message?: string;
  language: string;
  alias: string;
};

export type GeneratorCheckInfo = {
  checkedApiPath: boolean;
  checkedWebPath: boolean;
  checkedBackendModule: boolean;
  checkedDataScope: boolean;
  pathApi: string;
  pathWeb: string;
  errors: string[];
  warnings: string[];
};

export type GeneratorPathOption = {
  label: string;
  path: string;
};

export type GeneratorBackendModuleOption = {
  moduleName: string;
  moduleCode: string;
  path: string;
  packageName: string;
  apiPrefixModule: string;
  apiPrefix: string;
  status: 'ready' | 'pending' | 'unavailable';
  recommended: boolean;
  missingItems: string[];
};

export type GeneratorPathOptions = {
  defaultApiPath: string;
  defaultWebPath: string;
  apiOptions: GeneratorPathOption[];
  webOptions: GeneratorPathOption[];
  backendModuleOptions: GeneratorBackendModuleOption[];
};
