import { defineStore } from 'pinia';
import { ref } from 'vue';
import piniaPersistConfig from '@/stores/helper/persist';
import type { UserInfo } from '@/api/types/system/login';

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref('');
    const userInfo = ref<UserInfo>({
      username: ''
    });
    function setToken(tokenStr: string) {
      token.value = tokenStr;
    }

    // Set setUserInfo
    function setUserInfo(info: UserInfo) {
      userInfo.value = info;
    }

    function clear() {
      token.value = '';
      userInfo.value = {
        username: ''
      };
    }

    return {
      token,
      userInfo,
      setToken,
      setUserInfo,
      clear
    };
  },
  {
    persist: piniaPersistConfig('user')
  }
);
