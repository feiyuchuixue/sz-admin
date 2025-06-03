import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { IPage } from '@/api/types';
import type { MessageQuery, MessageRow, UnreadMessageCount } from '@/api/types/system/message';

/**
 * 列表
 */
export const getMessageListApi = (params: MessageQuery) => {
  return http.get<IPage<MessageRow>>(ADMIN_MODULE + `/sys-message`, params);
};

/**
 * 详情
 */
export const getMessageInfoApi = (id: string | number) => {
  return http.get<MessageRow>(ADMIN_MODULE + `/sys-message/${id}`);
};

/**
 * 我的待办消息
 */
export const getTodoMessageListApi = () => {
  return http.get<MessageRow[]>(ADMIN_MODULE + `/sys-message/list/todo`);
};

/**
 * 我的消息
 */
export const getNoticeMessageListApi = () => {
  return http.get<MessageRow[]>(ADMIN_MODULE + `/sys-message/list/msg`);
};

/**
 * 未读消息数量
 */
export const getUnreadMessageCountApi = () => {
  return http.get<UnreadMessageCount>(ADMIN_MODULE + `/sys-message/count`);
};
