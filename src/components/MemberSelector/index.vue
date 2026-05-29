<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    width="60vw"
    top="20px"
    append-to-body
    destroy-on-close
    :close-on-click-modal="false"
    :before-close="onClose"
  >
    <div class="choose-box">
      <div class="choose-main-box">
        <el-tabs v-model="current">
          <el-tab-pane label="用户" name="user">
            <UserChoose ref="userChooseRef" :selected="userChoose" :change-selected="onChangeUser" />
          </el-tab-pane>
          <el-tab-pane label="角色" name="role">
            <RoleChoose ref="roleChooseRef" :selected="roleChoose" :change-selected="onChangeRole" />
          </el-tab-pane>
          <el-tab-pane label="部门" name="department">
            <DepartmentChoose ref="departmentChooseRef" :selected="departmentChoose" :change-selected="onChangeDepartment" />
          </el-tab-pane>
        </el-tabs>
      </div>
      <div class="right">
        <el-space direction="vertical" alignment="stretch" :size="20">
          <el-card>
            <template #header> 已选用户</template>
            <el-space wrap>
              <el-tag
                class="choose-tag"
                v-for="item in userChoose"
                :key="item.id"
                closable
                type="info"
                @close="() => onRemoveUser(item)"
              >
                {{ item.name }}
              </el-tag>
            </el-space>
          </el-card>
          <el-card>
            <template #header> 已选角色</template>
            <el-space wrap>
              <el-tag
                class="choose-tag"
                v-for="item in roleChoose"
                :key="item.id"
                closable
                type="info"
                @close="() => onRemoveRole(item)"
              >
                {{ item.name }}
              </el-tag>
            </el-space>
          </el-card>
          <el-card>
            <template #header> 已选部门</template>
            <el-space wrap>
              <el-tag
                class="choose-tag"
                v-for="item in departmentChoose"
                :key="item.id"
                closable
                type="info"
                @close="() => onRemoveDepartment(item)"
              >
                {{ item.name }}
              </el-tag>
            </el-space>
          </el-card>
        </el-space>
      </div>
    </div>
    <template #footer>
      <ElButton @click="onClose">取消</ElButton>
      <ElButton type="primary" @click="onCommit">确定</ElButton>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';
import { ElDialog, ElTabs, ElTabPane, ElTag, ElButton } from 'element-plus';
import UserChoose from '@/components/MemberSelector/user.vue';
import DepartmentChoose from '@/components/MemberSelector/department.vue';
import RoleChoose from '@/components/MemberSelector/role.vue';

defineOptions({
  name: 'MemberSelector'
});

type MemberSelectorProps = {
  title?: string;
  visible: boolean;
  data?: any;
};

const props = withDefaults(defineProps<MemberSelectorProps>(), {
  title: '多维选择器',
  visible: false,
  data: () => ({})
});

type MemberSelectorEmits = {
  (event: 'update:visible', state: boolean): void;
  (event: 'changeSelected', data: any): void;
};

const emit = defineEmits<MemberSelectorEmits>();

const userChooseRef = ref<InstanceType<typeof UserChoose>>();
const roleChooseRef = ref<InstanceType<typeof RoleChoose>>();
const departmentChooseRef = ref<InstanceType<typeof DepartmentChoose>>();
const current = ref('user');
const selectedData = ref<any>({});

const normalizeSelectedItems = (items: any) => {
  if (!Array.isArray(items)) return [];
  const itemMap = new Map<any, any>();
  items.forEach(item => {
    if (item?.id !== undefined && item?.id !== null) {
      itemMap.set(item.id, { ...item });
    }
  });
  return Array.from(itemMap.values());
};

const createSelectedData = (data: any = {}) => {
  const clone = JSON.parse(JSON.stringify(data || {}));
  return {
    user: normalizeSelectedItems(clone.user),
    role: normalizeSelectedItems(clone.role),
    department: normalizeSelectedItems(clone.department)
  };
};

// 记录初始值
const initialData = ref<any>({});

const onClose = () => {
  emit('update:visible', false);
};

const userChoose = computed(() => {
  return selectedData.value['user'] || [];
});

const roleChoose = computed(() => {
  return selectedData.value['role'] || [];
});

const departmentChoose = computed(() => {
  return selectedData.value['department'] || [];
});

