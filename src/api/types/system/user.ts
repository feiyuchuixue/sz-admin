// 登录模块
import type { IPageQuery } from '@/api/types';

export type UserQuery = IPageQuery & {
  username?: string;
  phone?: string;
  accountStatusCd?: string;
  startDate?: string;
  endDate?: string;
  nickname?: string;
  deptId?: number;
  isThisDeep?: boolean;
};

export type UserForm = {
  id?: number;
  username?: string;
  pwd?: string;
  phone: string;
  nickname: string;
  logo: string;
  age: number;
  sex: number;
  idCard: string;
  email: string;
  accountStatusCd: string;
  userTagCd: string;
  birthday: string;
};

export type UserInfo = {
  id?: number;
  username: string;
  phone: string;
  nickname: string;
  logo: string;
  age: number;
  sex: number;
  idCard: string;
  email: string;
  accountStatusCd: string;
  userTagCd: string;
  lastLoginTime: string;
  createTime: string;
  updateTime: string;
  delFlag: string;
  birthday: string;
};

export type UserRoleForm = {
  roleIds: number[];
  userId: number;
};

export type UserRoleData = {
  selectIds: number[];
  roleInfoVOS: UserRoleInfo[];
};

export type UserRoleInfo = {
  id: number;
  roleName: string;
};

export type UserPasswordForm = {
  oldPwd: string;
  newPwd: string;
};

export type UserOptions = {
  id: number;
  username: string;
  nickname: string;
};

export type UserTagOptions = {
  userIds: number[];
  userTagCd: string;
};

// 用户基本资料（对应后端 UserProfileVO，/sys-user/profile）
export type UserProfileVO = {
  id: number;
  username: string;
  nickname: string;
  sex: number;
  birthday: string;
  phone: string;
  email: string;
  avatar: string;
};

// 个人资料更新表单（对应后端 SysUserProfileUpdateDTO）
export type UserProfileUpdateForm = {
  nickname: string;
  sex: number;
  birthday: string;
  avatar: string; // 头像 objectKey
};

// 联系方式更新表单（对应后端 SysUserContactUpdateDTO）
export type UserContactUpdateForm = {
  field: 'phone' | 'email';
  value: string;
  password: string;
};

// 联系方式解绑表单（对应后端 SysUserContactUnbindDTO）
export type UserContactUnbindForm = {
  field: 'phone' | 'email';
  password: string;
};
