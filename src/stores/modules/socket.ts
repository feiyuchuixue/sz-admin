import { useUserStore } from '@/stores/modules/user';
import { defineStore } from 'pinia';
import mittBus from '@/utils/mittBus';
import { CHANNEL_DEFAULT, CHANNEL_KICK_OFF, UPGRADE_CHANNEL } from '@/config/consts';
import { LOGIN_URL } from '@/config';
import router from '@/router';
import { ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import { useAuthStore } from '@/stores/modules/auth';

// 是否使用socket 当 import.meta.env.VITE_SOCKET_URL 不为空时，启用websocket
//const useSocket = Object.prototype.hasOwnProperty.call(import.meta.env, 'VITE_SOCKET_URL');
const useSocket = Object.hasOwn(import.meta.env, 'VITE_SOCKET_URL');
const socketUrl = new URL(import.meta.env.VITE_SOCKET_URL, window.location.origin);
socketUrl.protocol = socketUrl.protocol === 'https:' ? 'wss:' : 'ws:';
const MAX_RECONNECT_COUNT = 10;

/**
 * 使用socket
 * @param url
 * @returns {{init: (function(): void), socket: null}}
 */
export const useSocketStore = defineStore('socket', () => {
  /**
   * 定义socket变量
   *
   * @type {WebSocket|null}
   */
  const socket = ref<WebSocket | null>(null);

  const canReconnect = ref(true);

  const reconnectCount = ref(0);

  const _onOpen = () => {
    canReconnect.value = true;
    reconnectCount.value = 0;
  };

  const _onMessage = (event: MessageEvent) => {
    const { data } = event;
    const userStore = useUserStore();
    const authStore = useAuthStore();
    try {
      const res = JSON.parse(data);
      switch (res.channel) {
        case CHANNEL_DEFAULT:
          break;
        case CHANNEL_KICK_OFF:
          close();
          // 1.清除 Token
          userStore.clear();
          authStore.clear();
          ElMessageBox.alert('您已经被强制踢下线了！', '温馨提示', {
            confirmButtonText: '确定',
            type: 'warning',
            callback: () => {
              // 2.重定向到登陆页
              router.replace(LOGIN_URL).then(r => r);
            }
          });
          break;
        case UPGRADE_CHANNEL:
/*          close();
          // 1.清除 Token
          userStore.clear();
          authStore.clear();

          ElMessageBox.alert(res.data + '！', '温馨提示', {
            confirmButtonText: '确定',
            type: 'warning',
            callback: () => {
              // 2.重定向到登陆页
              router.replace(LOGIN_URL);
            }
          });*/
          break;

        default:
          mittBus.emit(`socket.${res.channel}`, res.data);
      }
      console.log('接收到的消息：', res);
    } catch (e) {
      /* empty */
    }
  };

  const _onError = (event: Event) => {
    mittBus.emit('socket.error', event);
  };

  const _onClose = () => {
    socket.value = null;
    if (canReconnect.value) {
      handleReconnect();
    }
  };

  const handleReconnect = () => {
    let timeout;
    if (reconnectCount.value < MAX_RECONNECT_COUNT) {
      timeout = Math.min(10000 * Math.pow(2, reconnectCount.value), 30000); // 指数退避算法
    } else {
      timeout = 60000; // 超过最大次数次后，每分钟重试一次
    }
    setTimeout(() => {
      reconnectCount.value++;
      open();
    }, timeout);
  };

  /**
   * 初始化开启socket
   */
  const open = () => {
    if (!useSocket) return;
    if (socket.value) return;
    const userStore = useUserStore();
    // 建立WebSocket连接
    const webSocket = new WebSocket(socketUrl, [userStore.token]);

    // 监听WebSocket事件
    webSocket.onopen = _onOpen;
    webSocket.onmessage = _onMessage;
    webSocket.onerror = _onError;
    webSocket.onclose = _onClose;

    // 连接时处理
    socket.value = webSocket;
  };

  /**
   * 关闭socket
   */
  const close = () => {
    if (!useSocket) return;
    if (!socket.value) return;
    canReconnect.value = false;
    reconnectCount.value = 0;
    socket.value.close();
    socket.value = null;
  };

  const send = (data: any, channel: string = CHANNEL_DEFAULT) => {
    if (!socket.value || socket.value.readyState !== 1) return;
    if (typeof data !== 'object') {
      data = { data };
    }
    const msgData = {
      channel,
      data
    };
    socket.value.send(JSON.stringify(msgData));
  };

  return {
    open,
    send,
    close
  };
});
