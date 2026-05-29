import { adminHttp } from '@/api/client';
import type { IPage } from '@/api/types';
import type { MessageQuery, MessageRow, UnreadMessageCount } from '@/api/types/system/message';

/**
 * 鍒楄〃
 */
export const getMessageListApi = (params: MessageQuery) => {
  return adminHttp.get<IPage<MessageRow>>(`/sys-message`, params);
};

/**
 * 璇︽儏
 */
export const getMessageInfoApi = (id: string | number) => {
  return adminHttp.get<MessageRow>(`/sys-message/${id}`);
};

/**
 * 鎴戠殑寰呭姙娑堟伅
 */
export const getTodoMessageListApi = () => {
  return adminHttp.get<MessageRow[]>(`/sys-message/list/todo`);
};

/**
 * 鎴戠殑娑堟伅
 */
export const getNoticeMessageListApi = () => {
  return adminHttp.get<MessageRow[]>(`/sys-message/list/msg`);
};

/**
 * 鏈娑堟伅鏁伴噺
 */
export const getUnreadMessageCountApi = () => {
  return adminHttp.get<UnreadMessageCount>(`/sys-message/count`);
};
