// 请求响应参数（不包含data）
export type IResult = {
  code: string;
  message: string;
};

// 请求响应参数（包含data）
export type IResultData<T = any> = IResult & {
  data: T;
};

export type IPage<T = any> = {
  current: number;
  limit: number;
  totalPage: number;
  total: number;
  rows: T[];
  param?: { [key: string]: any } | string;
};

export type IPageQuery = {
  page?: number;
  limit?: number;
};
