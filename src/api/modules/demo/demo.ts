import { adminHttp } from '@/api/client';
import type { Message } from '@/api/types/system/message';

/**
 * 鍙戦€佹秷鎭? * @param params
 * @returns {*}
 */
export const sendMessageApi = (params: Message) => {
  return adminHttp.post(`/www/message/send`, params);
};
