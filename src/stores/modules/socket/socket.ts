import { ref } from 'vue';
import { defineStore } from 'pinia';

import { useUserStore } from '@/stores/modules/user';
import { CHANNEL_DEFAULT } from '@/config/consts';
import { parseSocketMessage, type SocketMessage } from './messageParser';
import { createChannelHandlers } from './channelHandlers';

// 是否使用 socket：当环境变量存在且非空时启用
const SOCKET_ENV_KEY = 'VITE_SOCKET_URL';
const useSocket = Object.prototype.hasOwnProperty.call(import.meta.env, SOCKET_ENV_KEY) && !!import.meta.env[SOCKET_ENV_KEY];

const socketUrl = useSocket
  ? (() => {
      const url = new URL(import.meta.env[SOCKET_ENV_KEY] as string, window.location.origin);
      url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      return url;
    })()
  : null;

const MAX_RECONNECT_COUNT = 10;
const BASE_RECONNECT_DELAY = 10_000; // 10s
const MAX_RECONNECT_DELAY = 30_000; // 30s
const FIXED_RECONNECT_DELAY = 60_000; // 60s

export const useSocketStore = defineStore('socket', () => {
  const socket = ref<WebSocket | null>(null);
  const canReconnect = ref(true);
  const reconnectCount = ref(0);

  const userStore = useUserStore();

  const resetReconnect = () => {
    canReconnect.value = true;
    reconnectCount.value = 0;
  };

  const getReconnectDelay = () => {
    if (reconnectCount.value < MAX_RECONNECT_COUNT) {
      return Math.min(BASE_RECONNECT_DELAY * 2 ** reconnectCount.value, MAX_RECONNECT_DELAY);
    }
    return FIXED_RECONNECT_DELAY;
  };

  const _onOpen = () => {
    resetReconnect();
  };

  const handleReconnect = () => {
    if (!useSocket || !socketUrl) return;

    const delay = getReconnectDelay();
    setTimeout(() => {
      reconnectCount.value++;
      open();
    }, delay);
  };

  const _onClose = () => {
    socket.value = null;
    if (canReconnect.value) {
      handleReconnect();
    }
  };

  const close = () => {
    if (!useSocket) return;

    canReconnect.value = false;
    reconnectCount.value = 0;

    if (!socket.value) return;

    try {
      socket.value.close();
    } catch (err) {
      console.warn('主动关闭 WebSocket 连接失败：', err);
    } finally {
      socket.value = null;
    }
  };

  // 创建 channel 分发器，只需要把 close 传进去
  const { dispatchChannel } = createChannelHandlers({ close });

  const _onMessage = (event: MessageEvent) => {
    const msg = parseSocketMessage(event.data);

    if (!msg) {
      console.error('WebSocket 消息解析失败，忽略本次消息：', event.data);
      return;
    }

    try {
      dispatchChannel(msg);
    } catch (err) {
      console.error('WebSocket 消息处理出错：', err, '消息内容：', msg);
    }

    console.log('接收到的消息：', msg);
  };

  const _onError = (event: Event) => {
    console.error('WebSocket 发生错误：', event);
    // 如果需要全局通知，这里可以 mittBus.emit('socket.error', event);
  };

  const open = () => {
    if (!useSocket || !socketUrl) return;

    // 已有 OPEN 连接则不重复创建
    if (socket.value && socket.value.readyState === WebSocket.OPEN) return;

    // 有旧连接但状态不是 CLOSED，先尝试关闭
    if (socket.value && socket.value.readyState !== WebSocket.CLOSED) {
      try {
        socket.value.close();
      } catch (err) {
        console.warn('关闭旧 WebSocket 连接失败：', err);
      } finally {
        socket.value = null;
      }
    }

    if (!userStore.token) {
      console.warn('当前没有 token，跳过 WebSocket 连接');
      return;
    }

    const ws = new WebSocket(socketUrl, [userStore.token]);
    ws.onopen = _onOpen;
    ws.onmessage = _onMessage;
    ws.onerror = _onError;
    ws.onclose = _onClose;

    socket.value = ws;
  };

  const send = (data: unknown, channel: string = CHANNEL_DEFAULT) => {
    if (!socket.value || socket.value.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket 未连接或未就绪，发送失败');
      return;
    }

    const payload = typeof data === 'object' && data !== null ? data : { data };

    const msg: SocketMessage = { channel, data: payload };

    try {
      socket.value.send(JSON.stringify(msg));
    } catch (err) {
      console.error('WebSocket 发送消息失败：', err, msg);
    }
  };

  return {
    open,
    send,
    close
  };
});
