export function useUrlDownload(file: { url: string; filename?: string }) {
  function getFileName(url: string) {
    return url.split('/').pop() || url;
  }
  function isImage(url: string) {
    return /\.(png|jpe?g|gif|bmp|webp|svg)$/i.test(url);
  }
  function shouldForceFetch(url: string, isImg: boolean) {
    try {
      const u = new URL(url, location.href);
      const cross = u.origin !== location.origin;
      return isImg || cross;
    } catch {
      return isImg;
    }
  }
  function extractFileNameFromCD(cd?: string | null): string | undefined {
    if (!cd) return;
    const starMatch = /filename\*\s*=\s*([^;]+)/i.exec(cd);
    if (starMatch) {
      const value = starMatch[1].trim().replace(/^"(.*)"$/, '$1');
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
    const normalMatch = /filename\s*=\s*([^;]+)/i.exec(cd);
    if (normalMatch) {
      return normalMatch[1].trim().replace(/^"(.*)"$/, '$1');
    }
  }
  async function forceBlobDownload(url: string, filename?: string) {
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error(`下载失败: ${res.status}`);
    let finalName = filename;
    const cd = extractFileNameFromCD(res.headers.get('Content-Disposition'));
    if (!finalName && cd) finalName = cd;
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = objectUrl;
    a.download = finalName || getFileName(url) || 'download';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }

  const name = file.filename || getFileName(file.url);
  const img = isImage(file.url);

  if (shouldForceFetch(file.url, img)) {
    return forceBlobDownload(file.url, name);
  } else {
    try {
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = file.url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }
}
