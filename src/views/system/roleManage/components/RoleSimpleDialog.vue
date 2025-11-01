<template>
  <el-dialog
    v-model="visible"
    :title="`${paramsProps.title}`"
    :destroy-on-close="true"
    :width="dialogWidth"
    draggable
    append-to-body
    class="role-permission-dialog"
    @closed="onDialogClosed"
  >
    <el-form
      ref="ruleFormRef"
      label-width="100px"
      label-suffix=" :"
      :rules="rules"
      :model="paramsProps.row"
      @submit.enter.prevent="handleSubmit"
      class="role-base-form"
    >
      <el-form-item label="角色名称" prop="roleName">
        <el-input disabled v-model="paramsProps.row.roleName" placeholder="请填写角色名称" clearable />
      </el-form-item>
      <el-form-item label="标识" prop="permissions">
        <el-input disabled v-model="paramsProps.row.permissions" placeholder="请填写标识" clearable />
      </el-form-item>
    </el-form>
    <div class="permission-content-area">
      <div class="menu-sidebar">
        <div class="sidebar-header">
          <span class="sidebar-title">菜单分组</span>
          <div class="sidebar-actions">
            <el-link type="primary" @click="expandAll">全部展开</el-link>
            <el-link type="info" @click="collapseAll">全部收起</el-link>
            <el-input
              v-model="menuFilter"
              size="small"
              placeholder="搜索菜单"
              style="width: 110px; margin-left: 12px"
              clearable
              @input="onFilter"
            >
              <template #prefix>
                <el-icon>
                  <svg viewBox="0 0 1024 1024" width="1em" height="1em">
                    <path
                      d="M832 864a32 32 0 0 1-22.624-9.376l-144.288-144.288A318.464 318.464 0 0 1 512 832C299.968 832 128 660.032 128 448S299.968 64 512 64s384 171.968 384 384c0 81.312-25.312 157.072-68.336 218.336l144.288 144.288A32 32 0 0 1 864 832z m-320-768C317.248 96 160 253.248 160 448s157.248 352 352 352 352-157.248 352-352S706.752 96 512 96z"
                      fill="#909399"
                    />
                  </svg>
                </el-icon>
              </template>
            </el-input>
          </div>
        </div>
        <el-tree
          ref="menuTreeRef"
          class="menu-tree"
          :data="filteredMenus"
          node-key="id"
          :default-expand-all="true"
          :highlight-current="true"
          :expand-on-click-node="false"
          :filter-node-method="filterNode"
          :props="treeProps"
          :current-node-key="selectedMenuId"
          @node-click="handleNodeClick"
        >
          <template #default="{ data }">
            <div
              :class="[
                'tree-node',
                {
                  selectable: isMenu(data),
                  selected: selectedMenuId === data.id && isMenu(data),
                  'has-config': menuConfigMap[data.id]
                }
              ]"
            >
              <el-icon
                v-if="isMenu(data)"
                :style="{
                  color: data.useDataScope === 'T' ? '#67c23a' : '#bfbfbf',
                  marginRight: '4px'
                }"
              >
                <Menu />
              </el-icon>
              <el-icon v-else-if="isDirectory(data)" style="margin-right: 4px">
                <Folder />
              </el-icon>
              <span v-if="hasMenuConfigDeep(data.id)" class="menu-config-dot" />
              <span>{{ data.title }}</span>
              <el-tag
                v-if="isMenu(data) && data.useDataScope === 'T'"
                type="success"
                size="small"
                effect="plain"
                class="menu-tree-tag"
              >
                数据
              </el-tag>
            </div>
          </template>
        </el-tree>
      </div>
      <div class="menu-permission-card">
        <div v-if="selectedMenu">
          <div class="menu-title-row">
            菜单：{{ selectedMenu.title }}
            <span v-if="selectedMenu.useDataScope === 'T'" class="data-scope-tag" style="margin-left: 8px">
              <el-tag size="small" type="success">数据权限</el-tag>
            </span>
          </div>
          <div class="menu-buttons-row">
            <div class="label-row">
              功能权限：
              <el-checkbox v-model="allChecked" class="checkbox-primary-style"> 全选 </el-checkbox>
              <el-checkbox v-model="showPermissionsTag" class="checkbox-primary-style"> 标识 </el-checkbox>
            </div>
            <div class="divider-line"></div>
            <el-checkbox-group v-model="selectedButtonIds" @change="saveCurrentMenuConfig">
              <div v-for="btn in buttonList" :key="btn.id" class="permission-checkbox-item">
                <el-checkbox :value="btn.id">
                  {{ btn.title }}
                </el-checkbox>
                <template v-if="showPermissionsTag">
                  <el-tag size="small" effect="dark" type="info" class="permission-tag">
                    {{ btn.permissions }}
                  </el-tag>
                  <el-button
                    text
                    size="small"
                    style="vertical-align: middle; margin-left: 2px"
                    @click.stop="copyPermission(btn.permissions)"
                    title="复制标识"
                  >
                    <el-icon :size="18">
                      <CopyDocument />
                    </el-icon>
                  </el-button>
                </template>
              </div>
            </el-checkbox-group>
          </div>
          <el-divider />
          <RoleDataPermission
            :form="dataPermissionForm"
            :dataScopeOptions="dataScopeOptions"
            :canEditDataScope="canEditDataScope"
            :userInfos="userInfos"
            :deptTrees="deptTrees"
            :userTreeProps="userTreeProps"
            :deptTreeProps="deptTreeProps"
            @update:form="
              val => {
                dataPermissionForm.dataScope = val.dataScope;
                dataPermissionForm.users = val.users;
                dataPermissionForm.depts = val.depts;
                saveCurrentMenuConfig();
              }
            "
            @change="saveCurrentMenuConfig"
          />
        </div>
        <div v-else style="color: #bbb; text-align: center; margin-top: 100px">请选择菜单进行权限配置</div>
      </div>
    </div>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, defineExpose } from 'vue';
