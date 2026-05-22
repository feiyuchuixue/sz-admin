import { adminHttp } from '@/api/client';
import type {
  UserQuery,
  UserInfo,
  UserForm,
  UserRoleData,
  UserRoleForm,
  UserPasswordForm,
  UserTagOptions,
  UserProfileVO,
  UserProfileUpdateForm,
  UserContactUpdateForm,
  UserContactUnbindForm
} from '@/api/types/system/user';
import type { IPage } from '@/api/types';
import type { SysDeptDeptSetting, SysDeptTree } from '@/api/types/system/dept';

/**
 * 鑾峰彇鐢ㄦ埛鍒楄〃
 * @param params
 * @returns {*}
 */
export const getUserList = (params: UserQuery) => {
  return adminHttp.get<IPage<UserInfo>>(`/sys-user`, params);
};

/**
 * 娣诲姞鐢ㄦ埛
 * @param params
 * @returns {*}
 */
export const addUser = (params: UserForm) => {
  return adminHttp.post(`/sys-user`, params);
};

/**
 * 淇敼鐢ㄦ埛
 * @param params
 * @returns {*}
 */
export const editUser = (params: UserForm) => {
  return adminHttp.put(`/sys-user`, params);
};

/**
 * 鍒犻櫎鐢ㄦ埛
 * @param params
 * @returns {*}
 */
export const deleteUser = (params: { ids: number[] }) => {
  return adminHttp.delete(`/sys-user`, params);
};

/**
 * 鑾峰彇鐢ㄦ埛瑙掕壊
 * @param params
 * @returns {*}
 */
export const getUserRole = (params: { userId: number }) => {
  return adminHttp.get<UserRoleData>(`/sys-user/role`, params);
};

/**
 * 璁剧疆鐢ㄦ埛瑙掕壊
 * @param params
 * @returns {*}
 */
export const setUserRole = (params: UserRoleForm) => {
  return adminHttp.put(`/sys-user/role`, params);
};

/**
 * 锛堜釜浜猴級淇敼瀵嗙爜
 * @param params
 * @returns {*}
 */
export const changePassword = (params: UserPasswordForm) => {
  return adminHttp.put(`/sys-user/password`, params);
};

/**
 * 閲嶇疆瀵嗙爜
 * @param params
 */
export const resetPassword = (params: { id: number }) => {
  const { id } = params;
  return adminHttp.put(`/sys-user/reset/password/${id}`, {});
};

/**
 * 鑾峰彇鐧诲綍鐢ㄦ埛淇℃伅
 * @returns {*}
 */
export const getUserinfo = () => {
  return adminHttp.get<UserInfo>(`/sys-user/userinfo`);
};

/**
 * 娣诲姞
 * @param params
 * @returns {*}
 */
export const bindUserDeptApi = (params: SysDeptDeptSetting) => {
  return adminHttp.post(`/sys-user/dept/bind`, params);
};

/**
 * 鐢ㄦ埛閮ㄩ棬灞炴€у垪琛? */
export const getUserDeptTree = () => {
  return adminHttp.get<SysDeptTree[]>(`/sys-user/dept/tree`);
};

/**
 * 瑙ｉ攣鐢ㄦ埛
 * @param params
 * @returns {*}
 */
export const unlockUser = (params: { ids: (string | number)[] }) => {
  return adminHttp.post(`/sys-user/unlock`, params);
};

/**
 * 鑾峰彇璇︽儏
 * @param params
 * @returns {*}
 */
export const getUserDetailApi = (params: { id: string }) => {
  const { id } = params;
  return adminHttp.get<UserInfo>(`/sys-user/${id}`);
};

/**
 * 鑾峰彇鐢ㄦ埛鏁版嵁瑙掕壊
 * @param params
 * @returns {*}
 */
export const getDataUserRole = (params: { userId: number }) => {
  return adminHttp.get<UserRoleData>(`/sys-user/datarole`, params);
};

/**
 * 璁剧疆鐢ㄦ埛绫诲瀷
 * @param params
 */
export const setUserTag = (params: UserTagOptions) => {
  return adminHttp.post(`/sys-user/changeset/usertag`, params);
};

/**
 * 鑾峰彇褰撳墠鐧诲綍鐢ㄦ埛鍩烘湰璧勬枡
 * @returns {*}
 */
export const getUserProfile = () => {
  return adminHttp.get<UserProfileVO>(`/sys-user/profile`);
};

/**
 * 鏇存柊褰撳墠鐧诲綍鐢ㄦ埛鍩烘湰璧勬枡
 * @param params
 */
export const updateUserProfile = (params: UserProfileUpdateForm) => {
  return adminHttp.put(`/sys-user/profile`, params);
};

/**
 * 鏇存柊褰撳墠鐧诲綍鐢ㄦ埛鑱旂郴鏂瑰紡锛堟墜鏈哄彿/閭锛? * @param params
 */
export const updateUserContact = (params: UserContactUpdateForm) => {
  return adminHttp.put(`/sys-user/profile/contact`, params);
};

/**
 * 瑙ｇ粦褰撳墠鐧诲綍鐢ㄦ埛鑱旂郴鏂瑰紡锛堟墜鏈哄彿/閭锛? * @param params
 */
export const unbindUserContact = (params: UserContactUnbindForm) => {
  return adminHttp.delete(`/sys-user/profile/contact`, params);
};
