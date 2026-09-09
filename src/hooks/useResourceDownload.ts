import type { AxiosResponse } from 'axios';

import { saveBlob } from '@/utils/file/saveBlob';

export type ResourceResponseLoader = (bizId: string, resourceId: string) => Promise<AxiosResponse<Blob>>;

export interface ResourceDownloadRequest {
  loader: ResourceResponseLoader;
  bizId: string;
  resourceId: string;
  fallbackName?: string;
}

function getHeader(response: AxiosResponse<Blob>, name: string): string | undefined {
  const headers = response.headers as unknown as Record<string, string> & { get?: (header: string) => string | null };
  const fromGetter = headers.get?.(name);
  return fromGetter ?? headers[name.toLowerCase()] ?? headers[name];
}

async function requireFileBlob(response: AxiosResponse<Blob>): Promise<Blob> {
  const businessCode = getHeader(response, 'x-biz-code');
  if (businessCode && businessCode !== '0000') {
    const encodedMessage = getHeader(response, 'x-biz-message');
    const message = encodedMessage ? decodeURIComponent(encodedMessage) : '资源访问失败';
    throw new Error(message);
  }

  const contentType = getHeader(response, 'content-type') || response.data.type;
  if (contentType.toLowerCase().includes('application/json')) {
    let message = '资源访问失败';
    try {
      const payload = JSON.parse(await response.data.text()) as { message?: string };
      message = payload.message || message;
    } catch {
      // 响应体无法解析时使用默认错误信息。
    }
    throw new Error(message);
  }
  return response.data;
}

export function useResourceDownload() {
  const downloadResource = async (request: ResourceDownloadRequest): Promise<string> => {
    const response = await request.loader(request.bizId, request.resourceId);
    const blob = await requireFileBlob(response);
    return saveBlob(blob, getHeader(response, 'content-disposition'), request.fallbackName || 'download');
  };

  const previewResource = async (request: ResourceDownloadRequest) => {
    const response = await request.loader(request.bizId, request.resourceId);
    const blob = await requireFileBlob(response);
    const url = URL.createObjectURL(blob);
    let revoked = false;
    return {
      url,
      revoke: () => {
        if (revoked) return;
        URL.revokeObjectURL(url);
        revoked = true;
      }
    };
  };

  return { downloadResource, previewResource };
}
