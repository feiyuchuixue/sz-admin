<template>
  <el-dropdown trigger="click">
    <div class="avatar">
      <img :src="avatarSrc || ''" alt="avatar" />
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item @click="openDialog('infoRef')">
          <el-icon>
            <User />
          </el-icon>
          {{ $t('header.personalData') }}
        </el-dropdown-item>
        <el-dropdown-item @click="openDialog('passwordRef')">
          <el-icon>
            <Edit />
          </el-icon>
          {{ $t('header.changePassword') }}
        </el-dropdown-item>
        <el-dropdown-item divided @click="logout">
          <el-icon>
            <SwitchButton />
          </el-icon>
          {{ $t('header.logout') }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
  <!-- infoDialog -->
  <InfoDialog ref="infoRef" />
  <!-- passwordDialog -->
  <PasswordDialog ref="passwordRef" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { LOGIN_URL } from '@/config';
import { useRouter } from 'vue-router';
import { logoutApi } from '@/api/modules/system/login';
import { useUserStore } from '@/stores/modules/user';
import { useAuthStore } from '@/stores/modules/auth';
import InfoDialog from './InfoDialog.vue';
import PasswordDialog from './PasswordDialog.vue';
import { Edit, SwitchButton, User } from '@element-plus/icons-vue';
import { useSocketStore } from '@/stores/modules/socket/socket';
import { ElMessage, ElMessageBox } from 'element-plus';
import defaultAvatar from '@/assets/images/avatar.gif';
import { getOssPreviewUrl } from '@/utils/oss';

const router = useRouter();
const userStore = useUserStore();
const socketStore = useSocketStore();
const authStore = useAuthStore();
const avatarSrc = ref<string | null>(null);
/**
 * 预加载图片，判断图片是否可以正常加载
 * @param url
 */
const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject();
    img.src = url;
  });
};

/**
 * 根据用户信息中的 logo 设置头像：
 * - 如果是默认头像：直接使用本地 defaultAvatar
 * - 如果有自定义 logo：先通过 getOssPreviewUrl 做一次私有地址转换，再预加载
 */
const resolveAvatar = async () => {
  const rawLogo = userStore.userInfo.logo;

  // 无头像或就是默认头像：直接使用默认
  if (!rawLogo || rawLogo === defaultAvatar) {
    avatarSrc.value = defaultAvatar;
    return;
  }

  try {
    // 对用户自定义头像做一次私有地址转换（兼容 MinIO / 其他私有 OSS）
    const previewUrl = (await getOssPreviewUrl(rawLogo)) || rawLogo;

    await preloadImage(previewUrl);
    avatarSrc.value = previewUrl;
  } catch (error) {
    console.error(`Error loading avatar image`, error);
    avatarSrc.value = defaultAvatar;
  }
};

// 退出登录
const logout = () => {
  ElMessageBox.confirm('您是否确认退出登录?', '温馨提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    // 1.执行退出登录接口
    await logoutApi();

    // 2.清除 Token
    userStore.clear();
    authStore.clear();
    // 关闭socket
    socketStore.close();

    // 3.重定向到登陆页
    router.replace(LOGIN_URL);
    ElMessage.success('退出登录成功！');
  });
};

// 打开修改密码和个人信息弹窗
const infoRef = ref<InstanceType<typeof InfoDialog>>();
const passwordRef = ref<InstanceType<typeof PasswordDialog>>();
const openDialog = (refName: 'infoRef' | 'passwordRef') => {
  if (refName === 'infoRef') infoRef.value?.openDialog();
  if (refName === 'passwordRef') passwordRef.value?.openDialog();
};

// 初始化头像
resolveAvatar();

// 如果用户信息里的 logo 发生变化（比如修改个人资料后），自动刷新头像
watch(
  () => userStore.userInfo.logo,
  () => {
    resolveAvatar();
  }
);
</script>

<style scoped lang="scss">
.avatar {
  width: 40px;
  height: 40px;
  overflow: hidden;
  cursor: pointer;
  border-radius: 50%;

  img {
    width: 100%;
    height: 100%;
  }
}
</style>
