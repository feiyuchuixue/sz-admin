import { adminHttp } from '@/api/client';
import type { CommonTemplateDown, OssTransform } from '@/api/types/system/common';
import type { SelectorQuery, SelectorResult } from '@/components/MemberSelector/type/selector';

/**
 * 妯＄増涓嬭浇
 */
export const downloadTemplate = (params: CommonTemplateDown) => {
  return adminHttp.template(`/common/download/templates`, params);
};

/**
 * 澶氱淮閫夋嫨鍣ㄦ煡璇? * @param params
 */
export const querySelector = (params: SelectorQuery) => {
  return adminHttp.get<SelectorResult>(`/common/selector`, params);
};

/**
 * 鑾峰彇绉佹湁璁块棶鍦板潃
 * @param params
 */
export const getPrivateUrl = (params: OssTransform) => {
  return adminHttp.get<string>(`/common/oss/objects/private-url`, params);
};

/**
 * 鏂囦欢涓嬭浇
 * @param params
 */
export const fileDownload = (params: { url: string }) => {
  return adminHttp.downloadWithHeader(`/common/files/download`, params);
};
