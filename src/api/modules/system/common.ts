import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { CommonTemplateDown } from '@/api/types/system/common';
import type { SelectorQuery, SelectorResult } from '@/components/MemberSelector/type/selector';

/**
 * 模版下载
 */
export const downloadTemplate = (params: CommonTemplateDown) => {
  return http.template(ADMIN_MODULE + `/common/download/templates`, params);
};

/**
 * 多维选择器查询
 * @param params
 */
export const querySelector = (params: SelectorQuery) => {
  return http.get<SelectorResult>(ADMIN_MODULE + `/common/selector`, params);
};
