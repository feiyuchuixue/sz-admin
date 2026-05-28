import { auditHttp } from '@/api/client';
import type { IPage } from '@/api/types';
import type { SysOperationLogQuery, SysOperationLogRow, SysOperationLogSummary } from '@/modules/audit/types/sysOperationLog';

export const getSysOperationLogListApi = (params: SysOperationLogQuery) => {
  return auditHttp.get<IPage<SysOperationLogRow>>('/sys-operation-log', params);
};

export const getSysOperationLogSummaryApi = (params: SysOperationLogQuery) => {
  return auditHttp.get<SysOperationLogSummary>('/sys-operation-log/summary', params);
};

export const getSysOperationLogDetailApi = (id: number | string) => {
  return auditHttp.get<SysOperationLogRow>(`/sys-operation-log/${id}`);
};
