import { adminHttp } from '@/api/client';
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
 * 鏌ヨ鍒楄〃
 * @param params
 * @returns {*}
 */
export const getSysDeptListApi = (params: SysDeptQuery) => {
  return adminHttp.get<IPage<SysDeptRow>>(`/sys-dept`, params);
};

/**
 * 娣诲姞
 * @param params
 * @returns {*}
 */
export const createSysDeptApi = (params: SysDeptForm) => {
  return adminHttp.post(`/sys-dept`, params);
};

/**
 * 淇敼
 * @param params
 * @returns {*}
 */
export const updateSysDeptApi = (params: SysDeptForm) => {
  return adminHttp.put(`/sys-dept`, params);
};

/**
 * 鍒犻櫎
 * @param params
 * @returns {*}
 */
export const removeSysDeptApi = (params: { ids: number[] }) => {
  return adminHttp.delete(`/sys-dept`, params);
};

/**
 * 鑾峰彇璇︽儏
 * @param params
 * @returns {*}
 */
export const getSysDeptDetailApi = (params: { id: number }) => {
  const { id } = params;
  return adminHttp.get<SysDeptRow>(`/sys-dept/${id}`);
};

/**
 * 鑾峰彇涓婄骇鑿滃崟鏍? * @param params
 * @returns {*}
 */
export const getMenuTree = (params: { excludeNodeId?: number; appendRoot?: boolean }) => {
  return adminHttp.get<SysDeptTree[]>(`/sys-dept/tree`, params);
};

/**
 * 鑾峰彇閮ㄩ棬璐熻矗浜哄叧绯? * @param params
 * @returns {*}
 */
export const getSysDeptLeaderApi = () => {
  return adminHttp.get<SysDeptLeaderData>(`/sys-dept/leader`);
};

/**
 * 鑾峰彇閮ㄩ棬鏍? * @param params
 * @returns {*}
 */
export const getDeptTrees = (params: { deptId?: number }) => {
  return adminHttp.get<SysDeptDept>(`/sys-dept/datascope`, params);
};

/**
 * 鑾峰彇閮ㄩ棬瑙掕壊
 * @param params
 * @returns {*}
 */
export const getDeptRole = (params: { deptId: number }) => {
  return adminHttp.get<DeptRoleData>(`/sys-dept/role`, params);
};

/**
 * 璁剧疆閮ㄩ棬瑙掕壊
 * @param params
 * @returns {*}
 */
export const setDeptRole = (params: DeptRoleForm) => {
  return adminHttp.put(`/sys-dept/role`, params);
};
