import type { ResourceRef } from '@/api/types/system/upload';

type ResourceFileInput = Partial<ResourceRef> & {
  uploading?: boolean;
  localPreviewUrl?: string;
  [key: string]: unknown;
};

function normalizeResourceFile(input: ResourceFileInput): ResourceRef | null {
  if (input.uploading || !input.objectKey) return null;

  const normalized = { ...input };
  delete normalized.uploading;
  delete normalized.localPreviewUrl;

  const resourceId = input.resourceId == null || input.resourceId === '' ? undefined : String(input.resourceId);
  const accessUrl = typeof input.accessUrl === 'string' && !input.accessUrl.startsWith('blob:') ? input.accessUrl : null;

  return {
    ...normalized,
    objectKey: input.objectKey,
    originName: input.originName || input.objectKey.split('/').pop() || input.objectKey,
    contentType: input.contentType || 'application/octet-stream',
    accessUrl,
    ...(resourceId ? { resourceId } : {})
  } as ResourceRef;
}

export function normalizeResourceFiles(files: ResourceFileInput[] | null | undefined): ResourceRef[] {
  if (!Array.isArray(files)) return [];
  const seen = new Set<string>();
  const normalized: ResourceRef[] = [];

  for (const input of files) {
    const file = normalizeResourceFile(input);
    if (!file) continue;
    const key = file.resourceId ? `id:${file.resourceId}` : `key:${file.sceneCode || ''}:${file.objectKey}`;
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(file);
  }
  return normalized;
}

export function resolveUploadDownloadMode(
  resource: Pick<ResourceRef, 'resourceId' | 'accessUrl'>,
  hasBusinessContext: boolean
): 'direct' | 'business' | 'unavailable' {
  if (resource.accessUrl) return 'direct';
  if (hasBusinessContext && resource.resourceId) return 'business';
  return 'unavailable';
}
