import type { IPageQuery } from '@/api/types';

export type OperationLogTab = 'audit' | 'performance' | 'exception';

export type SysOperationLogSummary = {
  totalCount?: number;
  failCount?: number;
  slowCount?: number;
  exceptionCount?: number;
  successRate?: number;
};

export type SysOperationLogQuery = IPageQuery & {
  traceId?: string;
  userId?: number | string;
  userName?: string;
  moduleName?: string;
  operationName?: string;
  operationType?: string;
  status?: string;
  requestMethod?: string;
  requestUri?: string;
  businessId?: string;
  minCostMs?: number;
  slowFlag?: string;
  operationTime?: string[];
  operationTimeStart?: string;
  operationTimeEnd?: string;
};

export type SysOperationLogDetail = {
  id?: number | string;
  operationLogId?: number | string;
  eventId?: string;
  traceId?: string;
  detailType?: string;
  requestParams?: string;
  responseBody?: string;
  exceptionStack?: string;
  createTime?: string;
};

export type SysOperationLogRow = {
  id?: number | string;
  eventId?: string;
  traceId?: string;
  userId?: number | string;
  userName?: string;
  moduleName?: string;
  operationName?: string;
  operationType?: string;
  permissionCode?: string;
  requestMethod?: string;
  requestUri?: string;
  businessId?: string;
  ipAddress?: string;
  operationTime?: string;
  costMs?: number;
  slowFlag?: string;
  status?: string;
  responseCode?: string;
  responseMessage?: string;
  errorType?: string;
  errorMessage?: string;
  details?: SysOperationLogDetail[];
};
