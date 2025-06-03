import type { IPageQuery } from '@/api/types';

export type MessageQuery = IPageQuery & {
  messageTypeCd?: string;
  readType?: string;
};

export type MessageRow = {
  id: number;
  messageTypeCd: string;
  senderId: number;
  title: string;
  content: string;
  isRead: string;
  createTime: string;
};

export type UnreadMessageCount = {
  all: number;
  todo: number;
  msg: number;
};

export type Message = {
  messageTypeCd?: string;
  senderId?: number;
  title?: string;
  content?: string;
  receiverIds?: string[];
};
