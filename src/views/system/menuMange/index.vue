<template>
  <div class="table-box">
    <ProTable
      ref="proTableRef"
      title="菜单列表"
      row-key="id"
      :indent="20"
      :columns="columns"
      :request-api="getTableList"
      :pagination="false"
      :default-expand-all="defaultExpandAllKey"
    >
      <!-- 表格 header 按钮 -->
      <template #tableHeader>
        <el-button v-auth="'sys.menu.create_btn'" type="primary" :icon="CirclePlus" @click="openAddEdit('新增菜单')">
          新增菜单
        </el-button>
        <el-button type="info" :icon="Sort" @click="changeExpand"> 展开/折叠 </el-button>
      </template>
      <!-- 图标 -->
      <template #icon="scope">
        <el-icon :size="18" v-if="scope.row.meta.icon">
          <SvgIcon v-if="scope.row.meta.icon.startsWith('svg-')" :name="scope.row.meta.icon.substring(4)" />
          <component v-else :is="scope.row.meta.icon" />
        </el-icon>
      </template>
      <template #useDataScope="scope">
        <el-switch
          v-if="scope.row.menuTypeCd == '1002002'"
          v-model="scope.row.meta.useDataScope"
          :active-value="'T'"
          :inactive-value="'F'"
          :loading="switchLoading"
          :before-change="() => changeDataScope(scope.row)"
        />
      </template>

      <!-- 菜单操作 -->
      <template #operation="{ row }">
        <el-button
          v-auth="'sys.menu.create_btn'"
          type="primary"
          v-if="row.menuTypeCd !== MENU_BTN"
          link
          :icon="CirclePlus"
          @click="openAddEdit('新增菜单', row)"
        >
          新增
        </el-button>
        <el-button
          v-auth="'sys.menu.update_btn'"
          type="primary"
          link
          :icon="EditPen"
          @click="openAddEdit('编辑菜单', row, false)"
        >
          编辑
        </el-button>
        <el-button v-auth="'sys.menu.delete_btn'" type="primary" link :icon="Delete" @click="deleteInfo(row)"> 删除 </el-button>
        <el-button v-auth="'sys.menu.sql_btn'" type="primary" link :icon="SoldOut" @click="showSqlInfo(row)"> SQL </el-button>
      </template>
    </ProTable>
    <MenuForm ref="menuFormRef" />
    <el-dialog v-model="showSqlDialog" :title="sqlDialTitle" width="80%">
      <HighCode :code="sqlData" language="sql" title="菜单SQL" class="sql-box" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Delete, EditPen, CirclePlus, SoldOut, Sort } from '@element-plus/icons-vue';
