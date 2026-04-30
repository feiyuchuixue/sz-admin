<template>
  <el-dialog v-model="visible" title="基本资料" width="800px" draggable :close-on-click-modal="false">
    <div class="profile-content">
      <!-- 左侧头像卡片 -->
      <div class="profile-sidebar">
        <div class="avatar-card">
          <UploadImg
            v-model:image-url="formData.avatar"
            :preview-url="avatarPreviewUrl"
            scene-code="admin.user.logo"
            path-segments="user,logo"
            width="135px"
            height="135px"
            border-radius="50%"
            :crop="true"
            @change="handleAvatarChange"
          >
            <template #empty>
              <el-icon :size="36"><Avatar /></el-icon>
            </template>
          </UploadImg>
          <h3 class="avatar-card__name">{{ profile?.nickname || profile?.username || '用户' }}</h3>
          <p class="avatar-card__username">@{{ profile?.username }}</p>
        </div>
      </div>

      <!-- 分隔线 -->
      <el-divider direction="vertical" class="profile-divider" />

      <!-- 右侧表单 -->
      <div class="profile-main">
        <!-- 个人信息区 -->
        <div class="form-section">
          <h3 class="form-section__title">个人信息</h3>
          <el-form ref="formRef" :model="formData" label-width="70px" label-position="left" class="profile-form">
            <el-form-item label="用户名">
              <el-input :model-value="profile?.username" disabled class="input-readonly" />
            </el-form-item>
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="formData.nickname" placeholder="请输入昵称" maxlength="20" show-word-limit :disabled="saving" />
            </el-form-item>
            <el-form-item label="性别" prop="sex">
              <el-radio-group v-model="formData.sex" :disabled="saving">
                <el-radio :value="1">男</el-radio>
                <el-radio :value="2">女</el-radio>
                <el-radio :value="0">保密</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="生日" prop="birthday">
              <el-date-picker
                v-model="formData.birthday"
                type="date"
                placeholder="选择生日"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :disabled-date="disableFutureDate"
                :disabled="saving"
                style="width: 100%"
              />
            </el-form-item>
          </el-form>
        </div>

        <!-- 联系方式区 -->
        <div class="form-section">
          <h3 class="form-section__title">联系方式</h3>
          <el-form label-width="70px" label-position="left" class="profile-form">
            <el-form-item label="手机号">
              <div class="link-field">
                <span v-if="profile?.phone" class="link-value">{{ profile.phone }}</span>
                <span v-else class="link-placeholder">未绑定</span>
                <div class="link-actions">
                  <el-button v-if="profile?.phone" link type="primary" @click="contactDialogRef?.open('phone')">修改</el-button>
                  <el-button v-if="profile?.phone" link type="danger" @click="handleUnbind('phone')">解绑</el-button>
                  <el-button v-else link type="primary" @click="contactDialogRef?.open('phone')">绑定</el-button>
                </div>
              </div>
            </el-form-item>
            <el-form-item label="邮箱">
              <div class="link-field">
                <span v-if="profile?.email" class="link-value">{{ profile.email }}</span>
                <span v-else class="link-placeholder">未绑定</span>
                <div class="link-actions">
                  <el-button v-if="profile?.email" link type="primary" @click="contactDialogRef?.open('email')">修改</el-button>
                  <el-button v-if="profile?.email" link type="danger" @click="handleUnbind('email')">解绑</el-button>
                  <el-button v-else link type="primary" @click="contactDialogRef?.open('email')">绑定</el-button>
                </div>
              </div>
            </el-form-item>
          </el-form>
        </div>

        <!-- 操作按钮 -->
        <div class="profile-actions">
          <el-button :disabled="!hasChanges || saving" @click="resetForm">重置</el-button>
          <el-button type="primary" :loading="saving" :disabled="!hasChanges" @click="handleSave">保存修改</el-button>
        </div>
      </div>
    </div>
  </el-dialog>
  <ContactDialog ref="contactDialogRef" />
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Avatar } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/modules/user';
import { getUserProfile, updateUserProfile, unbindUserContact } from '@/api/modules/system/user';
import type { IResourceUploadResult } from '@/api/types/system/upload';
import UploadImg from '@/components/Upload/Img.vue';
import ContactDialog from './ContactDialog.vue';

const userStore = useUserStore();
const visible = ref(false);
const saving = ref(false);
const formRef = ref();
const contactDialogRef = ref<InstanceType<typeof ContactDialog>>();

const profile = computed(() => userStore.profile);