import { type ElForm, ElMessage } from 'element-plus';
import { Folder, Menu, CopyDocument } from '@element-plus/icons-vue';
import { getRoleMenus } from '@/api/modules/system/role';
import { useDictOptions } from '@/hooks/useDictOptions';
import { useDict } from '@/hooks/useDict';
import type { DeptTree, RoleMenuTree, Scope, UserInfo } from '@/api/types/system/role';
import RoleDataPermission from './RoleDataPermission.vue';

const visible = ref(false);
const paramsProps = ref<any>({
  title: '',
  row: {},
  api: undefined,
  getTableList: undefined
});

useDict(['data_scope']);
const dataScopeOptions = useDictOptions('data_scope');

const menuLists = ref<RoleMenuTree[]>([]);
const rawMenuTree = ref<RoleMenuTree[]>([]);
const menuAuthMap = reactive<
  Record<
    string,
    {
      buttonIds: string[];
      dataScope: string;
      users: string[];
      depts: string[];
      useDataScope?: string;
    }
  >
>({});
const menuButtonMap = ref<Record<string, RoleMenuTree[]>>({});
const menuConfigMap = reactive<Record<string, boolean>>({});
const selectedMenu = ref<RoleMenuTree | null>(null);
const selectedMenuId = ref<string>('');
const selectedButtonIds = ref<string[]>([]);
const deptTrees = ref<DeptTree[]>([]);
const userInfos = ref<UserInfo[]>([]);
const dataPermissionForm = reactive<{
  dataScope: string;
  users: string[];
  depts: string[];
}>({
  dataScope: '1006001',
  users: [],
  depts: []
});

const menuTreeRef = ref();
const deptTreeRef = ref();
const deptTreeProps = {
  label: 'name',
  value: 'id'
};
const userTreeRef = ref();
const userTreeProps = {
  label: 'nickname',
  value: 'id'
};

const dialogWidth = computed(() => {
  const w = Math.max(900, Math.min(window.innerWidth * 0.85, 1200));
  return `${w}px`;
});
const canEditDataScope = computed(() => !!selectedMenu.value && selectedMenu.value.useDataScope === 'T');

const menuFilter = ref('');
const ruleFormRef = ref();
const rules = reactive({
  roleName: [{ required: true, message: '请填写角色名称' }]
});
const treeProps = {
  children: 'children',
  label: 'title',
  value: 'id'
};

const isDirectory = (node: RoleMenuTree) => node.menuTypeCd === '1002001';
const isMenu = (node: RoleMenuTree) => node.menuTypeCd === '1002002';
const isButton = (node: RoleMenuTree) => node.menuTypeCd === '1002003';

const filterMenuTree = (tree: RoleMenuTree[]): RoleMenuTree[] =>
  tree
    .filter((node: RoleMenuTree) => isDirectory(node) || isMenu(node))
    .map((node: RoleMenuTree) => ({
      ...node,
      children: node.children ? filterMenuTree(node.children) : []
    }));

