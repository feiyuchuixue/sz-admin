export type Pageable = {
  pageNum: number;
  pageSize: number;
  total: number;
};
export type StateProps = {
  tableData: any[];
  pageable: Pageable;
  searchParam: {
    [key: string]: any;
  };
  searchInitParam: {
    [key: string]: any;
  };
  totalParam: {
    [key: string]: any;
  };
  icon?: {
    [key: string]: any;
  };
  loading?: boolean;
};

export type HandleDataMessageType = '' | 'success' | 'warning' | 'info' | 'error';

export type ThemeType = 'light' | 'inverted' | 'dark';
export type GreyOrWeakType = 'grey' | 'weak';
