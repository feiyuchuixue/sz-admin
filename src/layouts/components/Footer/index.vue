<template>
  <div class="footer flx-center">
    <a href="https://szadmin.cn" target="_blank">
      Sz-Admin v{{ getVersion() }} | Copyright © 2022-{{ new Date().getFullYear() }} 升职哦（sz）
    </a>
  </div>
</template>
<script setup lang="ts">
import PackageJson from 'package.json';
const getVersion = () => {
  return PackageJson.version;
};
</script>
<style scoped lang="scss">
@import './index.scss';
</style>
