// 登录模块
export type LoginParams = {
  username: string;
  password: string;
  clientId: string;
  grantType: string;
  iv: string;
  requestId: string;
};

export type LoginInfo = {
  name: string;
  avatar: string;
  introduction: string;
  accessToken: string;
  refreshToken: string;
  roles: string[];
  userInfo: UserInfo;
  permissions: string[];
};

export type UserInfo = {
  id?: number;
  username: string;
  phone?: string;
  nickname?: string;
  logo?: string;
  age?: number;
  sex?: number;
  idCard?: string;
  email?: string;
  accountStatusCd?: string;
  userTagCd?: string;
  lastLoginTime?: string;
  createTime?: string;
  updateTime?: string;
};

export type ChallengeInfo = {
  requestId: string;
  secretKey: string;
};