const onChangeUser = (data: any[]) => {
  selectedData.value['user'] = data;
};
const onRemoveUser = (item: any) => {
  removeSelectedItem('user', item);
  userChooseRef.value?.removeSelected(item);
};

const onChangeRole = (data: any[]) => {
  selectedData.value['role'] = data;
};
const onRemoveRole = (item: any) => {
  removeSelectedItem('role', item);
  roleChooseRef.value?.removeSelected(item);
};

const onChangeDepartment = (data: any[]) => {
  selectedData.value['department'] = data;
};
const onRemoveDepartment = (item: any) => {
  removeSelectedItem('department', item);
  departmentChooseRef.value?.removeSelected(item);
};

const onCommit = () => {
  emit('changeSelected', createSelectedData(selectedData.value));
  onClose();
};

const removeSelectedItem = (type: 'user' | 'role' | 'department', item: any) => {
  selectedData.value[type] = (selectedData.value[type] || []).filter((selected: any) => selected.id !== item.id);
};

const resetData = () => {
  current.value = 'user';
  selectedData.value = createSelectedData();
  // 清空子组件选择（如有暴露 clearSelection 方法）
  userChooseRef.value?.clearSelection?.();
  roleChooseRef.value?.clearSelection?.();
  departmentChooseRef.value?.clearSelection?.();
};

const syncSelectedData = async () => {
  initialData.value = createSelectedData(props.data);
  selectedData.value = createSelectedData(initialData.value);
  await nextTick();
  if (!props.visible) return;
  // 通知子组件刷新选中（如有暴露 setSelection 方法）
  userChooseRef.value?.setSelection?.(selectedData.value.user);
  roleChooseRef.value?.setSelection?.(selectedData.value.role);
  departmentChooseRef.value?.setSelection?.(selectedData.value.department);
};

watch(
  () => props.visible,
  val => {
    if (val) {
      syncSelectedData();
    } else {
      // 关闭时重置
      resetData();
    }
  },
  { immediate: true }
);

watch(
  () => props.data,
  () => {
    if (props.visible) {
      syncSelectedData();
    }
  },
  { deep: true }
);
</script>

<style scoped lang="scss">
.choose-box {
  display: flex;
  gap: 20px;
  width: 100%;
  max-height: 70vh;
  overflow: hidden;

  .choose-main-box {
    flex: 1;
    height: 100%;
    :deep(.el-tabs__content) {
      height: calc(70vh - 54px);
      overflow-y: auto;
      background: var(--el-bg-color, #fff);
    }
  }
  .right {
    flex: none;
    width: 260px;
    background-color: var(--el-bg-color, #fafafa);
    border-left: 1px solid var(--el-border-color, #ebeef5);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-height: 66vh;
    overflow-y: auto;

    .el-card {
      border: none;
      background-color: transparent;
      box-shadow: none;

      .el-card__header {
        font-weight: 300;
        font-size: 14px;
        color: var(--el-text-color-regular, #333);
        padding: 0 0 8px;
      }

      .el-tag {
        margin: 4px 4px 0 0;
        max-width: 100%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        background-color: var(--el-tag-bg-color, #f0f2f5);
        color: var(--el-tag-text-color, #333);
        border: none;
      }
    }
  }
}

.choose-tag {
  max-width: 120px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  background: var(--el-tag-bg-color, #f0f2f5);
  color: var(--el-tag-text-color, #333);
}

/* 暗黑模式适配 */
:deep(.el-dialog) {
  background: var(--el-bg-color-page, #181818);
  color: var(--el-text-color-primary, #e5eaf3);
}
:deep(.el-card) {
  background: var(--el-bg-color-page, #181818) !important;
}

:deep(.el-tag) {
  background: #222;
  color: #e5eaf3;
}

[data-theme='dark'] .choose-box,
.dark .choose-box {
  .choose-main-box {
    :deep(.el-tabs__content) {
      background: #181818;
    }
  }
  .right {
    background: #222;
    border-left: 1px solid #444;
    .el-card {
      .el-card__header {
        color: #bfbfbf;
      }
      .el-tag {
        background: #333;
        color: #e5eaf3;
      }
    }
  }
}

[data-theme='dark'] .choose-tag,
.dark .choose-tag {
  background: #333 !important;
  color: #e5eaf3 !important;
}
</style>
