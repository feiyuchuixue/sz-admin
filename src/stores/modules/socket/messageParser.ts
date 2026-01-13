import { CHANNEL_DEFAULT } from '@/config/consts';

export interface SocketMessage<T = any> {
  channel: string;
  data?: T;
}

/**
 * 消息解析：兼容字符串 / 对象 / 非 JSON 格式
 */
export const parseSocketMessage = (raw: unknown): SocketMessage | null => {
  // 1. 若是字符串，尝试 JSON.parse
  if (typeof raw === 'string') {
    try {
      const obj = JSON.parse(raw);
      return parseSocketMessage(obj);
    } catch (_err) {
      console.warn('WebSocket 收到非 JSON 字符串消息：', _err);
      // 兜底：以默认频道转发出去
      return { channel: CHANNEL_DEFAULT, data: raw };
    }
  }

  // 2. 若已经是对象
  if (raw && typeof raw === 'object') {
    const maybeMsg = raw as { channel?: unknown; data?: unknown };

    const channel = typeof maybeMsg.channel === 'string' ? maybeMsg.channel : CHANNEL_DEFAULT;
    const data = 'data' in maybeMsg ? maybeMsg.data : undefined;

    return { channel, data };
  }

  // 3. 其他类型（number、boolean、null、undefined）
  console.warn('WebSocket 收到非对象类型消息：', raw);
  return { channel: CHANNEL_DEFAULT, data: raw };
};
