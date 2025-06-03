import type { IPageQuery } from '@/api/types';

// 查询条件
export type TeacherStatisticsQuery = IPageQuery & {
  year?: string;
  month?: string;
  duringTime?: string;
  teacherId?: string;
  teacherCommonType?: number;
  totalTeaching?: number;
  totalClassCount?: number;
  totalHours?: number;
  checkStatus?: number;
  checkTimeStart?: string;
  checkTimeEnd?: string;
  lastSyncTimeStart?: string;
  lastSyncTimeEnd?: string;
};

// 编辑form表单
export type TeacherStatisticsForm = {
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
};

// list或detail返回结构
export type TeacherStatisticsRow = {
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
  createId?: number;
  createTime?: string;
  updateId?: number;
  updateTime?: string;
};
