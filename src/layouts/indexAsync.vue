<!-- 💥 这里是异步加载 LayoutComponents -->
<template>
  <suspense>
    <template #default>
      <component :is="LayoutComponents[layout]" />
    </template>
    <template #fallback>
      <Loading />
    </template>
  </suspense>
  <ThemeDrawer />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import Loading from '@/components/Loading/index.vue';
import ThemeDrawer from '@/layouts/components/ThemeDrawer/index.vue';
import { useAppStore } from '@/stores/modules/app';
import { useSocketStore } from '@/stores/modules/socket';

defineOptions({
  name: 'LayoutAsync'
});

const LayoutComponents = {
  vertical: defineAsyncComponent(() => import('@/layouts/LayoutVertical/index.vue')),
  classic: defineAsyncComponent(() => import('@/layouts/LayoutClassic/index.vue')),
  transverse: defineAsyncComponent(() => import('@/layouts/LayoutTransverse/index.vue')),
  columns: defineAsyncComponent(() => import('@/layouts/LayoutColumns/index.vue'))
};

const appStore = useAppStore();
const layout = computed(() => appStore.layout);

// 开启socket
const socketStore = useSocketStore();
socketStore.open();
</script>

<style scoped lang="scss">
.layout {
  min-width: 600px;
}
</style>
