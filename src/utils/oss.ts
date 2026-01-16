import type { OssTransform } from '@/api/types/system/common';
import { getPrivateUrl } from '@/api/modules/system/common';
import { useConfigStore } from '@/stores/modules/config';

/**
 * 是否使用 private 模式：
 * - 仅当 accessMode === 'private' 时返回 true
 * - 其他任何值都当作 public（false）
 */
const isPrivateMode = (accessMode?: string): boolean => {
  return accessMode === 'private';
};

/**
 * 计算 OSS 文件的实际展示地址
 * - 支持全局 private/public 开关（configStore.configOptions['oss.accessMode']）
 * - 支持局部覆盖 usePrivate
 *
 * @param rawUrl   数据库中存储的原始 URL（或对象路径）
 * @param options  可选参数：局部是否启用 private、bucket 等
 * @returns 最终用于 img/src 等展示的 URL（可能是原始/也可能是 privateUrl）
 */
export const getOssPreviewUrl = async (
  rawUrl: string,
  options?: {
    usePrivate?: boolean; // 单次调用是否启用 private，不传则走全局配置
    bucket?: string;
  }
): Promise<string> => {
  // 1. 没有值，直接返回空
  if (!rawUrl) return '';

  const configStore = useConfigStore();

  // 2. 计算是否启用 private：
  //    - 优先使用 options.usePrivate（调用处强制指定）
  //    - 否则读取全局配置 oss.accessMode，并转换成布尔值
  let enablePrivate: boolean;
  if (options?.usePrivate !== undefined) {
    enablePrivate = options.usePrivate;
  } else {
    const accessMode = configStore.getConfigOption('oss.accessMode');
    enablePrivate = isPrivateMode(accessMode);
  }

  // 3. public 模式：不做任何转换，直接返回原始地址
  if (!enablePrivate) return rawUrl;

  // 4. private 模式：调用后端接口获取签名地址
  try {
    const params: OssTransform = {
      url: rawUrl,
      bucket: options?.bucket
    };

    const { data: presignedUrl } = await getPrivateUrl(params);

    return presignedUrl || rawUrl;
  } catch (error) {
    console.error('获取私有访问地址失败', error);
    // 失败时回退到原始地址，至少保证能展示
    return rawUrl;
  }
};
