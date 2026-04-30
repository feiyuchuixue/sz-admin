<template>
  <el-dialog v-model="visible" :title="dialogTitle" width="420px" draggable :close-on-click-modal="false" @closed="handleClosed">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px" label-position="left">
      <el-form-item :label="fieldLabel" prop="value">
        <el-input
          v-model="formData.value"
          :placeholder="fieldPlaceholder"
          :maxlength="fieldType === 'phone' ? 11 : 100"
          clearable
          :disabled="submitting"
        />
      </el-form-item>
      <el-form-item label="当前密码" prop="password">
        <el-input
          v-model="formData.password"
          type="password"
          placeholder="请输入当前账户密码"
          show-password
          clearable
          :disabled="submitting"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :disabled="submitting" @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">确认修改</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { useUserStore } from '@/stores/modules/user';
import { updateUserContact, getUserProfile } from '@/api/modules/system/user';

const userStore = useUserStore();
const visible = ref(false);
const submitting = ref(false);
const formRef = ref<FormInstance>();
const fieldType = ref<'phone' | 'email'>('phone');

const formData = reactive({
  value: '',
  password: ''
});

const dialogTitle = computed(() => (fieldType.value === 'phone' ? '修改手机号' : '修改邮箱'));
const fieldLabel = computed(() => (fieldType.value === 'phone' ? '新手机号' : '新邮箱'));
const fieldPlaceholder = computed(() => (fieldType.value === 'phone' ? '请输入新手机号' : '请输入新邮箱地址'));

// 手机号正则
const phoneReg = /^1[3-9]\d{9}$/;
// 邮箱正则
const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const rules = computed<FormRules>(() => ({
  value: [
    { required: true, message: `${fieldLabel.value}不能为空`, trigger: 'blur' },
    {
      validator: (_rule: unknown, val: string, callback: (err?: Error) => void) => {
        if (fieldType.value === 'phone' && !phoneReg.test(val)) {
          callback(new Error('请输入正确的手机号'));
        } else if (fieldType.value === 'email' && !emailReg.test(val)) {
          callback(new Error('请输入正确的邮箱格式'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  password: [{ required: true, message: '当前密码不能为空', trigger: 'blur' }]
}));

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  submitting.value = true;
  try {
    await updateUserContact({
      field: fieldType.value,
      value: formData.value,
      password: formData.password
    });
    // 刷新 profile
    const { data } = await getUserProfile();
    userStore.setProfile(data);
    ElMessage.success('修改成功');
    visible.value = false;
  } finally {
    submitting.value = false;
  }
};

const handleClosed = () => {
  formRef.value?.resetFields();
  formData.value = '';
  formData.password = '';
};

// 对外暴露打开方法
const open = (type: 'phone' | 'email') => {
  fieldType.value = type;
  visible.value = true;
};

defineExpose({ open });
</script>
