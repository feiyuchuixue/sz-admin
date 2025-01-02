<template>
  <el-dialog v-model="visible" :title="`${paramsProps.title}`" :destroy-on-close="true" width="800px" draggable append-to-body>
    <el-form
      ref="ruleFormRef"
      label-width="100px"
      label-suffix=" :"
      :rules="rules"
      :model="paramsProps.row"
      @submit.enter.prevent="handleSubmit"
    >
      <el-form-item label="上级" prop="pid">
        <el-tree-select
          v-model="paramsProps.row.pid"
          :data="parentMenus"
          check-strictly
          placeholder="请选择上级"
          :render-after-expand="false"
          clearable
          :default-expand-all="true"
          :props="treeProps"
        />
      </el-form-item>

      <el-form-item label="类型" prop="menuTypeCd">
        <el-radio-group v-model="paramsProps.row.menuTypeCd">
          <el-radio-button :value="MENU_DIR">
            {{ menuLabel(MENU_DIR, '目录') }}
          </el-radio-button>
          <el-radio-button :value="MENU_PAGE">
            {{ menuLabel(MENU_DIR, '菜单') }}
          </el-radio-button>
          <el-radio-button :value="MENU_BTN">
            {{ menuLabel(MENU_DIR, '按钮') }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="图标" prop="icon" v-if="paramsProps.row.menuTypeCd !== MENU_BTN">
        <IconChoose v-model="paramsProps.row.icon" placeholder="请填写图标" clearable />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="名称" prop="title">
            <el-input v-model="paramsProps.row.title" placeholder="请填写名称" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="paramsProps.row.sort" :precision="0" :min="1" :max="999999" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12" v-if="paramsProps.row.menuTypeCd !== MENU_BTN">
          <el-form-item label="是否外链" prop="isLink">
            <el-radio-group v-model="paramsProps.row.isLink">
              <el-radio value="T" border> 是 </el-radio>
              <el-radio value="F" border> 否 </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>

        <el-col :span="12" v-if="paramsProps.row.menuTypeCd !== MENU_BTN && paramsProps.row.isLink === 'T'">
          <el-form-item label="外链地址" prop="redirect">
            <el-input v-model="paramsProps.row.redirect" placeholder="请填写外链地址" clearable />
          </el-form-item>
        </el-col>

        <el-col :span="12" v-if="paramsProps.row.menuTypeCd !== MENU_BTN">
          <el-form-item label="路由名称" prop="name">
            <el-input v-model="paramsProps.row.name" placeholder="请填写路由名称" clearable />
          </el-form-item>
        </el-col>

        <el-col :span="12" v-if="paramsProps.row.menuTypeCd !== MENU_BTN">
          <el-form-item label="路由地址" prop="path">
            <el-input v-model="paramsProps.row.path" placeholder="请填写路由地址" clearable />
          </el-form-item>
        </el-col>

        <el-col :span="12" v-if="paramsProps.row.menuTypeCd === MENU_PAGE">
          <el-form-item label="组件路径" prop="component">
            <el-input v-model="paramsProps.row.component" placeholder="请填写组件路径" clearable />
          </el-form-item>
        </el-col>

        <el-col :span="12" v-if="paramsProps.row.menuTypeCd !== MENU_DIR">
          <el-form-item label="权限" prop="permissions">
            <el-input v-model="paramsProps.row.permissions" placeholder="请填写权限" clearable />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="显示状态" prop="isHidden">
            <el-radio-group v-model="paramsProps.row.isHidden">
              <el-radio value="F" border> 显示 </el-radio>
              <el-radio value="T" border> 隐藏 </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>

        <el-col :span="12" v-if="paramsProps.row.menuTypeCd === MENU_PAGE">
          <el-form-item label="是否全屏" prop="isFull">
            <el-radio-group v-model="paramsProps.row.isFull">
              <el-radio value="T" border> 是 </el-radio>
              <el-radio value="F" border> 否 </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>

        <el-col :span="12" v-if="paramsProps.row.menuTypeCd === MENU_PAGE">
          <el-form-item label="固定标签页" prop="isAffix">
            <el-radio-group v-model="paramsProps.row.isAffix">
              <el-radio value="T" border> 是 </el-radio>
              <el-radio value="F" border> 否 </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="paramsProps.row.menuTypeCd === MENU_PAGE">
          <el-form-item label="是否缓存" prop="isKeepAlive">
            <el-radio-group v-model="paramsProps.row.isKeepAlive">
              <el-radio value="T" border> 是 </el-radio>
              <el-radio value="F" border> 否 </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="visible = false"> 取消 </el-button>
      <el-button type="primary" @click="handleSubmit"> 确定 </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { MENU_BTN, MENU_DIR, MENU_PAGE } from '@/config/consts';
import { useOptionsStore } from '@/stores/modules/options';
import IconChoose from '@/components/IconChoose/index.vue';
import { getBtnExits, getMenuTree } from '@/api/modules/system/menu';
import type { IMenu } from '@/api/interface/system/menu';
import type { FormItemRule } from 'element-plus/es/components/form/src/types';
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { IS_PREVIEW } from '@/config';

defineOptions({
  name: 'MenuForm'
});

const optionsStore = useOptionsStore();
const menuOptions = optionsStore.getDictOptions('menu_type');

const menuLabel = (type: any, defaultLabel = '') => {
  return menuOptions[type] || defaultLabel;
};

const rules = ref({});

const visible = ref(false);
const paramsProps = ref<View.DefaultParams>({
  title: '',
  row: {},
  api: undefined,
  getTableList: undefined
});

watch(
  () => [paramsProps.value.row.menuTypeCd, paramsProps.value.row.isLink],
  newVal => {
    const [menuType, isLink] = newVal;
    let ruleData: Record<string, FormItemRule[]> = {
      pid: [{ required: true, message: '请选择上级' }],
      title: [{ required: true, message: '请填写名称' }],
      sort: [{ required: true, message: '请填写排序' }]
    };
    switch (menuType) {
      case MENU_DIR:
        ruleData['icon'] = [{ required: true, message: '请填写图标' }];
        ruleData['name'] = [{ required: true, message: '请填写路由名称' }];
        ruleData['path'] = [{ required: true, message: '请填写路由地址' }];
        if (isLink === 'T') {
          ruleData['redirect'] = [{ required: true, message: '请填写外链地址' }];
        }
        break;
      case MENU_PAGE:
        ruleData['icon'] = [{ required: true, message: '请填写图标' }];
        if (isLink === 'T') {
          ruleData['redirect'] = [{ required: true, message: '请填写外链地址' }];
        } else {
          ruleData['name'] = [{ required: true, message: '请填写路由名称' }];
          ruleData['path'] = [{ required: true, message: '请填写路由地址' }];
          ruleData['component'] = [{ required: true, message: '请填写组件路径' }];
          ruleData['permissions'] = [{ validator: validatePermission, trigger: 'blur' }];
        }
        break;
      case MENU_BTN:
        ruleData['permissions'] = [{ validator: validatePermission, trigger: 'blur' }];
    }
    rules.value = ruleData;

    if (ruleFormRef.value) {
      ruleFormRef.value.clearValidate();
    }
  }
);

const validatePermission = (rule: any, value: any, callback: any) => {
  getBtnExits({ permissions: value, id: paramsProps.value.row?.id }).then(res => {
    if (res.data.permissionCount > 0) {
      callback(new Error('权限已存在!'));
    } else {
      callback();
    }
  });
};

// 接收父组件传过来的参数
const acceptParams = (params: View.DefaultParams) => {
  paramsProps.value = params;
  visible.value = true;
  loadParentMenus();
};

const parentMenus = ref<IMenu.Tree[]>([]);

const loadParentMenus = () => {
  getMenuTree({ nodeId: paramsProps.value.row?.id }).then(res => {
    parentMenus.value = res.data;
  });
};
const treeProps = {
  label: 'title',
  value: 'id'
};

// 提交数据（新增/编辑）
const ruleFormRef = ref();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async (valid: boolean) => {
    if (!valid) return;
    if (IS_PREVIEW) {
      return ElMessage.warning({ message: '预览环境，禁止编辑菜单，请谅解！' });
    }
    try {
      await paramsProps.value.api!(paramsProps.value.row);
      ElMessage.success({ message: `${paramsProps.value.title}成功！` });
      paramsProps.value.getTableList!();
      visible.value = false;
    } catch (error) {
      console.log(error);
    }
  });
};

defineExpose({
  acceptParams
});
</script>

<style scoped lang="scss"></style>