import ProTable from '@/components/ProTable/index.vue';
import { addMenu, deleteMenu, editMenu, exportMenuSql, getMenuInfo, getMenuList, chaneDataRole } from '@/api/modules/system/menu';
import MenuForm from '@/views/system/menuMange/components/MenuForm.vue';
import { useHandleData } from '@/hooks/useHandleData';
import { MENU_BTN, MENU_DIR, MENU_PAGE } from '@/config/consts';
import { useOptionsStore } from '@/stores/modules/options';
import type { IMenu } from '@/api/interface/system/menu';
import type { ColumnProps, ProTableInstance } from '@/components/ProTable/interface';
import HighCode from '@/components/HighCode/index.vue';
import { computed, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import SvgIcon from '@/components/SvgIcon/index.vue';
import { IS_PREVIEW } from '@/config';

defineOptions({
  name: 'MenuManage'
});

const showSqlDialog = ref(false);
const sqlData = ref<string>('');
const rowSqlName = ref<any>({});
const optionsStore = useOptionsStore();
const proTableRef = ref<ProTableInstance>();

// 获取table列表
const getTableList = (params: IMenu.Query) => getMenuList(params);

const defaultExpandAllKey = ref(true);

// 表格配置项
const columns: ColumnProps<Menu.MenuOptions>[] = [
  { type: 'index', label: '#' },
  { prop: 'meta.title', label: '名称', align: 'left' },
  {
    prop: 'menuTypeCd',
    label: '类型',
    width: 100,
    tag: true,
    enum: optionsStore.getDictOptions('menu_type'),
    fieldNames: { label: 'codeName', value: 'id', tagType: 'callbackShowStyle' }
  },
  { prop: 'meta.icon', label: '图标', width: 100 },
  { prop: 'sort', label: '排序', width: 100 },
  { prop: 'name', label: '路由名称' },
  { prop: 'path', label: '路由地址' },
  { prop: 'component', label: '组件路径' },
  {
    prop: 'useDataScope',
    label: '数据权限支持',
    width: 100
  },
  { prop: 'permissions', label: '权限', tag: true, width: 200 },
  { prop: 'operation', label: '操作', width: 300, fixed: 'right' }
];
const switchLoading = ref(false);
// 打开 drawer(新增、查看、编辑)
const menuFormRef = ref<InstanceType<typeof MenuForm>>();
const openAddEdit = async (title: string, row: any = {}, isAdd = true) => {
  let orig = {};
  if (isAdd) {
    let pid = row.id || '0';
    const sort = presort(row, pid);
    orig = {
      pid: pid,
      icon: '',
      sort: sort,
      menuTypeCd: row.menuTypeCd === MENU_DIR ? MENU_PAGE : row.menuTypeCd === MENU_PAGE ? MENU_BTN : MENU_DIR,
      isLink: 'F',
      isHidden: 'F',
      isFull: 'F',
      isAffix: 'F',
      isKeepAlive: 'F'
    };
  } else {
    const { data } = await getMenuInfo({ id: row.id });
    if (!data) {
      ElMessage.error({ message: `获取菜单详情失败！` });
      return;
    }
    orig = data;
  }
  const params = {
    title,
    row: { ...orig },
    api: isAdd ? addMenu : editMenu,
    getTableList: proTableRef.value?.getTableList
  };
  menuFormRef.value?.acceptParams(params);
};

const presort = (row: any = {}, pid: number) => {
  let cnt;
  if (pid == 0) {
    cnt = proTableRef.value?.tableData?.length || 0;
  } else {
    cnt = row?.children?.length || 0;
  }
  return (cnt + 1) * 100;
};
// 删除信息
const deleteInfo = async (params: Menu.MenuOptions) => {
  if (IS_PREVIEW) {
    return ElMessage.warning({ message: '预览环境，禁止删除菜单，请谅解！' });
  }
  await useHandleData(deleteMenu, { ids: [params.id] }, `删除【${params?.meta?.title}】菜单及以下菜单`);
  proTableRef.value?.getTableList();
};

const showSqlInfo = async (row: any = {}) => {
  rowSqlName.value = row;
  const { data } = await exportMenuSql({ ids: [row.id] });
  showSqlDialog.value = true;
  sqlData.value = data;
};

const sqlDialTitle = computed(() => {
  return 'SQL [' + rowSqlName.value?.meta?.title + ' ]' || 'SQL []';
});

const changeExpand = () => {
  defaultExpandAllKey.value = !defaultExpandAllKey.value;
  proTableRef.value?.refresh();
};
const changeDataScope = (params: Menu.MenuOptions) => {
  switchLoading.value = true;
  const menuId = params.id;
  if (IS_PREVIEW && menuId == '85b54322630f43a39296488a5e76ba16') {
    switchLoading.value = false;
    ElMessage.warning({ message: '预览环境，禁止修改，请谅解！' });
    return false;
  }
  const handleSuccess = (resolve: (value: boolean | PromiseLike<boolean>) => void) => {
    setTimeout(() => {
      switchLoading.value = false;
      ElMessage.success('切换数据权限成功');
      resolve(true);
    }, 200);
  };

  const handleError = (reject: (reason?: any) => void) => {
    setTimeout(() => {
      switchLoading.value = false;
      reject();
    }, 200);
  };

  return new Promise((resolve, reject) => {
    if (params.meta.useDataScope === 'T') {
      ElMessageBox.confirm(
        `您确认要关闭菜单 [${params.meta.title}] 数据权限支持吗? 此操作有可能导致数据权限失效 ！！`,
        '温馨提示',
        { type: 'warning' }
      )
        .then(() => {
          chaneDataRole({ id: menuId })
            .then(() => handleSuccess(resolve))
            .catch(() => handleError(reject));
        })
        .catch(() => {
          switchLoading.value = false;
        });
    } else {
      chaneDataRole({ id: menuId })
        .then(() => handleSuccess(resolve))
        .catch(() => handleError(reject));
    }
  });
};
</script>
<style scoped lang="scss">
.sql-box {
  margin: 0 auto;
  width: 90%;
  max-height: 60vh;
  overflow: auto;
}
</style>
