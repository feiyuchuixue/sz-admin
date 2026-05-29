import { ref } from 'vue';
import { defineStore } from 'pinia';

import { useUserStore } from '@/stores/modules/user';
import { CHANNEL_DEFAULT, CHANNEL_PING, CLOSE_CODE_AUTH_EXPIRED } from '@/config/consts';
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

/** 心跳发送间隔：30s */
const HEARTBEAT_INTERVAL = 30_000;
/** PONG 等待超时：10s 内未收到 PONG 则判定连接死亡 */
const PONG_TIMEOUT = 10_000;

export const useSocketStore = defineStore('socket', () => {
  const socket = ref<WebSocket | null>(null);
  const canReconnect = ref(true);
  const reconnectCount = ref(0);

  /** 心跳定时器（setInterval）*/
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  /** PONG 超时计时器（setTimeout）*/
  let pongTimeoutTimer: ReturnType<typeof setTimeout> | null = null;

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

  // ── 心跳 ──────────────────────────────────────────────────────────────

  /**
   * 启动 pong 超时计时器。
   * 发出 PING 后 10s 内若未收到 PONG，判定连接死亡，主动 close + 重连。
   */
  const startPongTimeout = () => {
    clearPongTimeout();
    pongTimeoutTimer = setTimeout(() => {
      console.warn('[socket] PONG 超时，判定连接死亡，触发重连');
      // 强制关闭（不禁用重连），让 _onClose 走正常重连分支
      if (socket.value) {
        try {
          socket.value.close();
        } catch {
          // ignore
        }
        socket.value = null;
      }
      if (canReconnect.value) {
        handleReconnect();
      }
    }, PONG_TIMEOUT);
  };

  /** 清除 pong 超时计时器（收到 PONG 时调用）*/
  const clearPongTimeout = () => {
    if (pongTimeoutTimer !== null) {
      clearTimeout(pongTimeoutTimer);
      pongTimeoutTimer = null;
    }
  };

  /** 发送一次心跳 PING */
  const sendPing = () => {
    if (!socket.value || socket.value.readyState !== WebSocket.OPEN) return;
    try {
      socket.value.send(JSON.stringify({ channel: CHANNEL_PING }));
      startPongTimeout();
    } catch (err) {
      console.warn('[socket] 发送 PING 失败：', err);
    }
  };

  /** 启动心跳定时器（连接建立后调用）*/
  const startHeartbeat = () => {
    stopHeartbeat();
    heartbeatTimer = setInterval(sendPing, HEARTBEAT_INTERVAL);
  };

  /** 停止心跳定时器（连接关闭时调用）*/
  const stopHeartbeat = () => {
    if (heartbeatTimer !== null) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
    clearPongTimeout();
  };

  // ── WebSocket 事件 ─────────────────────────────────────────────────────

  const _onOpen = () => {
    resetReconnect();
    startHeartbeat();
  };

  const handleReconnect = () => {
    if (!useSocket || !socketUrl) return;

    const delay = getReconnectDelay();
    setTimeout(() => {
      reconnectCount.value++;
      open();
    }, delay);
  };

  const _onClose = (event: CloseEvent) => {
    stopHeartbeat();
    socket.value = null;
    // 服务端鉴权失效（自定义码 4401）：禁用重连 + 走统一登出闭环
    // 仅此码触发登出，其它任何关闭原因（1000/1006/1011 等）均维持原有静默重连，
    // 保证 WebSocket 仍是"可选能力"，不会因网络抖动/服务未配置而强制下线
    if (event.code === CLOSE_CODE_AUTH_EXPIRED) {
      canReconnect.value = false;
      reconnectCount.value = 0;
      handleAuthExpired();
      return;
    }
    if (canReconnect.value) {
      handleReconnect();
    }
  };

  const close = () => {
    if (!useSocket) return;

    canReconnect.value = false;
    reconnectCount.value = 0;
    stopHeartbeat();

    if (!socket.value) return;

    try {
      socket.value.close();
    } catch (err) {
      console.warn('主动关闭 WebSocket 连接失败：', err);
    } finally {
      socket.value = null;
    }
  };

  // 创建 channel 分发器，传入 close 和 clearPongTimeout
  const { dispatchChannel, handleAuthExpired } = createChannelHandlers({ close, clearPongTimeout });

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
  };

  const _onError = (event: Event) => {
    console.error('WebSocket 发生错误：', event);
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

  // ── 页面可见性探活 ──────────────────────────────────────────────────────
  // 用户切回标签页时，若连接不是 OPEN 状态则立即尝试重连
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) return;
      if (!useSocket || !socketUrl) return;
      if (!canReconnect.value) return;
      if (!socket.value || socket.value.readyState !== WebSocket.OPEN) {
        open();
      }
    });
  }

  return {
    open,
    send,
    close
  };
});
