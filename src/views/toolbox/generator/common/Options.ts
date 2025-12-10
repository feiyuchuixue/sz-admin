import type { Options } from '@/config/typings';

export const javaTypeOptions: Options[] = [
  {
    label: 'String',
    value: 'String'
  },
  {
    label: 'Integer',
    value: 'Integer'
  },
  {
    label: 'Long',
    value: 'Long'
  },
  {
    label: 'Double',
    value: 'Double'
  },
  {
    label: 'BigDecimal',
    value: 'BigDecimal'
  },
  {
    label: 'LocalDateTime',
    value: 'LocalDateTime'
  },
  {
    label: 'LocalDate',
    value: 'LocalDate'
  },
  {
    label: 'LocalTime',
    value: 'LocalTime'
  },
  {
    label: 'List<UploadResult>',
    value: 'List<UploadResult>'
  }
];

export const queryTypeOptions: Options[] = [
  {
    label: '等于',
    value: 'EQ'
  },
  {
    label: '不等于',
    value: 'NEQ'
  },
  {
    label: '大于',
    value: 'GT'
  },
  {
    label: '小于',
    value: 'LT'
  },
  {
    label: '范围',
    value: 'BETWEEN'
  },
  {
    label: '大于等于',
    value: 'GTE'
  },
  {
    label: '小于等于',
    value: 'LTE'
  },
  {
    label: '模糊',
    value: 'LIKE'
  }
];

export const htmlTypeOptions: Options[] = [
  {
    label: 'input',
    value: 'input'
  },
  {
    label: 'input-number',
    value: 'input-number'
  },
  {
    label: 'textarea',
    value: 'textarea'
  },
  {
    label: 'select',
    value: 'select'
  },
  {
    label: 'datetime ',
    value: 'datetime'
  },
  {
    label: 'fileUpload',
    value: 'fileUpload'
  },
  {
    label: 'jodit-editor',
    value: 'jodit-editor'
  },
  {
    label: 'radio-group [未完待续]',
    value: 'radio-group'
  },
  {
    label: 'checkbox [未完待续]',
    value: 'checkbox'
  },
  {
    label: 'date [未完待续]',
    value: 'date'
  },
  {
    label: 'time [未完待续]',
    value: 'time'
  },
  {
    label: 'imageUpload [未完待续]',
    value: 'imageUpload'
  }
];

export const dictShowWayOptions: Options[] = [
  {
    label: '唯一标识',
    value: '0'
  },
  {
    label: '别名',
    value: '1'
  }
];
