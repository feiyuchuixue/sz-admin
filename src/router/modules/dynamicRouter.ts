import { useUserStore } from '@/stores/modules/user';
import { useAuthStore } from '@/stores/modules/auth';
import { useOptionsStore } from '@/stores/modules/options';
import { LOGIN_URL } from '@/config';
import router from '@/router';
import type { RouteRecordRaw } from 'vue-router';
import { useConfigStore } from '@/stores/modules/config';
import { getUserProfile } from '@/api/modules/system/user';
import { resolveMenuComponent } from '@/core/module';

/**
 * @description 初始化动态路由
 */
export const initDynamicRouter = async () => {
  const userStore = useUserStore();
  const authStore = useAuthStore();
  const optionsStore = useOptionsStore();
  const configStore = useConfigStore();

  try {
    if (authStore.isLoaded) return;
    // 1.获取用户基本资料
    const profileRes = await getUserProfile();
    userStore.setProfile(profileRes.data);

    // 2.获取菜单列表 && 按钮权限列表 && 字典列表
    await authStore.getAuthMenuList();
    await authStore.getAuthButtonList();
    await authStore.getAuthRoleList();
    optionsStore.setReloadOptions();
    await optionsStore.getAllDictList();
    await authStore.setLoaded();
    configStore.setReload();
    await configStore.getConfig();

    // 2.判断当前用户有没有菜单权限
    // if (!authStore.authMenuListGet.length) {
    //   ElNotification({
    //     title: '无权限访问',
    //     message: '当前账号无任何菜单权限，请联系系统管理员！',
    //     type: 'warning',
    //     duration: 3000
    //   })
    //   userStore.setToken('')
    //   router.replace(LOGIN_URL)
    //   return Promise.reject('No permission')
    // }

    // 3.添加动态路由
    authStore.flatMenuListGet.forEach(item => {
      if (item.children) delete item.children;

      if (item.component && typeof item.component === 'string') {
        const comp = resolveMenuComponent(item.component);
        if (!comp) {
          // 组件未命中（例如后端在当前 edition 中误下发了企业菜单），跳过该菜单
          console.warn(`[dynamicRouter] 菜单组件未命中，已跳过：${item.component}（菜单：${item.name}）`);
          return;
        }
        item.component = comp as any;
      }

      if (item.meta.isFull === 'T') {
        router.addRoute(item as unknown as RouteRecordRaw);
      } else {
        router.addRoute('layout', item as unknown as RouteRecordRaw);
      }
    });
  } catch (error) {
    // 当按钮 || 菜单请求出错时，清除全部登录态并重定向到登陆页
    // 使用 clear() 而非 setToken('')，确保 profile / authInfo 等状态同步清除
    userStore.clear();
    authStore.clear();
    router.replace(LOGIN_URL);
    return Promise.reject(error);
  }
};
