<template>
  <div class="login-container flx-center">
    <div class="login-box">
      <SwitchDark class="dark" />
      <div class="login-left">
        <img class="login-left-img" src="@/assets/images/login_left3.png" alt="login" />
      </div>
      <div class="login-form">
        <div class="login-logo">
          <img class="login-icon" src="@/assets/images/brand/sz-logo.png" alt="Sz Admin logo" />
          <h2 class="logo-text">Sz Admin</h2>
          <p class="logo-desc">基于 Spring Boot 3.x 、Jdk21、Vue 3 的轻量级脚手架</p>
        </div>
        <LoginForm />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SwitchDark from '@/components/SwitchDark/index.vue';
import LoginForm from '@/views/login/components/LoginForm.vue';
</script>

<style scoped lang="scss">
@use './index';
</style>
