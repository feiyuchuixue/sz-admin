import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { LoginParams, LoginInfo, ChallengeInfo } from '@/api/types/system/login';

// 用户登录
export const loginApi = (params: LoginParams) => {
  params.grantType = 'password';
  params.clientId = import.meta.env.VITE_APP_CLIENT_ID;
  return http.post<LoginInfo>(ADMIN_MODULE + `/auth/login`, params); // 正常 post json 请求  ==>  application/json
  // return http.post(`/login`, params, { loading: false }); // 控制当前请求不显示 loading
  // return http.post(`/login`, {}, { params }); // post 请求携带 query 参数  ==>  ?username=admin&password=123456
  // return http.post(`/login`, qs.stringify(params)); // post 请求携带表单参数  ==>  application/x-www-form-urlencoded
  // return http.get(`/login?${qs.stringify(params, { arrayFormat: "repeat" })}`); // get 请求可以携带数组等复杂参数
};

// 获取菜单列表
export const getAuthMenuListApi = () => {
  return http.get<Menu.MenuOptions[]>(ADMIN_MODULE + `/sys-menu/menu`, {});
};

// 获取按钮权限
export const getAuthButtonListApi = () => {
  return http.get<string[]>(ADMIN_MODULE + `/sys-menu/btn/permissions`, {});
};

// 用户退出登录
export const logoutApi = () => {
  return http.post(ADMIN_MODULE + `/auth/logout`);
};

// 获取用户角色
export const getAuthRoleListApi = () => {
  return http.get<string[]>(ADMIN_MODULE + `/sys-menu/user/roles`, {});
};

// 获取一次性认证参数
export const getChallengeApi = () => {
  return http.get<ChallengeInfo>(ADMIN_MODULE + `/common/auth/challenge`, {});
};
