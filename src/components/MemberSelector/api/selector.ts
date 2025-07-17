import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { SelectorQuery, SelectorResult } from '@/components/MemberSelector/type/selector';

export const querySelectorApi = (params: SelectorQuery) => {
  return http.get<SelectorResult>(ADMIN_MODULE + `/common/selector`, params);
};
