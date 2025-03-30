import { onMounted } from 'vue';
import { useOptionsStore } from '@/stores/modules/options';

/**
 * 用于主动触发接口来获取并更新（缓存）指定类型的字典信息。
 * @param typeCode 字典类型数组
 */
export function useDict(typeCode: string[]) {
  const optionsStore = useOptionsStore();
  onMounted(async () => {
    await optionsStore.getDictByCodes(typeCode);
  });
}
