export function extractDownloadFilename(contentDisposition?: string | null): string | undefined {
  if (!contentDisposition) return undefined;

  const encoded = /filename\*\s*=\s*([^;]+)/i.exec(contentDisposition)?.[1]?.trim().replace(/^"(.*)"$/, '$1');
  if (encoded) {
    const value = /^([^']*)'[^']*'(.*)$/.exec(encoded)?.[2] ?? encoded;
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  const plain = /filename\s*=\s*([^;]+)/i.exec(contentDisposition)?.[1]?.trim();
  return plain?.replace(/^"(.*)"$/, '$1');
}

export function saveBlob(blob: Blob, contentDisposition?: string | null, fallbackName = 'download'): string {
  const filename = extractDownloadFilename(contentDisposition) || fallbackName;
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.style.display = 'none';
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  try {
    anchor.click();
  } finally {
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  }
  return filename;
}
