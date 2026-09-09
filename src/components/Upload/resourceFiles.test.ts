import { describe, expect, test } from 'vitest';
import { normalizeResourceFiles, resolveUploadDownloadMode } from './resourceFiles';

describe('resourceFiles', () => {
  test('normalizes completed resources and removes client-only preview state', () => {
    const result = normalizeResourceFiles([
      {
        resourceId: '9007199254740993',
        objectKey: 'teacher/report.pdf',
        originName: '',
        contentType: '',
        accessUrl: 'blob:local-preview',
        localPreviewUrl: 'blob:local-preview'
      }
    ]);

    expect(result).toEqual([
      {
        resourceId: '9007199254740993',
        objectKey: 'teacher/report.pdf',
        originName: 'report.pdf',
        contentType: 'application/octet-stream',
        accessUrl: null
      }
    ]);
  });

  test('drops uploading or incomplete entries and deduplicates by resource identity', () => {
    const result = normalizeResourceFiles([
      { resourceId: '101', objectKey: 'teacher/a.pdf', originName: 'a.pdf' },
      { resourceId: '101', objectKey: 'forged/b.pdf', originName: 'b.pdf' },
      { objectKey: 'teacher/pending.pdf', uploading: true },
      { originName: 'missing-object-key.pdf' }
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ resourceId: '101', objectKey: 'teacher/a.pdf' });
  });

  test('uses public URL first and otherwise requires both business context and resource id', () => {
    expect(resolveUploadDownloadMode({ accessUrl: '/public/a.pdf' }, false)).toBe('direct');
    expect(resolveUploadDownloadMode({ resourceId: '101', accessUrl: null }, true)).toBe('business');
    expect(resolveUploadDownloadMode({ resourceId: '101', accessUrl: null }, false)).toBe('unavailable');
    expect(resolveUploadDownloadMode({ accessUrl: null }, true)).toBe('unavailable');
  });
});
