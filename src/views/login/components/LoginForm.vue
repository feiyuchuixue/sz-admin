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
    <el-form-item prop="code" v-if="slideData.slideAuth" style="margin-top: 40px; position: relative">
        <el-button 
          ref="sliderBtn" 
          size="large" 
          :type="slideData.isSuccess ? 'success': ''" 
          :disabled="slideData.isSuccess" 
          @click="confirmOpenSlide" 
          style='width:100%'
        >{{slideData.isSuccess ? '验证成功':'点击滑块验证'}}</el-button>
        <div class="sliderBox" v-show='slideData.exhibit'>
          <div class="sliderBox_title noselect">
            滑动拼图，进行验证
            <span class="sliderBox_close" @click="sliderClose"> 
              <el-icon class="el-input__icon"><close /></el-icon>
            </span>
            <span class="sliderBox_refresh" @click="refreshSlider()">
              <el-icon class="el-input__icon"><refresh /></el-icon>
            </span>
          </div>
          <div class="sliderBox_content noselect">
            <img :src="'data:image/png;base64,'+ slideData.big" class="bigImg" />
            <img :src="'data:image/png;base64,'+ slideData.small" class="smallImg" ref="imgK"/>
          </div>
          <div class="btnBox" ref="wrap">
            <div class="sliderBox_btn noselect" ref="slider">| | |</div>
          </div>
        </div>
    </el-form-item>
  </el-form>
  <div class="login-btn">
    <el-button :icon="CircleClose" round size="large" @click="resetForm"> 重置 </el-button>
    <el-button :icon="UserFilled" round size="large" type="primary" :loading="loading" @click="login"> 登录 </el-button>
  </div>
  <div v-if="isPreview()" style="margin-top: 20px; color: var(--el-color-warning)">
    <span>如无法登陆请联系作者：feiyuchuixue@163.com</span>
  </div>

  
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { HOME_URL } from '@/config';
import { getTimeState } from '@/utils';
import { loginApi, getAuthVerifyApi, getImageCodeApi, verifyImageCodeApi } from '@/api/modules/system/login';
import { useUserStore } from '@/stores/modules/user';
import { useTabsStore } from '@/stores/modules/tabs';
import { useKeepAliveStore } from '@/stores/modules/keepAlive';
import { CircleClose, Lock, User, UserFilled, Close, Refresh } from '@element-plus/icons-vue';
import { initDynamicRouter } from '@/router/modules/dynamicRouter';
//import { useOptionsStore } from '@/stores/modules/options'
import { onMounted, onBeforeUnmount, reactive, ref, Directive, nextTick } from 'vue';
import { ElNotification } from 'element-plus';
import { sign } from 'crypto';

const router = useRouter();
const userStore = useUserStore();
const tabsStore = useTabsStore();
const keepAliveStore = useKeepAliveStore();
//const optionsStore = useOptionsStore()

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
  grantType: '',
  movePosX: '', 
  longTime: ''
});

let clear: any = null;
const slider: any = ref(null);
const wrap: any = ref(null);
const imgK: any = ref(null);
const sliderBtn: any = ref(null);
const slideData = reactive({
  big: '',
  small: '',
  longTime: '',
  posY: '',
  exhibit: false,
  isSuccess: false,
  slideAuth: false,
});

// login
const login = () => {
  if (!loginFormRef.value) {
    return;
  }
  loginFormRef.value.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }
    loading.value = true;
    try {
      // 1.执行登录接口
      const { data } = await loginApi({ ...loginForm });
      userStore.setToken(data.accessToken);
      userStore.setUserInfo(data.userInfo);

      // 2.添加动态路由
      await initDynamicRouter();
      /*      optionsStore.setReloadOptions()
      await optionsStore.getAllDictList()*/

      // 3.清空 tabs、keepAlive 数据
      tabsStore.closeMultipleTab();
      keepAliveStore.setKeepAliveName();

      // 4.跳转到首页
      router.push(HOME_URL);
      ElNotification({
        title: getTimeState(),
        message: '欢迎登录 Sz-Admin',
        type: 'success',
        duration: 3000
      });
    } finally {
      loading.value = false;
      refreshSlider()
    }
  });
};

