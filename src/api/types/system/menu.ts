export type MenuQuery = {
  isShowButton: boolean;
};

export type MenuForm = {
  id?: string;
  title?: string;
  pid?: string;
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
  id: string;
  pid: string;
  title: string;
  children: MenuTree[];
};

export type MenuPermissionQuery = {
  id: string;
  permissions: string;
};
