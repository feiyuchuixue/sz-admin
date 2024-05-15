import type { Options } from '@/config/typings'

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
  }
]

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
]

export const htmlTypeOptions: Options[] = [
  {
    label: 'input',
    value: 'input'
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
    label: 'radio',
    value: 'radio'
  },
  {
    label: 'checkbox',
    value: 'checkbox'
  },
  {
    label: 'datetime',
    value: 'datetime'
  },
  {
    label: 'date',
    value: 'date'
  },
  {
    label: 'time',
    value: 'time'
  },
  {
    label: 'imageUpload',
    value: 'imageUpload'
  },
  {
    label: 'fileUpload',
    value: 'fileUpload'
  },
  {
    label: 'editor',
    value: 'editor'
  }
]
