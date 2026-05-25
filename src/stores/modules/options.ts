import { defineStore } from 'pinia';
import { getDictByCode, getStaticDict } from '@/api/modules/system/dict';
import piniaPersistConfig from '@/stores/helper/persist';
import type { DictCustom } from '@/api/types/system/dict';
import { ref } from 'vue';

export const useOptionsStore = defineStore(
  'options',
  () => {
    const isLoaded = ref(false);
    const dictOptions = ref<Record<string, DictCustom[]>>({});
    const loadedTypes = ref<Record<string, boolean>>({});
    const expiredTypes = ref<Record<string, boolean>>({});
    const loadingTypes = ref<Record<string, boolean>>({});

    async function getAllDictList() {
      if (isLoaded.value) return;
      const { data } = await getStaticDict();
      dictOptions.value = { ...dictOptions.value, ...data };
      Object.keys(data).forEach(markLoaded);
      isLoaded.value = true;
    }

    function getDictOptions(type: string): DictCustom[] {
      if (shouldLoad(type)) {
        void ensureDictByCodes([type]).catch(() => undefined);
      }
      return dictOptions.value[type] || [];
    }

    function setReloadOptions() {
      isLoaded.value = false;
      Object.keys(loadedTypes.value).forEach(code => {
        expiredTypes.value[code] = true;
      });
    }

    async function getDictByCodes(typeCodes: string[]) {
      await loadDictByCodes(typeCodes, true);
    }

    async function ensureDictByCodes(typeCodes: string[]) {
      const pendingCodes = typeCodes.filter(shouldLoad);
      await loadDictByCodes(pendingCodes, false);
    }

    function expireDictTypes(typeCodes?: string[]) {
      const codes = typeCodes?.length ? typeCodes : Object.keys(loadedTypes.value);
      codes.forEach(code => {
        expiredTypes.value[code] = true;
      });
    }

    async function loadDictByCodes(typeCodes: string[], force: boolean) {
      const requestCodes = normalizeTypeCodes(typeCodes).filter(code => {
        return force ? !loadingTypes.value[code] : shouldLoad(code);
      });
      if (!requestCodes.length) return;
      requestCodes.forEach(code => {
        loadingTypes.value[code] = true;
      });
      try {
        const { data } = await getDictByCode({ typeCode: requestCodes });
        requestCodes.forEach(code => {
          dictOptions.value[code] = data[code] || [];
          markLoaded(code);
        });
      } finally {
        requestCodes.forEach(code => {
          loadingTypes.value[code] = false;
        });
      }
    }

    function shouldLoad(type: string): boolean {
      return !!type && !loadingTypes.value[type] && (!loadedTypes.value[type] || expiredTypes.value[type]);
    }

    function markLoaded(type: string) {
      loadedTypes.value[type] = true;
      expiredTypes.value[type] = false;
    }

    function normalizeTypeCodes(typeCodes: string[]): string[] {
      return Array.from(new Set(typeCodes.filter(Boolean)));
    }

    return {
      isLoaded,
      dictOptions,
      getAllDictList,
      getDictOptions,
      setReloadOptions,
      getDictByCodes,
      ensureDictByCodes,
      expireDictTypes
    };
  },
  {
    persist: piniaPersistConfig('options')
  }
);