const buildMenuButtonMap = (
  tree: RoleMenuTree[],
  parentMenuId: string | null = null,
  map: Record<string, RoleMenuTree[]> = {}
) => {
  tree.forEach(node => {
    if (isMenu(node)) {
      map[node.id] = [];
      if (Array.isArray(node.children)) {
        node.children.forEach(child => buildMenuButtonMap([child], node.id, map));
      }
    } else if (isButton(node) && parentMenuId) {
      if (!map[parentMenuId]) map[parentMenuId] = [];
      map[parentMenuId].push(node);
    } else if (Array.isArray(node.children)) {
      node.children.forEach(child => buildMenuButtonMap([child], parentMenuId, map));
    }
  });
  return map;
};

const filteredMenus = computed(() => {
  if (!menuFilter.value) return menuLists.value;
  const filterTree = (list: RoleMenuTree[]): RoleMenuTree[] =>
    list
      .map((n: RoleMenuTree) => {
        const matched = n.title.includes(menuFilter.value);
        let children = n.children ? filterTree(n.children) : [];
        if (matched || children.length) {
          return { ...n, children };
        }
        return null;
      })
      .filter(Boolean) as RoleMenuTree[];
  return filterTree(menuLists.value);
});
const onFilter = () => {};
const filterNode = () => true;
const expandAll = () => expandCollapseAll(true);
const collapseAll = () => expandCollapseAll(false);

const expandCollapseAll = (expand: boolean) => {
  const traverse = (nodes: RoleMenuTree[]) => {
    nodes.forEach((n: RoleMenuTree) => {
      if (menuTreeRef.value?.store.nodesMap[n.id]) {
        menuTreeRef.value.store.nodesMap[n.id].expanded = expand;
      }
      if (n.children && n.children.length) traverse(n.children);
    });
  };
  traverse(menuLists.value);
};

const saveCurrentMenuConfig = () => {
  if (!selectedMenu.value) return;
  menuAuthMap[selectedMenu.value.id] = {
    buttonIds: [...selectedButtonIds.value],
    dataScope: dataPermissionForm.dataScope,
    users: Array.isArray(dataPermissionForm.users) ? [...dataPermissionForm.users] : [],
    depts: Array.isArray(dataPermissionForm.depts) ? [...dataPermissionForm.depts] : [],
    useDataScope: selectedMenu.value.useDataScope
  };
  menuConfigMap[selectedMenu.value.id] = hasMenuConfig(selectedMenu.value.id);
};

// 使用 el-tree 的 node-click 事件
const handleNodeClick = (data: RoleMenuTree) => {
  if (isMenu(data)) {
    selectMenu(data);
  }
};

const selectMenu = (menu: RoleMenuTree) => {
  if (!isMenu(menu)) return;
  if (selectedMenu.value) saveCurrentMenuConfig();
  selectedMenu.value = menu;
  selectedMenuId.value = menu.id;
  const cfg = menuAuthMap[menu.id] || { buttonIds: [], dataScope: '', users: [], depts: [], useDataScope: menu.useDataScope };
  selectedButtonIds.value = [...cfg.buttonIds];
  dataPermissionForm.dataScope = cfg.dataScope || '1006001';
  dataPermissionForm.users = Array.isArray(cfg.users) ? [...cfg.users] : [];
  dataPermissionForm.depts = Array.isArray(cfg.depts) ? [...cfg.depts] : [];
  menuConfigMap[menu.id] = !!(
    cfg.buttonIds.length ||
    cfg.dataScope ||
    (cfg.users && cfg.users.length) ||
    (cfg.depts && cfg.depts.length)
  );
  nextTick(() => {
    if (userTreeRef.value) {
      userTreeRef.value.setCheckedKeys(dataPermissionForm.users || []);
    }
    if (deptTreeRef.value) {
      deptTreeRef.value.setCheckedKeys(dataPermissionForm.depts || []);
    }
    const el = document.querySelector('.tree-node.selected');
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });
};

const buttonList = computed(() => {
  if (!selectedMenu.value) return [];
  return menuButtonMap.value[selectedMenu.value.id] || [];
});

const showPermissionsTag = ref(false);
const allChecked = computed({
  get: () => buttonList.value.length > 0 && selectedButtonIds.value.length === buttonList.value.length,
  set: (val: boolean) => {
    if (val) {
      selectedButtonIds.value = buttonList.value.map(btn => btn.id);
    } else {
      selectedButtonIds.value = [];
    }
    saveCurrentMenuConfig();
  }
});

