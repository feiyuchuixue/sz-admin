import type { IPageQuery } from '@/api/types';

export type ConfigQuery = IPageQuery & {
  configName?: string;
  configKey?: string;
};

export type ConfigForm = {
  id?: number;
  configName: string;
  configKey: string;
  configValue: string;
  remark: string;
};

export type ConfigInfo = {
  id: number;
  configName: string;
  configKey: string;
  configValue: string;
  remark: string;
  createId: number;
  createTime: string;
  updateId: number;
  updateTime: string;
  isLock?: string;
};
