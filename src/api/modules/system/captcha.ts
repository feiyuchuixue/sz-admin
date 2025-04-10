import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { CaptchaInfo, CaptchaVerifyImageParams } from '@/api/types/system/captcha';

// 获取验证码是否启用
export const getCaptchaStatus = () => {
  return http.get<boolean>(ADMIN_MODULE + `/captcha/status`, {});
};
// 获取滑块拼图验证码
export const getImageCodeApi = () => {
  return http.post<CaptchaInfo>(ADMIN_MODULE + `/captcha/get`, {});
};
// 校验滑块拼图验证码
export const verifyImageCodeApi = (params: CaptchaVerifyImageParams) => {
  return http.post(ADMIN_MODULE + `/captcha/check`, params);
};
