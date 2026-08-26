export const RICH_TEXT_IMAGE_EXTENSIONS = ['jpg', 'png', 'jpeg', 'gif', 'webp'] as const;

type ResourceUploadResponse = {
  code?: unknown;
  message?: unknown;
  data?: unknown;
};

const isResourceUploadResponse = (response: unknown): response is ResourceUploadResponse =>
  typeof response === 'object' && response !== null;

export const isResourceUploadResponseSuccess = (response: unknown): boolean =>
  isResourceUploadResponse(response) && response.code === '0000' && Array.isArray(response.data);

export const getResourceUploadMessage = (response: unknown): string => {
  if (isResourceUploadResponse(response) && typeof response.message === 'string' && response.message.trim()) {
    return response.message;
  }
  return '文件上传失败';
};

export const isRichTextImageFilename = (filename: string): boolean => /\.(jpe?g|png|gif|webp)$/i.test(filename);
