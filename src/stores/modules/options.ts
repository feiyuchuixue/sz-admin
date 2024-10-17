import { defineStore } from 'pinia';
import { getAllDict } from '@/api/modules/system/dict';
import piniaPersistConfig from '@/stores/helper/persist';
import type { IDict } from '@/api/interface/system/dict';
import { ref } from 'vue';

export const useOptionsStore = defineStore(
  'options',
  () => {
    const isLoaded = ref(false);
    const dictOptions = ref<Record<string, IDict.DictCustom[]>>({});

    async function getAllDictList() {
      if (isLoaded.value) return;
      const { data } = await getAllDict();
      dictOptions.value = data;
      isLoaded.value = true;
    }

    function getDictOptions(type: string) {
      return dictOptions.value[type] || [];
    }

    function setReloadOptions() {
      isLoaded.value = false;
    }

    return {
      isLoaded,
      dictOptions,
      getAllDictList,
      getDictOptions,
      setReloadOptions
    };
  },
  {
    persist: piniaPersistConfig('options')
  }
);
