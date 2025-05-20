<template>
  <div class="footer flx-center">
    <a href="https://szadmin.cn" target="_blank">
      Sz-Admin v{{ version }} | Copyright © 2022-{{ new Date().getFullYear() }} 升职哦（sz）
    </a>
  </div>
</template>
<script setup lang="ts">
const version: string = __APP_VERSION__;
</script>
<style scoped lang="scss">
@use './index';
</style>
