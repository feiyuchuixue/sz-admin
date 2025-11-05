<template>
  <RenderTableColumn v-bind="column" />
</template>

<script setup lang="tsx">
import { filterEnum, formatValue, handleProp, handleRowAccordingToProp } from '@/utils';
import { inject, ref, useSlots } from 'vue';
import type { ColumnProps, RenderScope, HeaderRenderScope } from '@/components/ProTable/interface';

type DictItem = Record<string, any>;

defineOptions({
  name: 'TableColumn'
});

defineProps<{ column: ColumnProps }>();

const slots = useSlots();
const enumMap = inject('enumMap', ref(new Map<string, DictItem[]>()));

// 获取 tag 的类型
const getTagType = (val: any, dict: DictItem[] | undefined, fieldNames: { value?: string; tagType?: string }): string => {
  if (!dict || !Array.isArray(dict) || !fieldNames) return 'primary';
  // 兼容 fieldNames.value/tagType 缺失的情况
  const valueKey = fieldNames.value || 'id';
  const tagTypeKey = fieldNames.tagType || 'callbackShowStyle';
  const item = dict.find(d => String(d[valueKey]) === String(val));
  if (item) {
    const type = item[tagTypeKey];
    if (typeof type === 'function') {
      try {
        return type(item) || 'primary';
      } catch {
        return 'primary';
      }
    }
    if (typeof type === 'string' && type) {
      return type;
    }
  }
  return 'primary';
};

// 归一化数据为数组（支持数组、逗号分隔字符串、单值）
const normalizeValues = (val: unknown): any[] => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    if (val.includes(',')) {
      return val
        .split(',')
        .map(str => str.trim())
        .filter(Boolean);
    }
    if (val.trim() === '') return [];
    return [val.trim()];
  }
  return val !== undefined && val !== null && val !== '' ? [val] : [];
};

const renderCellData = (item: ColumnProps, scope: RenderScope<any>) => {
  const rawValue = handleRowAccordingToProp(scope.row, item.prop!);

  // 优先判断 enum 字典，优先用 item.enum，回退到全局 enumMap
  const dict = item.enum && Array.isArray(item.enum) && item.enum.length > 0 ? item.enum : enumMap.value.get(item.prop as string);

  const fieldNames = item.fieldNames || {};
  const values = normalizeValues(rawValue);

  if (dict && Array.isArray(dict) && dict.length > 0) {
    // tag===true 时，走 tag 渲染
    if (item.tag) {
      if (!values || values.length === 0) {
        return <span class="tag-empty">--</span>;
      }
      const tagLimit = typeof item.tagLimit === 'number' ? item.tagLimit : 3;
      const displayedTags = tagLimit === -1 ? values : values.slice(0, tagLimit);
      const hiddenTags = tagLimit === -1 ? [] : values.slice(tagLimit);

      const tagNodes = displayedTags.map((val: any) => {
        const label = filterEnum(val, dict, fieldNames);
        const tagType = getTagType(val, dict, fieldNames);
        return (
          <el-tag type={tagType} class="tag-item" key={val}>
            {label}
          </el-tag>
        );
      });

      if (hiddenTags.length > 0) {
        tagNodes.push(
          <el-popover
            placement="top"
            width={200}
            trigger="hover"
            content={hiddenTags.map((val: any) => filterEnum(val, dict, fieldNames)).join(', ')}
          >
            {{
              reference: () => (
                <el-tag class="tag-item" type="info">
                  +{hiddenTags.length}
                </el-tag>
              )
            }}
          </el-popover>
        );
      }

      return <div class="tag-container">{tagNodes}</div>;
    } else {
      // 未设置 tag，仅字典翻译展示（支持数组和逗号分隔字符串）
      if (!values || values.length === 0) {
        return <span class="tag-empty">--</span>;
      }
      // 翻译所有值，用逗号连接
      const displayStr = values.map((val: any) => filterEnum(val, dict, fieldNames)).join(', ');
      return <span>{displayStr}</span>;
    }
  }

  // 没有字典，仅 tag 展示（原始值）
  if (item.tag) {
    if (rawValue === null || rawValue === undefined || rawValue === '' || (Array.isArray(rawValue) && rawValue.length === 0)) {
      return <span class="tag-empty">--</span>;
    }
    const label = formatValue(rawValue);
    return (
      <el-tag type="primary" class="tag-item">
        {label}
      </el-tag>
    );
  }

  // 没有 tag，没有字典，直接原样展示
  return formatValue(rawValue);
};

const RenderTableColumn = (item: ColumnProps) => {
  return (
    <>
      {item.isShow && (
        <el-table-column
          {...item}
          align={item.align ?? 'center'}
          showOverflowTooltip={item.showOverflowTooltip ?? item.prop !== 'operation'}
        >
          {{
            default: (scope: RenderScope<any>) => {
              if (item._children) return item._children.map(child => RenderTableColumn(child));
              if (item.render) return item.render(scope);
              if (slots[handleProp(item.prop!)]) return slots[handleProp(item.prop!)]!(scope);
              return renderCellData(item, scope);
            },
            header: (scope: HeaderRenderScope<any>) => {
              if (item.headerRender) return item.headerRender(scope);
              if (slots[`${handleProp(item.prop!)}Header`]) return slots[`${handleProp(item.prop!)}Header`]!(scope);
              return item.label;
            }
          }}
        </el-table-column>
      )}
    </>
  );
};
</script>

<style>
.tag-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: center;
}
.tag-empty {
  color: #bbb;
  display: inline-block;
  width: 100%;
  text-align: center;
}
</style>
