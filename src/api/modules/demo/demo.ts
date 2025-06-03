import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { Message } from '@/api/types/system/message';

/**
 * 发送消息
 * @param params
 * @returns {*}
 */
export const sendMessageApi = (params: Message) => {
  return http.post(ADMIN_MODULE + `/www/message/send`, params);
};
