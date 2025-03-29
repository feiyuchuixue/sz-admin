// 登录模块
export type CaptchaInfo = {
  bigImageBase64: string;
  bigWidth: number;
  bigHeight: number;
  smallImageBase64: string;
  smallWidth: number;
  smallHeight: number;
  requestId: string;
  posY: number;
  secretKey: string;
};
export type CaptchaVerifyImageParams = {
  requestId: string;
  moveEncrypted: string;
};
