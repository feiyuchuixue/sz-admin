import { fileDownload } from '@/api/modules/system/common';

export function useUrlDownload(file: { url: string; filename?: string }) {
  /** 从 URL 截取兜底文件名 */
  function getFileNameFromUrl(url: string) {
    return url.split('/').pop() || url;
  }

  /** 从 Content-Disposition 中解析文件名（支持 filename* 与 filename） */
  function extractFileNameFromCD(cd?: string | null): string | undefined {
    if (!cd) return;

    // 1) 先处理 RFC5987 的 filename*
    const starMatch = /filename\*\s*=\s*([^;]+)/i.exec(cd);
    if (starMatch) {
      const value = starMatch[1].trim().replace(/^"(.*)"$/, '$1'); // 去掉首尾引号
      const rfc5987 = /^([^']*)'[^']*'(.*)$/.exec(value);
      if (rfc5987) {
        const encodedPart = rfc5987[2];
        try {
          return decodeURIComponent(encodedPart);
        } catch (e) {
          console.log('无法解码 RFC5987 编码的文件名：', e);
        }
      } else {
        try {
          return decodeURIComponent(value);
        } catch (e) {
          console.log('无法解码 URL 编码的文件名:', e);
        }
        return value;
      }
    }

    // 2) 再处理普通 filename=
    const normalMatch = /filename\s*=\s*([^;]+)/i.exec(cd);
    if (normalMatch) {
      return normalMatch[1].trim().replace(/^"(.*)"$/, '$1');
    }
  }

  async function proxyDownload(url: string, filename?: string) {
    // 1. 通过代理接口拿到 AxiosResponse<Blob>
    const res = await fileDownload({ url });

    // 2. 从响应头中取 Content-Disposition
    const cd =
      (res.headers['content-disposition'] as string | undefined) ?? (res.headers['Content-Disposition'] as string | undefined);

    // 3. 计算最终文件名：前端传入 > 响应头 > URL > 'download'
    let finalName = filename;
    const cdName = extractFileNameFromCD(cd);
    if (!finalName && cdName) finalName = cdName;
    if (!finalName) finalName = getFileNameFromUrl(url) || 'download';

    // 4. 触发浏览器下载
    const blob = res.data as Blob;
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = objectUrl;
    a.download = finalName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }

  const { url, filename } = file;
  const name = filename || getFileNameFromUrl(url);

  // 统一走后端代理，解决跨域
  return proxyDownload(url, name);
}
