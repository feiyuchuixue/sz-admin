import { adminHttp } from '@/api/client';
import type { CaptchaInfo, CaptchaVerifyImageParams } from '@/api/types/system/captcha';

export const getCaptchaStatus = () => {
  return adminHttp.get<boolean>('/captcha/status', {});
};

export const getImageCodeApi = () => {
  return adminHttp.post<CaptchaInfo>('/captcha/get', {});
};

export const verifyImageCodeApi = (params: CaptchaVerifyImageParams) => {
  return adminHttp.post('/captcha/check', params);
};
