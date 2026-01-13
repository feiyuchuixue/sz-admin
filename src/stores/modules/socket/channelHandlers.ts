import mittBus from '@/utils/mittBus';
import {
  CHANNEL_DEFAULT,
  CHANNEL_KICK_OFF,
  SYNC_DICT,
  SYNC_FRONTEND_CONF,
  SYNC_PERMISSIONS,
  UPGRADE_CHANNEL
} from '@/config/consts';
import { LOGIN_URL } from '@/config';
import router from '@/router';
import { ElMessageBox } from 'element-plus';
import { useUserStore } from '@/stores/modules/user';
import { useAuthStore } from '@/stores/modules/auth';
import { useConfigStore } from '@/stores/modules/config';
import type { SocketMessage } from './messageParser';
import { useOptionsStore } from '@/stores/modules/options';

/**
 * createChannelHandlers 只从外部接收最小控制依赖：close
 * 所有业务 store 自行在本文件内 useXxxStore 引入
 */
export const createChannelHandlers = (options: { close: () => void }) => {
  const { close } = options;

  const userStore = useUserStore();
  const authStore = useAuthStore();
  const configStore = useConfigStore();
  const optionStore = useOptionsStore();

  const handleKickOff = () => {
    close();
    userStore.clear();
    authStore.clear();
    ElMessageBox.alert('您已经被强制踢下线了！', '温馨提示', {
      confirmButtonText: '确定',
      type: 'warning',
      callback: () => {
        router.replace(LOGIN_URL);
      }
    });
  };

  const handleSyncFrontendConf = async () => {
    configStore.setReload();
    try {
      console.log('[SOCKET] 同步前端配置...');
      await configStore.getConfig();
    } catch (err) {
      console.error('配置更新失败：', err);
    }
  };

  const handleSyncDictOptions = async () => {
    console.log('[SOCKET] 同步字典...');
    optionStore.setReloadOptions();
    try {
      await optionStore.getAllDictList();
    } catch (err) {
      console.error('字典更新失败：', err);
    }
  };

  const handleSyncPermissions = async () => {
    console.log('[SOCKET] 同步权限...');
    try {
      await authStore.getAuthButtonList();
    } catch (err) {
      console.error('字典更新失败：', err);
    }
  };

  /**
   * 频道处理器映射：
   * 后面业务增长时，只需要在这里增加 case 即可
   */
  const channelHandlers: Record<string, (msg: SocketMessage) => void> = {
    [CHANNEL_DEFAULT]: msg => {
      // 默认频道简单广播，如果你不需要也可以改成空
      mittBus.emit(`socket.${CHANNEL_DEFAULT}`, msg.data);
    },

    [CHANNEL_KICK_OFF]: () => {
      handleKickOff();
    },

    [SYNC_FRONTEND_CONF]: () => {
      void handleSyncFrontendConf();
    },

    [SYNC_DICT]: () => {
      void handleSyncDictOptions();
    },

    [SYNC_PERMISSIONS]: () => {
      void handleSyncPermissions();
    },

    [UPGRADE_CHANNEL]: msg => {
      // 预留升级逻辑；同时广播事件，方便业务自行接管
      /*
      close();
      userStore.clear();
      authStore.clear();
      ElMessageBox.alert(String(msg.data) + '！', '温馨提示', {
        confirmButtonText: '确定',
        type: 'warning',
        callback: () => {
          router.replace(LOGIN_URL);
        }
      });
      */
      mittBus.emit(`socket.${UPGRADE_CHANNEL}`, msg.data);
    }
  };

  const handleUnknownChannel = (msg: SocketMessage) => {
    // 未注册的频道统一走兜底广播
    mittBus.emit(`socket.${msg.channel}`, msg.data);
  };

  const dispatchChannel = (msg: SocketMessage) => {
    const handler = channelHandlers[msg.channel] ?? handleUnknownChannel;
    handler(msg);
  };

  return {
    dispatchChannel
  };
};