// 头像预览地址（profile 返回的是可访问 URL，存在 avatar 字段）
const avatarPreviewUrl = computed(() => profile.value?.avatar || '');

// 表单数据
const formData = reactive({
  nickname: '',
  sex: 0,
  birthday: '',
  avatar: '' // 头像 objectKey
});

// 原始数据快照（用于 hasChanges 判断和重置）
const originalData = reactive({
  nickname: '',
  sex: 0,
  birthday: '',
  avatar: ''
});

// 初始化表单数据
const initForm = () => {
  const p = profile.value;
  formData.nickname = p?.nickname || '';
  formData.sex = p?.sex ?? 0;
  formData.birthday = p?.birthday || '';
  formData.avatar = p?.avatar || '';
  // 同步快照
  Object.assign(originalData, { ...formData });
};

// 是否有变更
const hasChanges = computed(() => {
  return (
    formData.nickname !== originalData.nickname ||
    formData.sex !== originalData.sex ||
    formData.birthday !== originalData.birthday ||
    formData.avatar !== originalData.avatar
  );
});

// 头像上传成功回调
const handleAvatarChange = (fileInfo: IResourceUploadResult | null) => {
  if (fileInfo) {
    formData.avatar = fileInfo.objectKey;
  }
};

// 重置表单
const resetForm = () => {
  Object.assign(formData, { ...originalData });
};

// 保存
const handleSave = async () => {
  saving.value = true;
  try {
    await updateUserProfile({
      nickname: formData.nickname,
      sex: formData.sex,
      birthday: formData.birthday,
      avatar: formData.avatar
    });
    // 重新拉取最新 profile 并同步到 store
    const { data } = await getUserProfile();
    userStore.setProfile(data);
    // 更新快照
    Object.assign(originalData, { ...formData });
    ElMessage.success('保存成功');
    visible.value = false;
  } finally {
    saving.value = false;
  }
};

// 禁用未来日期
const disableFutureDate = (date: Date) => date.getTime() > Date.now();

// 解绑联系方式
const handleUnbind = async (field: 'phone' | 'email') => {
  const label = field === 'phone' ? '手机号' : '邮箱';
  try {
    const { value: pwd } = await ElMessageBox.prompt(`解绑后将无法通过${label}找回账户，请输入当前密码确认`, `解绑${label}`, {
      confirmButtonText: '确认解绑',
      cancelButtonText: '取消',
      inputType: 'password',
      inputPlaceholder: '请输入当前密码',
      inputValidator: (v: string) => !!v || '密码不能为空',
      confirmButtonClass: 'el-button--danger'
    });
    await unbindUserContact({ field, password: pwd });
    const { data } = await getUserProfile();
    userStore.setProfile(data);
    ElMessage.success('解绑成功');
  } catch {
    // 用户取消，不处理
  }
};

// 弹窗打开时初始化表单
const openDialog = () => {
  initForm();
  visible.value = true;
};

// profile 变化时（如外部刷新）同步更新预览
watch(
  () => profile.value?.avatar,
  () => {
    if (!hasChanges.value) initForm();
  }
);

defineExpose({ openDialog });
</script>

<style scoped lang="scss">
.profile-content {
  display: flex;
  align-items: flex-start;
  gap: 0;
  min-height: 380px;
}

/* 垂直分隔线 */
.profile-divider {
  height: auto;
  align-self: stretch;
  margin: 0 28px;
}

/* 左侧头像卡片 */
.profile-sidebar {
  flex: none;
  width: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 8px 0 16px;
  width: 100%;
}

.avatar-card__name {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 14px 0 4px 0;
  word-break: break-all;
  line-height: 1.4;
  width: 100%;
}

.avatar-card__username {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin: 0;
  line-height: 1.4;
}

/* 右侧主体 */
.profile-main {
  flex: 1;
  min-width: 0;
}

/* 分区 */
.form-section {
  margin-bottom: 20px;
}

.form-section__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 12px 0;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

/* 表单 */
.profile-form {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
  :deep(.el-form-item__label) {
    color: var(--el-text-color-regular);
    font-weight: 500;
  }
}

.input-readonly {
  --el-input-bg-color: var(--el-fill-color-lighter);
}

/* 联系方式只读字段 */
.link-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 12px;
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
  min-height: 32px;
  box-sizing: border-box;
}

.link-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  margin-left: 8px;

  .el-button {
    padding: 0;
    font-size: 13px;
  }
}
.link-value {
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.link-placeholder {
  color: var(--el-text-color-placeholder);
  font-size: 14px;
}

/* 操作按钮 */
.profile-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style>
