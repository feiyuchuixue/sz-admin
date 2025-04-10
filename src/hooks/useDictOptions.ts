import { computed } from 'vue';
import { useOptionsStore } from '@/stores/modules/options';
import type { DictCustom } from '@/api/types/system/dict';

/**
 * 自定义 Hook，用于从 store 中获取字典选项
 * @param dictName 字典名称
 * @returns 返回字典选项
 */
export const useDictOptions = (dictName: string) => {
  const optionsStore = useOptionsStore();
  return computed<DictCustom[]>(() => optionsStore.getDictOptions(dictName) || []);
};
