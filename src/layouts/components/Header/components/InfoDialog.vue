<template>
  <el-dialog v-model="visible" title="个人信息" width="500px" draggable>
    <el-descriptions :column="2" border>
      <el-descriptions-item>
        <template #label> 用户名 </template>
        {{ profile?.username }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label> 昵称 </template>
        {{ profile?.nickname }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label> 手机号 </template>
        {{ profile?.phone }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label> 邮箱 </template>
        {{ profile?.email }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label> 性别 </template>
        {{ showSex(profile?.sex) }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label> 年龄 </template>
        {{ calcAge(profile?.birthday) }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template #label> 生日 </template>
        {{ profile?.birthday }}
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="visible = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useUserStore } from '@/stores/modules/user';

const userStore = useUserStore();
const visible = ref(false);

const profile = computed(() => userStore.profile);

const openDialog = () => {
  visible.value = true;
};

const showSex = (sex: number | undefined) => {
  switch (sex) {
    case 1:
      return '男';
    case 2:
      return '女';
    default:
      return '未知';
  }
};

/**
 * 根据生日（YYYY-MM-DD）计算年龄，未填写时返回 '-'
 */
const calcAge = (birthday: string | undefined): string => {
  if (!birthday) return '-';
  const today = new Date();
  const birth = new Date(birthday);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? String(age) : '-';
};

defineExpose({ openDialog });
</script>
