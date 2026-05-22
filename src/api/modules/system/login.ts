import { adminHttp } from '@/api/client';
import type { LoginParams, LoginInfo, ChallengeInfo } from '@/api/types/system/login';

export const loginApi = (params: LoginParams) => {
  params.grantType = 'password';
  params.clientId = import.meta.env.VITE_APP_CLIENT_ID;
  return adminHttp.post<LoginInfo>('/auth/login', params);
};

export const getAuthMenuListApi = () => {
  return adminHttp.get<Menu.MenuOptions[]>('/sys-menu/menu', {});
};

export const getAuthButtonListApi = () => {
  return adminHttp.get<string[]>('/sys-menu/btn/permissions', {});
};

export const logoutApi = () => {
  return adminHttp.post('/auth/logout');
};

export const getAuthRoleListApi = () => {
  return adminHttp.get<string[]>('/sys-menu/user/roles', {});
};

export const getChallengeApi = () => {
  return adminHttp.get<ChallengeInfo>('/common/auth/challenge', {});
};
