import { defineStore } from 'pinia';
import piniaPersistConfig from '@/stores/helper/persist';
import { ref } from 'vue';
import { getFrontendConfig } from '@/api/modules/system/config';

export const useConfigStore = defineStore(
  'config',
  () => {
    const isLoaded = ref(false);
    const configOptions = ref<Record<string, string>>({});

    async function getConfig() {
      if (isLoaded.value) return;
      const { data } = await getFrontendConfig();
      configOptions.value = data;
      isLoaded.value = true;
    }

    function getConfigOption(key: string): string {
      return configOptions.value[key];
    }

    function setReload() {
      isLoaded.value = false;
    }

    return {
      isLoaded,
      configOptions,
      getConfigOption,
      getConfig,
      setReload: setReload
    };
  },
  {
    persist: piniaPersistConfig('config')
  }
);
