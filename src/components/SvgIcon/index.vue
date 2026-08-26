<template>
  <span v-if="svgContent" class="svg-icon" :style="iconStyle" aria-hidden="true" v-html="svgContent" />
</template>

<script setup lang="ts">
defineOptions({
  name: 'SvgIcon'
});
import type { CSSProperties } from 'vue';
import { computed } from 'vue';

const svgModules = import.meta.glob<string>('@/assets/icons/**/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default'
});

const svgIcons = Object.entries(svgModules).reduce<Record<string, string>>((icons, [path, source]) => {
  const iconPath = path.split('/assets/icons/').pop();
  if (!iconPath) return icons;

  const svgStart = source.indexOf('<svg');
  const svgEnd = source.lastIndexOf('</svg>');
  if (svgStart === -1 || svgEnd === -1) return icons;

  const iconName = iconPath.replace(/\.svg$/, '').replace(/\//g, '-');
  icons[iconName] = source.slice(svgStart, svgEnd + '</svg>'.length);
  return icons;
}, {});

interface SvgProps {
  name: string; // 图标的名称 ==> 必传
  prefix?: string; // 图标的前缀 ==> 非必传（默认为"icon"）
  iconStyle?: CSSProperties; // 图标的样式 ==> 非必传
  width?: number;
  height?: number;
}

const props = withDefaults(defineProps<SvgProps>(), {
  prefix: 'icon',
  width: 16,
  height: 16
});

const svgContent = computed(() => svgIcons[props.name] || '');

const iconStyle = computed(() => ({
  width: `${props.width}px`,
  height: `${props.height}px`,
  fill: 'var(--color)'
}));
</script>

<style scoped>
.svg-icon {
  display: inline-flex;
  line-height: 1;
}

.svg-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