const copyPermission = (perm: string) => {
  navigator.clipboard
    .writeText(perm)
    .then(() => ElMessage.success('标识已复制'))
    .catch(() => ElMessage.error('复制失败，请手动复制'));
};

const findAllParentIds = (tree: RoleMenuTree[], targetId: string): string[] => {
  let result: string[] = [];
  function helper(nodes: RoleMenuTree[], parents: string[]) {
    for (const node of nodes) {
      if (node.id === targetId) {
        result = parents.slice();
        return true;
      }
      if (node.children && node.children.length) {
        if (helper(node.children, [...parents, node.id])) return true;
      }
    }
    return false;
  }
  helper(tree, []);
  return result;
};

const getAllMenuIdsWithParentAndButton = (): string[] => {
  const idsSet = new Set<string>();
  Object.entries(menuAuthMap).forEach(([menuId, cfg]) => {
    if (cfg.buttonIds && cfg.buttonIds.length) {
      cfg.buttonIds.forEach(btnId => {
        idsSet.add(btnId);
        findAllParentIds(rawMenuTree.value, btnId).forEach(pid => idsSet.add(pid));
      });
    }
    if (menuConfigMap[menuId]) {
      idsSet.add(menuId);
      findAllParentIds(rawMenuTree.value, menuId).forEach(pid => idsSet.add(pid));
    }
  });
  return Array.from(idsSet);
};

const hasMenuConfigDeep = (menuId: string): boolean => {
  if (hasMenuConfig(menuId)) return true;
  const node = findMenu(menuLists.value, menuId);
  if (node && node.children && node.children.length) {
    return node.children.some(child => hasMenuConfigDeep(child.id));
  }
  return false;
};

const handleSubmit = async () => {
  if (selectedMenu.value) saveCurrentMenuConfig();

  const menuIds = getAllMenuIdsWithParentAndButton();

  const scope = Object.entries(menuAuthMap)
    .filter(([, cfg]) => cfg.useDataScope === 'T' && cfg.dataScope)
    .map(([menuId, cfg]) => ({
      menuId,
      dataScope: cfg.dataScope,
      userIds: cfg.users,
      deptIds: cfg.depts
    }));

  const result = {
    roleId: paramsProps.value.row.id,
    menu: {
      menuIds
    },
    scope
  };

  await paramsProps.value.api!(result);
  ElMessage.success({ message: `${paramsProps.value.title}成功！` });
  paramsProps.value.getTableList!();
  visible.value = false;
};

const flattenMenuIds = (tree: RoleMenuTree[]): string[] => {
  let ids: string[] = [];
  tree.forEach(node => {
    ids.push(node.id);
    if (node.children && node.children.length) {
      ids = ids.concat(flattenMenuIds(node.children));
    }
  });
  return ids;
};

const findMenu = (tree: RoleMenuTree[], id: string): RoleMenuTree | undefined => {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children && node.children.length) {
      const found = findMenu(node.children, id);
      if (found) return found;
    }
  }
  return undefined;
};

const findFirstMenu = (tree: RoleMenuTree[]): RoleMenuTree | null => {
  for (const node of tree) {
    if (isMenu(node)) return node;
    if (node.children && node.children.length) {
      const found = findFirstMenu(node.children);
      if (found) return found;
    }
  }
  return null;
};