// resetForm
const resetForm = () => {
  if (!loginFormRef.value) return;
  slideData.isSuccess = false;
  loginForm.movePosX = '';
  loginForm.longTime = '';
  loginFormRef.value.resetFields();
};
// 获取滑块验证权限
const getAuthVerify = async () => {
  const data = await getAuthVerifyApi();
  slideData.slideAuth = data;
}
// 校验滑块拼图验证码
const verifyImageCode = async (params) => {
  try {
    const {code} = await verifyImageCodeApi({...params});
    if (code === "0000") {
      loginForm.movePosX = params.movePosX;
      loginForm.longTime = params.longTime;
      slideData.isSuccess = true;
      sliderClose();
    }
  } catch {
    refreshSlider();
  }
}
const confirmOpenSlide = () => {
    if (!slideData.isSuccess) {
      slideData.exhibit = true;
      getSlideData(1);
    }
}
const getSlideData = async (type? : Number) => {
  const {data} = await getImageCodeApi();
  slideData.big = data.bigImageBase64;
  slideData.small = data.smallImageBase64;
  slideData.posY = data.posY;
  slideData.longTime = data.longTime;
  nextTick(() => {
      initSlide(type);
  });
}
const refreshSlider = async () => {
  slideData.isSuccess = false;
  getSlideData();
}
const sliderClose = () => {
  slideData.exhibit = false;
  clear();
}
// type: 1 开启时添加事件  2 刷新
const initSlide = (type? : Number) => {
  // 设置after-inner的固定宽度
  slider.value.style.left = 0;
  imgK.value.style.left = 0;
  imgK.value.style.top = slideData.posY + 'px';
  // 滑块移动最大位置
  const limit = wrap.value.offsetWidth - slider.value.offsetWidth
  // 实时计算滑块的偏移量
  let offsetX: any
  // 点击滑块时的鼠标X位置
  let initX: any
  // // 页面鼠标移动事件
  const docMousemoveHandler = (e: any) => {
    // 获取移动后鼠标实时位置
    const moveX = e.clientX
    // 计算滑块应该移动的偏移量
    offsetX = moveX - initX
    // 限制上下限
    if (offsetX < 0) {
      offsetX = 0
    } else if (offsetX > limit) {
      offsetX = limit
    }
    // 移动滑块
    slider.value.style.left = offsetX + 'px';
    imgK.value.style.left = offsetX + 'px';
    //此处写你要做函数
    if (offsetX >= limit) {
      // success.value = true
      // emit('sliderNo', false)
      document.removeEventListener('mousemove', docMousemoveHandler)
      slider.value.removeEventListener('mousedown', sliderMousedownHandler)
    }
  }
  // 页面鼠标松开事件
  const docMouseupHandler = (e: any) => {
    // 解绑事件
    document.removeEventListener('mousemove', docMousemoveHandler);
    if (offsetX) {
      verifyImageCode({movePosX: offsetX, longTime: slideData.longTime});
      offsetX = 0;
    }
  }
 
  // 滑块点击事件
  const sliderMousedownHandler = (e: any) => {
    // 获取鼠标位置
    initX = e.clientX
    // 绑定页面的鼠标移动事件
    document.addEventListener('mousemove', docMousemoveHandler);
  }
 
  if (type === 1) {
    // 绑定滑块点击事件
    slider.value.addEventListener('mousedown', sliderMousedownHandler)
    // 页面鼠标松开事件
    document.addEventListener('mouseup', docMouseupHandler)
  }
  

  // 定义清理方法
  clear = () => {
    document.removeEventListener('mousemove', docMousemoveHandler);
    slider.value.removeEventListener('mousedown', sliderMousedownHandler);
    document.removeEventListener('mouseup', docMouseupHandler);
  }
}
onMounted(() => {
  // 监听 enter 事件（调用登录）
  document.onkeydown = (e: KeyboardEvent) => {
    e = (window.event as KeyboardEvent) || e;
    if (e.code === 'Enter' || e.code === 'enter' || e.code === 'NumpadEnter') {
      if (loading.value) return;
      login();
    }
  };
  getAuthVerify();
  
});
onBeforeUnmount(() => {
  clear && clear()
})

const isPreview = () => {
  return import.meta.env.VITE_PREVIEW;
};
</script>

<style scoped lang="scss">
@import '../index.scss';
</style>
