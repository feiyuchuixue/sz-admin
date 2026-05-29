export type MenuQuery = {
  isShowButton: boolean;
};

export type MenuForm = {
  id?: string | number;
  title?: string;
  pid?: string | number;
  path?: string;
  name?: string;
  icon?: string;
  component?: string;
  redirect?: string;
  sort?: number;
  deep?: number;
  menuTypeCd?: string;
  permissions?: string;
  isHidden?: string;
  hasChildren?: string;
  isLink?: string;
  isFull?: string;
  isAffix?: string;
  isKeepAlive?: string;
};

export type MenuTree = {
  id: string | number;
  pid: string | number;
  title: string;
  children: MenuTree[];
};

export type MenuPermissionQuery = {
  id: string | number;
  permissions: string;
};
