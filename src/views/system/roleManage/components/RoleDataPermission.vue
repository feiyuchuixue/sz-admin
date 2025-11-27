<template>
  <div class="menu-data-row">
    <div class="label-row">
      数据权限：
      <el-tooltip v-if="canEditDataScope" content="只有支持数据权限的菜单才可配置" placement="top">
        <el-icon>
          <svg viewBox="0 0 1024 1024" width="1em" height="1em">
            <path
              d="M512 64C264.576 64 64 264.576 64 512s200.576 448 448 448 448-200.576 448-448S759.424 64 512 64z m0 820.352c-205.888 0-372.352-166.464-372.352-372.352S306.112 139.648 512 139.648 884.352 306.112 884.352 512 717.888 884.352 512 884.352z"
              fill="#909399"
            />
            <path
              d="M512 704a32 32 0 1 1 0 64 32 32 0 0 1 0-64z m32-384H480c-17.664 0-32 14.336-32 32v192c0 17.664 14.336 32 32 32h64c17.664 0 32-14.336 32-32V352c0-17.664-14.336-32-32-32z"
              fill="#909399"
            />
          </svg>
        </el-icon>
      </el-tooltip>
      <el-tooltip v-else content="请前往菜单管理开放数据权限" placement="top">
        <el-icon>
          <svg viewBox="0 0 1024 1024" width="1em" height="1em">
            <path
              d="M512 64C264.576 64 64 264.576 64 512s200.576 448 448 448 448-200.576 448-448S759.424 64 512 64z m0 820.352c-205.888 0-372.352-166.464-372.352-372.352S306.112 139.648 512 139.648 884.352 306.112 884.352 512 717.888 884.352 512 884.352z"
              fill="#dcdfe6"
            />
            <path
              d="M512 704a32 32 0 1 1 0 64 32 32 0 0 1 0-64z m32-384H480c-17.664 0-32 14.336-32 32v192c0 17.664 14.336 32 32 32h64c17.664 0 32-14.336 32-32V352c0-17.664-14.336-32-32-32z"
              fill="#dcdfe6"
            />
          </svg>
        </el-icon>
      </el-tooltip>
    </div>
    <el-form :model="form" label-width="80px" label-suffix=" :" @change="emitChange">
      <el-row>
        <el-col>
          <el-form-item label="权限范围">
            <el-select v-model="form.dataScope" placeholder="请选择权限范围" :disabled="!canEditDataScope">
              <el-option v-for="item in dataScopeOptions" :key="item.id" :label="item.codeName" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <!-- 用户维度 -->
        <el-col :span="12">
          <el-card shadow="never" style="margin-left: 25px" v-if="form.dataScope === '1006005'">
            <template #header>
              <div class="dimension-header dimension-header-multiline">
                <div class="dimension-header-row">
                  <span>用户维度</span>
                  <el-input
                    v-model="userFilterText"
                    placeholder="搜索用户"
                    size="small"
                    clearable
                    class="dimension-search-input"
                    @input="filterUserTree"
                  >
                    <template #prefix>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>
                </div>
                <div class="dimension-header-row dimension-header-row-right">
                  <!-- 这里留空用于撑高度，与部门维度对齐 -->
                </div>
              </div>
            </template>
            <div class="tree-container user-tree-container">
              <el-tree
                :data="userInfos"
                show-checkbox
                ref="userTreeRef"
                node-key="id"
                :props="userTreeProps"
                empty-text="暂无可选用户"
                :default-checked-keys="form.users"
                :disabled="!canEditDataScope"
                @check-change="onUserTreeCheckChange"
                :filter-node-method="filterUserNode"
              />
            </div>
          </el-card>
        </el-col>
        <!-- 部门维度 -->
        <el-col :span="12">
          <el-card shadow="never" style="margin-left: 25px" v-if="form.dataScope === '1006005'">
            <template #header>
              <div class="dimension-header dimension-header-multiline">
                <div class="dimension-header-row">
                  <span>部门维度</span>
                  <el-input
                    v-model="deptFilterText"
                    placeholder="搜索部门"
                    size="small"
                    clearable
                    class="dimension-search-input"
                    @input="filterDeptTree"
                  >
                    <template #prefix>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>
                </div>
                <div class="dimension-header-row dimension-header-row-right">
                  <div class="dimension-header-right">
                    <el-checkbox v-model="isDeptExpand" @change="changeDeptExpand" :disabled="!canEditDataScope">
                      展开/折叠
                    </el-checkbox>
                    <el-checkbox v-model="isDeptCheckStrictly" :disabled="!canEditDataScope"> 父子联动 </el-checkbox>
                  </div>
                </div>
              </div>
            </template>
            <div class="tree-container dept-tree-container">
              <el-tree
                :data="deptTrees"
                show-checkbox
                ref="deptTreeRef"
                node-key="id"
                :props="deptTreeProps"
                empty-text="暂无可选部门"
                :default-expand-all="isDeptExpand"
                :check-strictly="!isDeptCheckStrictly"
                :default-checked-keys="form.depts"
                :disabled="!canEditDataScope"
                @check-change="onDeptTreeCheckChange"
                :filter-node-method="filterDeptNode"
              />
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-row v-if="!canEditDataScope">
        <el-col>
          <el-alert
            title="当前菜单未开放数据权限，如需配置请前往菜单管理开启"
            type="info"
            :closable="false"
            show-icon
            style="margin: 16px 0"
          />
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElTree } from 'element-plus';
import { Search } from '@element-plus/icons-vue';

