import type { IPageQuery } from '@/api/interface';

export namespace ITeacherStatistics {
  // 查询条件
  export interface Query extends IPageQuery {
    year?: string;
    month?: string;
    duringTime?: string;
    teacherId?: string;
    teacherCommonType?: number;
    totalTeaching?: number;
    totalClassCount?: number;
    totalHours?: number;
    checkStatus?: number;
    checkTime?: string;
    lastSyncTime?: string;
  }

  // 编辑form表单
  export interface Form {
    id?: number;
    year?: string;
    month?: string;
    duringTime?: string;
    teacherId?: string;
    teacherCommonType?: number;
    totalTeaching?: number;
    totalClassCount?: number;
    totalHours?: number;
    checkStatus?: number;
    checkTime?: string;
    lastSyncTime?: string;
    remark?: string;
  }

  // list或detail返回结构
  export interface Row {
    id?: number;
    year?: string;
    month?: string;
    duringTime?: string;
    teacherId?: string;
    teacherCommonType?: number;
    totalTeaching?: number;
    totalClassCount?: number;
    totalHours?: number;
    checkStatus?: number;
    checkTime?: string;
    lastSyncTime?: string;
    remark?: string;
  }
}
