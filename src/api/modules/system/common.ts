import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { CommonTemplateDown, OssTransform } from '@/api/types/system/common';
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

/**
 * 获取私有访问地址
 * @param params
 */
export const getPrivateUrl = (params: OssTransform) => {
  return http.get<string>(ADMIN_MODULE + `/common/oss/objects/private-url`, params);
};

/**
 * 文件下载
 * @param params
 */
export const fileDownload = (params: { url: string }) => {
  return http.downloadWithHeader(ADMIN_MODULE + `/common/files/download`, params);
};