const props = defineProps<{
  form: {
    dataScope: string;
    users: string[];
    depts: string[];
  };
  dataScopeOptions: any[];
  canEditDataScope: boolean;
  userInfos: any[];
  deptTrees: any[];
  userTreeProps: any;
  deptTreeProps: any;
}>();
const emit = defineEmits(['update:form', 'change', 'update:deptExpand', 'update:deptCheckStrictly']);

const userTreeRef = ref<InstanceType<typeof ElTree>>();
const deptTreeRef = ref<InstanceType<typeof ElTree>>();

const isDeptExpand = ref(true);
const isDeptCheckStrictly = ref(true);

const emitChange = () => {
  emit('change', { ...props.form });
};

const onUserTreeCheckChange = () => {
  const keys = userTreeRef.value?.getCheckedKeys() ?? [];
  emit('update:form', { ...props.form, users: keys });
  emitChange();
};
const onDeptTreeCheckChange = () => {
  const keys = deptTreeRef.value?.getCheckedKeys() ?? [];
  emit('update:form', { ...props.form, depts: keys });
  emitChange();
};
const changeDeptExpand = (val: boolean) => {
  for (const i in deptTreeRef.value!.store.nodesMap) {
    deptTreeRef.value!.store.nodesMap[i].expanded = val;
  }
};

// 用户维度搜索
const userFilterText = ref('');
const filterUserTree = () => {
  userTreeRef.value?.filter(userFilterText.value);
};
const filterUserNode = (value: string, data: any) => {
  if (!value) return true;
  return data.nickname?.includes(value);
};

// 部门维度搜索
const deptFilterText = ref('');
const filterDeptTree = () => {
  deptTreeRef.value?.filter(deptFilterText.value);
};
const filterDeptNode = (value: string, data: any) => {
  if (!value) return true;
  return data.name?.includes(value);
};
</script>

<style scoped lang="scss">
.menu-data-row {
  margin-bottom: 12px;
  .label-row {
    font-size: 14px;
    margin-bottom: 8px;
    color: #444;
    display: flex;
    align-items: center;
  }
}

/* 统一头部布局和样式 */
.dimension-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 38px;
  .dimension-header-left {
    display: flex;
    align-items: center;
    span {
      font-weight: 500;
      color: #222;
      font-size: 15px;
    }
    .dimension-search-input {
      margin-left: 13px;
      width: 150px;
      .el-input__inner {
        font-size: 13px;
        height: 28px;
      }
      .el-input__prefix {
        color: #409eff;
      }
    }
  }
  .dimension-header-right {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-left: 20px;
    .el-checkbox {
      font-size: 13px;
    }
  }
}

/* 卡片和树区域保持简洁 */
.el-card {
  min-height: 320px;
  border-radius: 10px;
  box-shadow: none !important;
  border: 1px solid #ececec !important;
  background: #fff;
  padding: 18px 16px 14px 16px;
  margin-bottom: 10px;
}

.tree-container {
  height: 260px;
  overflow-y: auto;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #f4f4f4;
  box-shadow: none !important;
  margin-bottom: 10px;
  padding: 8px 12px 4px 12px;
}

.user-tree-container,
.dept-tree-container {
  height: 260px;
  box-shadow: none !important;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #f4f4f4;
}

/* 输入框通用优化 */
.el-input {
  .el-input__inner {
    height: 28px !important;
    font-size: 13px;
  }
  .el-input__prefix {
    color: #409eff;
  }
}

.el-alert {
  margin: 16px 0;
}

.dimension-header-multiline {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-height: 44px;
  .dimension-header-row {
    display: flex;
    align-items: center;
    min-height: 34px;
    &.dimension-header-row-right {
      justify-content: flex-end;
      margin-top: 2px;
    }
    span {
      font-weight: 500;
      color: #222;
      font-size: 15px;
      margin-right: 14px;
    }
    .dimension-search-input {
      width: 150px;
      .el-input__inner {
        font-size: 13px;
        height: 28px;
      }
      .el-input__prefix {
        color: #409eff;
      }
    }
    .dimension-header-right {
      display: flex;
      gap: 10px;
      .el-checkbox {
        font-size: 13px;
      }
    }
  }
}

/* ===== 暗黑模式覆盖区块（放最后，专用于穿透ElementPlus暗黑主题）===== */
:deep(.el-card) {
  background: var(--el-bg-color-overlay, #202127) !important;
  border-color: var(--el-border-color, #23272e) !important;
  color: var(--el-text-color-primary, #e0e0e0);
}
:deep(.tree-container),
:deep(.user-tree-container),
:deep(.dept-tree-container) {
  background: var(--el-bg-color-overlay, #181a20) !important;
  border-color: var(--el-border-color, #2c2c2c) !important;
  color: var(--el-text-color-primary, #e0e0e0);
}
:deep(.el-tree) {
  background: var(--el-bg-color-overlay, #181a20) !important;
  color: var(--el-text-color-regular, #e0e0e0) !important;
}
:deep(.el-tree-node__content) {
  background: var(--el-bg-color-overlay, #181a20) !important;
  color: var(--el-text-color-regular, #e0e0e0) !important;
}
:deep(.el-input__inner),
:deep(.el-select__input) {
  background: var(--el-fill-color-blank, #191a20) !important;
  color: var(--el-text-color-regular, #d3d7db) !important;
  border-color: var(--el-border-color, #363636) !important;
}
:deep(.el-input__prefix) {
  color: var(--el-color-primary);
}
:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  border-color: var(--el-color-primary, #49b1fa) !important;
  background-color: var(--el-color-primary, #49b1fa) !important;
}
:deep(.el-checkbox__label) {
  color: var(--el-text-color-regular, #e0e0e0) !important;
}
</style>
