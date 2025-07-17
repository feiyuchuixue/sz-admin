import type { IPage, IPageQuery } from '@/api/types';

export type UserItem = {
  id: number;
  username: string;
  name: string;
  phone: string;
};

export type DepartmentItem = {
  id: number;
  pid: number;
  name: string;
  deep: number;
  sort: number;
  children?: DepartmentItem[];
};

export type RoleItem = {
  id: number;
  name: string;
  permissions: string;
};

export type SelectorType = 'user' | 'department' | 'role';

export type SelectorResult =
  | {
      type: SelectorType;
      data: IPage<UserItem>;
    }
  | {
      type: SelectorType;
      data: DepartmentItem[];
    }
  | {
      type: SelectorType;
      data: IPage<RoleItem>;
    };

export type SelectorQuery = IPageQuery & {
  type: SelectorType;
  keyword?: string;
  parentId?: any;
};
