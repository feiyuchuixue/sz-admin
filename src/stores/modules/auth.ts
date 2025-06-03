import { defineStore } from 'pinia';
import { getAuthButtonListApi, getAuthMenuListApi, getAuthRoleListApi } from '@/api/modules/system/login';
import { getAllBreadcrumbList, getFlatMenuList, getShowMenuList } from '@/utils';
import { computed, ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const isLoaded = ref(false);
  // 按钮权限列表
  const authButtonList = ref<string[]>([]);
  // 菜单权限列表
  const authMenuList = ref<Menu.MenuOptions[]>([]);
  // 用户角色列表. 以后如有业务需要可结合此属性灵活处理
  const authRoleList = ref<string[]>([]);
  // 当前页面的 router name，用来做按钮权限筛选
  const routeName = ref('');

  // 按钮权限列表
  const authButtonListGet = computed(() => authButtonList.value);
  // 菜单权限列表 ==> 这里的菜单没有经过任何处理
  const authMenuListGet = computed(() => authMenuList.value);
  // 用户角色列表
  const authRoleListGet = computed(() => authRoleList.value);
  // 菜单权限列表 ==> 左侧菜单栏渲染，需要剔除 isHidden == true
  const showMenuListGet = computed(() => getShowMenuList(authMenuList.value));
  // 菜单权限列表 ==> 扁平化之后的一维数组菜单，主要用来添加动态路由
  const flatMenuListGet = computed(() => getFlatMenuList(authMenuList.value));
  // 递归处理后的所有面包屑导航列表
  const breadcrumbListGet = computed(() => getAllBreadcrumbList(authMenuList.value));

  // Get AuthButtonList
  async function getAuthButtonList() {
    const { data } = await getAuthButtonListApi();
    authButtonList.value = data;
  }

  // Get AuthMenuList
  async function getAuthMenuList() {
    const { data } = await getAuthMenuListApi();
    authMenuList.value = data;

    const beforeMenuList: Menu.MenuOptions[] = [
      {
        id: 'b6c6433509ab405f94796cc93752d417',
        pid: '0',
        path: '/system/message',
        name: 'Message',
        sort: 1,
        component: '/system/message/index',
        meta: {
          icon: 'Bell',
          title: '消息',
          isLink: '',
          isHidden: 'F',
          isFull: 'F',
          isAffix: 'F',
          isKeepAlive: 'F',
          useDataScope: 'F'
        },
        children: [],
        permissions: '',
        menuTypeCd: '1002002'
      },
      {
        id: '6abae64123b746808837ae61bf8d08fb',
        pid: '0',
        path: '/system/message/:id',
        name: 'MessagePopup',
        sort: 2,
        component: '/system/message/index',
        meta: {
          icon: 'Bell',
          title: '消息详情',
          isLink: '',
          isHidden: 'T',
          isFull: 'F',
          isAffix: 'F',
          isKeepAlive: 'F',
          useDataScope: 'F'
        },
        children: [],
        permissions: '',
        menuTypeCd: '1002002'
      }
    ];
    authMenuList.value.unshift(...beforeMenuList);

    const afterMenuList: Menu.MenuOptions[] = [
      {
        id: 'c6328b228c2c4e6bb5b1beb83110dcfa',
        pid: '0',
        path: '/demo',
        name: 'demo',
        sort: 500,
        component: '/demo/index',
        meta: {
          icon: 'Flag',
          title: '功能演示',
          isLink: '',
          isHidden: 'F',
          isFull: 'F',
          isAffix: 'F',
          isKeepAlive: 'F',
          useDataScope: 'F'
        },
        children: [],
        permissions: '',
        menuTypeCd: '1002002'
      },
      {
        id: 'c0a0eba2922346b0b8ae9d4dd951498e',
        pid: '0',
        path: '/about/index',
        name: 'about',
        sort: 600,
        component: '/about/index',
        meta: {
          icon: 'InfoFilled',
          title: '关于项目',
          isLink: '',
          isHidden: 'F',
          isFull: 'F',
          isAffix: 'F',
          isKeepAlive: 'F',
          useDataScope: 'F'
        },
        children: [],
        permissions: '',
        menuTypeCd: '1002002'
      }
    ];
    authMenuList.value.push(...afterMenuList);
  }

  // Get AuthRoleList
  async function getAuthRoleList() {
    const { data } = await getAuthRoleListApi();
    authRoleList.value = data;
  }

  function clear() {
    isLoaded.value = false;
    authMenuList.value = [];
    authButtonList.value = [];
    authRoleList.value = [];
  }

  // Set RouteName
  async function setRouteName(name: string) {
    routeName.value = name;
  }

  async function setLoaded() {
    isLoaded.value = true;
  }

  return {
    isLoaded,
    setLoaded,
    routeName,
    authButtonListGet,
    authMenuListGet,
    authRoleListGet,
    showMenuListGet,
    flatMenuListGet,
    breadcrumbListGet,
    getAuthButtonList,
    getAuthMenuList,
    getAuthRoleList,
    setRouteName,
    clear
  };
});
