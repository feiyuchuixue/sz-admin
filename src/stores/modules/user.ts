import { defineStore } from 'pinia';
import { ref } from 'vue';
import piniaPersistConfig from '@/stores/helper/persist';
import type { UserProfileVO } from '@/api/types/system/user';

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref('');

    // profile 不持久化，每次刷新页面由 initDynamicRouter 重新从接口获取
    const profile = ref<UserProfileVO | null>(null);

    function setToken(tokenStr: string) {
      token.value = tokenStr;
    }

    function setProfile(data: UserProfileVO) {
      profile.value = data;
    }

    function clear() {
      token.value = '';
      profile.value = null;
    }

    return {
      token,
      profile,
      setToken,
      setProfile,
      clear
    };
  },
  {
    // 只持久化 token，profile 每次刷新由接口重新拉取
    persist: piniaPersistConfig('user', ['token'])
  }
);
