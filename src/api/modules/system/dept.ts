import http from '@/api';
import { ADMIN_MODULE } from '@/api/helper/prefix';
import type { IPage } from '@/api/types';
import type {
  SysDeptQuery,
  SysDeptRow,
  SysDeptForm,
  SysDeptTree,
  SysDeptLeaderData,
  SysDeptDept,
  DeptRoleData,
  DeptRoleForm
} from '@/api/types/system/dept';

/**
 * 查询列表
 * @param params
 * @returns {*}
 */
export const getSysDeptListApi = (params: SysDeptQuery) => {
  return http.get<IPage<SysDeptRow>>(ADMIN_MODULE + `/sys-dept`, params);
};

/**
 * 添加
 * @param params
 * @returns {*}
 */
export const createSysDeptApi = (params: SysDeptForm) => {
  return http.post(ADMIN_MODULE + `/sys-dept`, params);
};

/**
 * 修改
 * @param params
 * @returns {*}
 */
export const updateSysDeptApi = (params: SysDeptForm) => {
  return http.put(ADMIN_MODULE + `/sys-dept`, params);
};

/**
 * 删除
 * @param params
 * @returns {*}
 */
export const removeSysDeptApi = (params: { ids: number[] }) => {
  return http.delete(ADMIN_MODULE + `/sys-dept`, params);
};

/**
 * 获取详情
 * @param params
 * @returns {*}
 */
export const getSysDeptDetailApi = (params: { id: number }) => {
  const { id } = params;
  return http.get<SysDeptRow>(ADMIN_MODULE + `/sys-dept/${id}`);
};

/**
 * 获取上级菜单树
 * @param params
 * @returns {*}
 */
export const getMenuTree = (params: { excludeNodeId?: number; appendRoot?: boolean }) => {
  return http.get<SysDeptTree[]>(ADMIN_MODULE + `/sys-dept/tree`, params);
};

/**
 * 获取部门负责人关系
 * @param params
 * @returns {*}
 */
export const getSysDeptLeaderApi = () => {
  return http.get<SysDeptLeaderData>(ADMIN_MODULE + `/sys-dept/leader`);
};

/**
 * 获取部门树
 * @param params
 * @returns {*}
 */
export const getDeptTrees = (params: { deptId?: number }) => {
  return http.get<SysDeptDept>(ADMIN_MODULE + `/sys-dept/datascope`, params);
};

/**
 * 获取部门角色
 * @param params
 * @returns {*}
 */
export const getDeptRole = (params: { deptId: number }) => {
  return http.get<DeptRoleData>(ADMIN_MODULE + `/sys-dept/role`, params);
};

/**
 * 设置部门角色
 * @param params
 * @returns {*}
 */
export const setDeptRole = (params: DeptRoleForm) => {
  return http.put(ADMIN_MODULE + `/sys-dept/role`, params);
};
