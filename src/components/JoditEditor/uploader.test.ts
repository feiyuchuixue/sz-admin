import { describe, expect, test } from 'vitest';
import { getResourceUploadMessage, isResourceUploadResponseSuccess, isRichTextImageFilename } from './uploader';

describe('JoditEditor uploader', () => {
  test('accepts only successful resource list responses', () => {
    expect(isResourceUploadResponseSuccess({ code: '0000', data: [] })).toBe(true);
    expect(isResourceUploadResponseSuccess({ code: 0, data: [] })).toBe(false);
    expect(isResourceUploadResponseSuccess({ code: '0000', data: {} })).toBe(false);
    expect(isResourceUploadResponseSuccess(null)).toBe(false);
  });

  test('uses backend failure message when available', () => {
    expect(getResourceUploadMessage({ message: '文件类型不允许' })).toBe('文件类型不允许');
    expect(getResourceUploadMessage({ message: '  ' })).toBe('文件上传失败');
    expect(getResourceUploadMessage(null)).toBe('文件上传失败');
  });

  test('recognizes only supported inline image extensions', () => {
    expect(isRichTextImageFilename('photo.JPEG')).toBe(true);
    expect(isRichTextImageFilename('photo.webp')).toBe(true);
    expect(isRichTextImageFilename('vector.svg')).toBe(false);
    expect(isRichTextImageFilename('document.pdf')).toBe(false);
  });
});
