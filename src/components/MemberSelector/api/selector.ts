import { adminHttp } from '@/api/client';
import type { SelectorQuery, SelectorResult } from '@/components/MemberSelector/type/selector';

export const querySelectorApi = (params: SelectorQuery) => {
  return adminHttp.get<SelectorResult>(`/common/selector`, params);
};