const getInfo = (roleId: number) => {
  getRoleMenus({ roleId }).then(res => {
    const data = res.data;
    const rawTree: RoleMenuTree[] = data.menuLists || [];
    deptTrees.value = data.deptLists || [];
    userInfos.value = data.userLists || [];
    rawMenuTree.value = rawTree;
    menuButtonMap.value = buildMenuButtonMap(rawTree, null, {});
    menuLists.value = filterMenuTree(rawTree);

    const selectedMenuIds = new Set(data.selectMenuIds || []);
    Object.keys(menuAuthMap).forEach(key => delete menuAuthMap[key]);
    Object.keys(menuConfigMap).forEach(key => delete menuConfigMap[key]);

    const initMenuAuth = (tree: RoleMenuTree[]) => {
      tree.forEach(node => {
        if (isMenu(node)) {
          const btns = menuButtonMap.value[node.id] || [];
          const selectedBtns = btns.filter(btn => selectedMenuIds.has(btn.id)).map(btn => btn.id);
          const menuSelected = selectedMenuIds.has(node.id);
          menuAuthMap[node.id] = {
            buttonIds: selectedBtns,
            dataScope: '',
            users: [],
            depts: [],
            useDataScope: node.useDataScope
          };
          menuConfigMap[node.id] = selectedBtns.length > 0 || menuSelected;
        }
        if (Array.isArray(node.children)) {
          initMenuAuth(node.children);
        }
      });
    };
    initMenuAuth(rawTree);

    const allMenuIds = flattenMenuIds(menuLists.value);

    if (Array.isArray(data.scope)) {
      (data.scope as Scope[]).forEach((scopeItem: Scope) => {
        const menuId = scopeItem.menuId;
        if (allMenuIds.includes(menuId)) {
          if (!menuAuthMap[menuId]) {
            const menuNode = findMenu(menuLists.value, menuId);
            menuAuthMap[menuId] = {
              buttonIds: [],
              dataScope: '',
              users: [],
              depts: [],
              useDataScope: menuNode?.useDataScope || 'T'
            };
          }
          menuAuthMap[menuId].dataScope = scopeItem.dataScope || '';
          menuAuthMap[menuId].users = Array.isArray(scopeItem.userIds) ? scopeItem.userIds.map(id => String(id)) : [];
          menuAuthMap[menuId].depts = Array.isArray(scopeItem.deptIds) ? scopeItem.deptIds.map(id => String(id)) : [];
          menuConfigMap[menuId] = true;
        }
      });
    }

    let firstMenuId = '';
    if (Array.isArray(data.scope) && data.scope.length) {
      firstMenuId = data.scope[0].menuId;
    } else if (data.selectMenuIds && data.selectMenuIds.length) {
      for (const id of data.selectMenuIds) {
        if (menuAuthMap[id]) {
          firstMenuId = id;
          break;
        }
      }
    }
    const toSelectMenu = firstMenuId
      ? (() => {
          const findNode = (tree: RoleMenuTree[], id: string): RoleMenuTree | null => {
            for (const node of tree) {
              if (node.id === id) return node;
              if (node.children && node.children.length) {
                const found = findNode(node.children, id);
                if (found) return found;
              }
            }
            return null;
          };
          return findNode(menuLists.value, firstMenuId);
        })()
      : findFirstMenu(menuLists.value);
    if (toSelectMenu) selectMenu(toSelectMenu);

    Object.keys(menuAuthMap).forEach(menuId => {
      if (
        menuAuthMap[menuId].useDataScope === 'T' &&
        !(Array.isArray(data.scope) && data.scope.find((scopeItem: Scope) => scopeItem.menuId === menuId))
      ) {
        menuAuthMap[menuId].dataScope = '';
        menuAuthMap[menuId].users = [];
        menuAuthMap[menuId].depts = [];
      }
    });
  });
};

const onDialogClosed = () => {
  selectedMenu.value = null;
  selectedMenuId.value = '';
  selectedButtonIds.value = [];
  dataPermissionForm.dataScope = '';
  dataPermissionForm.users = [];
  dataPermissionForm.depts = [];
  Object.keys(menuAuthMap).forEach(key => delete menuAuthMap[key]);
  Object.keys(menuConfigMap).forEach(key => delete menuConfigMap[key]);
  menuLists.value = [];
  rawMenuTree.value = [];
  menuButtonMap.value = {};
  deptTrees.value = [];
  userInfos.value = [];
  showPermissionsTag.value = false;
};

const hasMenuConfig = (menuId: string): boolean => {
  const cfg = menuAuthMap[menuId];
  if (!cfg) return false;
  const hasButtons = Array.isArray(cfg.buttonIds) && cfg.buttonIds.length > 0;
  const hasDataScope = cfg.useDataScope === 'T' && !!cfg.dataScope;
  const hasUsers = Array.isArray(cfg.users) && cfg.users.length > 0;
  const hasDepts = Array.isArray(cfg.depts) && cfg.depts.length > 0;
  return hasButtons || hasDataScope || hasUsers || hasDepts;
};

const acceptParams = (params: any) => {
  paramsProps.value = params;
  visible.value = true;
  getInfo(params.row.id);
};

defineExpose({ acceptParams });
</script>

