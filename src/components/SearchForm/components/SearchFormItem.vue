<template>
  <component
    :is="column.render ?? `el-${column.el}`"
    v-bind="{ ...handleSearchProps, ...placeholder, searchParam: _searchParam, clearable }"
    v-model.trim="_searchParam[column.key ?? handleProp(column.prop!)]"
    :data="column.el === 'tree-select' ? columnEnum : []"
    :options="['cascader', 'select-v2'].includes(column.el!) ? columnEnum : []"
  >
    <template v-if="column.el === 'cascader'" #default="{ data }">
      <span>{{ data[fieldNames.label] }}</span>
    </template>
    <template v-if="column.el === 'select'">
      <component
        :is="`el-option`"
        v-for="(col, index) in columnEnum"
        :key="index"
        :label="col[fieldNames.label]"
        :value="col[fieldNames.value]"
      />
    </template>
    <slot v-else />
  </component>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { handleProp } from '@/utils';
import type { SearchProps } from '@/components/ProTable/interface';

defineOptions({
  name: 'SearchFormItem'
});
interface SearchFormItem {
  column: SearchProps;
  searchParam: { [key: string]: any };
}
const props = defineProps<SearchFormItem>();

// Re receive SearchParam
const _searchParam = computed(() => props.searchParam);

// 判断 fieldNames 设置 label && value && children 的 key 值
const fieldNames = computed(() => {
  return {
    label: props.column.fieldNames?.label ?? 'label',
    value: props.column.fieldNames?.value ?? 'value',
    children: props.column.fieldNames?.children ?? 'children'
  };
});

// 接收 enumMap (el 为 select-v2 需单独处理 enumData)
const enumMap = inject('enumMap', ref(new Map()));
const resolveEnumFromColumn = (column: SearchProps): any[] => {
  const src = column.enum;
  if (!src) return [];

  // Ref<EnumProps[]>
  if (typeof src === 'object' && 'value' in src) {
    return src.value || [];
  }

  // 数组
  if (Array.isArray(src)) {
    return src;
  }

  // 函数（异步枚举），这里通常在 ProTable 里统一处理并塞入 enumMap
  if (typeof src === 'function') {
    console.warn('[SearchFormItem] enum is function, please resolve it in ProTable and provide via enumMap');
    return [];
  }

  return [];
};

const columnEnum = computed(() => {
  // 1. 优先使用搜索项自己写的 enum
  let enumData: any[] = resolveEnumFromColumn(props.column);

  // 2. 如果当前 column 没有 enum，再从 enumMap 里取通用配置（由 ProTable/columns 提供）
  if ((!enumData || !enumData.length) && props.column.prop) {
    const fromMap = (enumMap.value as Map<string, any[]>).get(props.column.prop);
    if (fromMap) {
      if (Array.isArray(fromMap)) {
        enumData = fromMap;
      } else {
        console.warn('[SearchFormItem] enumMap value is not array', {
          prop: props.column.prop,
          value: fromMap
        });
      }
    }
  }

  // 兜底：不是数组或为空直接返回 []
  if (!Array.isArray(enumData) || !enumData.length) return [];

  // 如果当前字段名是默认的 label/value，
  //  但数据长得像 { id, codeName }，尝试自动映射一次
  const { label, value } = fieldNames.value;
  if (label === 'label' && value === 'value') {
    const hasCodeNameIdShape = enumData.some((item: any) => 'codeName' in item && 'id' in item);

    if (hasCodeNameIdShape) {
      enumData = enumData.map((item: any) => ({
        ...item,
        label: item.codeName,
        value: item.id
      }));
    }
  }

  // 3. 针对 select-v2，按 fieldNames 转成 Element Plus 需要的 { label, value }
  if (props.column.el === 'select-v2') {
    const { label: fLabel, value: fValue } = fieldNames.value;
    enumData = enumData.map((item: Record<string, any>) => ({
      ...item,
      label: item[fLabel],
      value: item[fValue]
    }));
  }

  return enumData;
});

// 处理透传的 searchProps (el 为 tree-select、cascader 的时候需要给下默认 label && value && children)
const handleSearchProps = computed(() => {
  const label = fieldNames.value.label;
  const value = fieldNames.value.value;
  const children = fieldNames.value.children;
  const searchEl = props.column.el;
  let searchProps = props.column.props ?? {};
  if (searchEl === 'tree-select') {
    searchProps = {
      ...searchProps,
      props: { ...searchProps.props, label, children },
      nodeKey: value
    };
  }
  if (searchEl === 'cascader') {
    searchProps = { ...searchProps, props: { ...searchProps.props, label, value, children } };
  }
  return searchProps;
});

// 处理默认 placeholder
const placeholder = computed(() => {
  const search = props.column;
  if (['datetimerange', 'daterange', 'monthrange'].includes(search?.props?.type) || search?.props?.isRange) {
    return { rangeSeparator: '至', startPlaceholder: '开始时间', endPlaceholder: '结束时间' };
  }
  const placeholder = search?.props?.placeholder ?? (search?.el?.includes('input') ? '请输入' : '请选择');
  return { placeholder };
});

// 是否有清除按钮 (当搜索项有默认值时，清除按钮不显示)
const clearable = computed(() => {
  const search = props.column;
  return search?.props?.clearable ?? (search?.defaultValue === null || search?.defaultValue === undefined);
});
</script>
