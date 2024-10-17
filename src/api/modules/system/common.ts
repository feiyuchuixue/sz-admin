import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { ICommon } from '@/api/interface/system/common';

/**
 * 模版下载
 */
export const downloadTemplate = (params: ICommon.templateDown) => {
  return http.template(ADMIN_MODULE + `/common/download/templates`, params);
};