<style scoped lang="scss">
.role-permission-dialog {
  .el-dialog__body {
    display: flex;
    flex-direction: column;
    height: 80vh;
    min-height: 600px;
    padding: 32px 32px 0 32px;
    background: #fafbfc;
  }
  .role-base-form {
    flex-shrink: 0;
    margin-bottom: 18px;
    background: transparent;
  }
  .permission-content-area {
    flex: 1 1 0;
    display: flex;
    min-height: 0;
    overflow: hidden;
    .menu-sidebar {
      width: 260px;
      min-width: 180px;
      background: #fff;
      border-radius: 8px;
      margin-right: 32px;
      padding: 12px 0 12px 0;
      border: 1px solid #f0f0f0;
      display: flex;
      flex-direction: column;
      overflow: auto;
      max-height: 100%;
      min-height: 0;
      box-shadow: 1px 0 8px 0 rgba(64, 158, 255, 0.04);
      .sidebar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 18px 10px 18px;
        border-bottom: 1px solid #f4f4f4;
        margin-bottom: 10px;
        .sidebar-title {
          font-weight: bold;
          color: #222;
        }
        .sidebar-actions .el-link {
          margin-left: 8px;
        }
      }
      .menu-tree {
        flex: 1 1 0;
        padding-right: 4px;
        .el-tree-node__content {
          padding: 3px 0 3px 0;
        }
        .tree-node {
          display: flex;
          align-items: center;
          cursor: pointer;
          border-radius: 5px;
          padding: 3px 8px;
          margin-bottom: 2px;
          &.selectable:hover {
            background: #f3f6fb;
          }
          &.selected {
            background: #e6f7ff;
            border-left: 4px solid #409eff;
            font-weight: 500;
          }
          .menu-config-dot {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #409eff;
            margin-right: 6px;
            vertical-align: middle;
          }
          .menu-tree-tag {
            margin-left: 6px;
            padding: 0 3px;
            font-size: 10px;
            height: 18px;
            line-height: 18px;
            vertical-align: middle;
            border-radius: 8px;
          }
        }
      }
    }
    .menu-permission-card {
      flex: 1 1 0;
      min-width: 400px;
      background: #fff;
      border-radius: 8px;
      border: 1px solid #f0f0f0;
      padding: 24px 30px 10px 30px;
      display: flex;
      flex-direction: column;
      overflow: auto;
      max-height: 100%;
      min-height: 0;
      box-shadow: 0 1px 8px 0 rgba(0, 0, 0, 0.03);
      .menu-title-row {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 18px;
        color: #333;
      }
      .label-row {
        font-size: 14px;
        margin-bottom: 8px;
        color: #444;
        display: flex;
        align-items: center;
        .el-link {
          margin-left: 8px;
        }
      }
      .divider-line {
        border-top: 1px dashed #e0e0e0;
        margin: 8px 0 10px 0;
        width: 100%;
      }
      .menu-buttons-row {
        margin-bottom: 18px;
        .el-checkbox-group {
          display: flex;
          flex-wrap: wrap;
          gap: 18px 32px;
        }
      }
      .menu-data-row {
        margin-bottom: 12px;
      }
      .menu-status-row {
        margin-top: 18px;
        .el-tag {
          margin-right: 8px;
        }
      }
      .data-scope-tag {
        font-size: 12px;
        margin-left: 8px;
      }
      .disabled-card {
        opacity: 0.5;
        pointer-events: none;
      }
      .no-data-scope-tip {
        margin: 24px 0;
      }
    }
  }
  .el-dialog__footer {
    flex-shrink: 0;
    padding: 18px 32px 24px 32px;
    border-top: 1px solid #f0f0f0;
    background: #fafbfc;
    .el-button + .el-button {
      margin-left: 10px;
    }
  }
  .tree-container {
    height: 300px;
    overflow-y: scroll;
  }
  .min-header {
    min-height: 50px;
  }
  .permission-checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 18px 32px;
    margin-top: 8px;
  }
  .permission-checkbox-item {
    display: flex;
    align-items: center;
    margin-bottom: 6px;
    min-width: 220px;
  }
  .permission-tag {
    margin-left: 6px;
    font-size: 13px;
    font-family: monospace;
    font-weight: bold;
    letter-spacing: 0.5px;
    padding: 0 5px;
    background: #e6f7ff;
    color: #096dd9;
    border: 1px solid #91d5ff;
  }
}

:deep(.checkbox-primary-style) {
  --el-checkbox-checked-bg-color: #409eff;
  --el-checkbox-checked-border-color: #409eff;
  color: #409eff;
}
:deep(.checkbox-primary-style .el-checkbox__label),
:deep(.checkbox-primary-style.is-checked .el-checkbox__label) {
  color: #409eff !important;
  transition:
    color 0.2s,
    text-decoration-color 0.2s;
}
:deep(.checkbox-primary-style .el-checkbox__label:hover) {
  color: #1976d2 !important;
  text-decoration: underline;
  text-decoration-color: #1976d2;
}
</style>
