// 登录模块
export type CaptchaInfo = {
  bigImageBase64: string;
  bigWidth: number;
  bigHeight: number;
  smallImageBase64: string;
  smallWidth: number;
  smallHeight: number;
  requestId: string;
  posY: number; // 小图 Y 轴显示位置，明文下发
  secretKey: string;
};

export type CaptchaVerifyImageParams = {
  requestId: string;
  moveEncrypted: string;
  iv: string;
  startTime: number;
};
