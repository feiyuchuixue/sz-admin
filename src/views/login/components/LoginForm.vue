<template>
  <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" size="large">
    <el-form-item prop="username">
      <el-input v-model="loginForm.username" placeholder="用户名： admin">
        <template #prefix>
          <el-icon class="el-input__icon">
            <user />
          </el-icon>
        </template>
      </el-input>
    </el-form-item>
    <el-form-item prop="password" style="margin-bottom: 0">
      <el-input
        v-model="loginForm.password"
        type="password"
        placeholder="密码： sz123456"
        show-password
        autocomplete="new-password"
      >
        <template #prefix>
          <el-icon class="el-input__icon">
            <lock />
          </el-icon>
        </template>
      </el-input>
    </el-form-item>
  </el-form>
  <div class="login-btn">
    <el-button :icon="CircleClose" round size="large" @click="resetForm"> 重置 </el-button>
    <el-button :icon="UserFilled" round size="large" type="primary" :loading="loading" @click="login"> 登录 </el-button>
  </div>
  <div v-if="IS_PREVIEW" style="margin-top: 20px; color: var(--el-color-warning)">
    <span>如无法登陆请联系作者：feiyuchuixue@163.com</span>
  </div>
  <SliderCaptcha ref="captchaRef" @success="onSliderSuccess" @close="onCaptchaClose" />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { HOME_URL, IS_PREVIEW } from '@/config';
import { getTimeState } from '@/utils';
import { loginApi } from '@/api/modules/system/login';
import { useUserStore } from '@/stores/modules/user';
import { useTabsStore } from '@/stores/modules/tabs';
import { useKeepAliveStore } from '@/stores/modules/keepAlive';
import { CircleClose, Lock, User, UserFilled } from '@element-plus/icons-vue';
import { initDynamicRouter } from '@/router/modules/dynamicRouter';

import { onMounted, reactive, ref } from 'vue';
import { ElNotification } from 'element-plus';
import SliderCaptcha from '@/components/Captcha/SliderCaptcha.vue';
import { getCaptchaStatus } from '@/api/modules/system/captcha';
const router = useRouter();
const userStore = useUserStore();
const tabsStore = useTabsStore();
const keepAliveStore = useKeepAliveStore();

const loginFormRef = ref();
const loginRules = reactive({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
});

const loading = ref(false);
const loginForm = reactive({
  username: '',
  password: '',
  clientId: '',
  grantType: ''
});

const onSliderSuccess = async () => {
  await performLogin();
};

const performLogin = async () => {
  loading.value = true;
  try {
    const { data } = await loginApi({ ...loginForm });
    userStore.setToken(data.accessToken);
    userStore.setUserInfo(data.userInfo);

    await initDynamicRouter();

    tabsStore.closeMultipleTab();
    keepAliveStore.setKeepAliveName();

    router.push(HOME_URL);
    ElNotification({
      title: getTimeState(),
      message: '欢迎登录 Sz-Admin',
      type: 'success',
      duration: 3000
    });
  } finally {
    loading.value = false;
  }
};
const captchaRef = ref<InstanceType<typeof SliderCaptcha>>();
const login = () => {
  if (!loginFormRef.value) {
    return;
  }
  loginFormRef.value.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }
    try {
      loading.value = true;
      const { data } = await getCaptchaStatus(); // 获取验证码状态
      if (data) {
        captchaRef.value?.acceptParams(); // 打开验证码弹窗
      } else {
        await performLogin(); // 执行登录
      }
    } finally {
      loading.value = false;
    }
  });
};

const resetForm = () => {
  if (!loginFormRef.value) return;
  loginFormRef.value.resetFields();
};
const onCaptchaClose = () => {
  resetForm();
};

onMounted(() => {
  document.onkeydown = (e: KeyboardEvent) => {
    e = (window.event as KeyboardEvent) || e;
    if (e.code === 'Enter' || e.code === 'enter' || e.code === 'NumpadEnter') {
      if (loading.value || captchaRef.value?.dialogVisible) return;
      login();
    }
  };
});
</script>

<style scoped lang="scss">
@import '../index.scss';
</style>
