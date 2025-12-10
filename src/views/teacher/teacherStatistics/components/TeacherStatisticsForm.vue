<template>
  <el-dialog v-model="visible" :title="`${paramsProps.title}`" :destroy-on-close="true" :width="dialogWidth" draggable>
    <el-form
      ref="ruleFormRef"
      label-width="140px"
      label-suffix=" :"
      :rules="rules"
      :model="paramsProps.row"
      @submit.enter.prevent="handleSubmit"
    >
      <el-form-item label="统计年限" prop="year">
        <el-input v-model="paramsProps.row.year" placeholder="请填写统计年限" clearable />
      </el-form-item>
      <el-form-item label="统计月份" prop="month">
        <el-input v-model="paramsProps.row.month" placeholder="请填写统计月份" clearable />
      </el-form-item>
      <el-form-item label="统计年月" prop="duringTime">
        <el-input v-model="paramsProps.row.duringTime" placeholder="请填写统计年月" clearable />
      </el-form-item>
      <el-form-item label="教师id" prop="teacherId">
        <el-input v-model="paramsProps.row.teacherId" placeholder="请填写教师id" clearable />
      </el-form-item>
      <el-form-item label="讲师区分类型" prop="teacherCommonType">
        <el-select v-model="paramsProps.row.teacherCommonType" clearable placeholder="请选择讲师区分类型">
          <el-option v-for="item in accountStatus" :key="item.id" :label="item.codeName" :value="Number(item.id)" />
        </el-select>
      </el-form-item>
      <el-form-item label="授课总数" prop="totalTeaching">
        <el-input-number v-model="paramsProps.row.totalTeaching" :precision="0" :min="1" :max="999999" />
      </el-form-item>
      <el-form-item label="服务班次数" prop="totalClassCount">
        <el-input-number v-model="paramsProps.row.totalClassCount" :precision="0" :min="1" :max="999999" />
      </el-form-item>
      <el-form-item label="课时总数" prop="totalHours">
        <el-input-number v-model="paramsProps.row.totalHours" :precision="0" :min="1" :max="999999" />
      </el-form-item>
      <el-form-item label="核对状态" prop="checkStatus">
        <el-select v-model="paramsProps.row.checkStatus" clearable placeholder="请选择核对状态">
          <el-option v-for="item in accountStatus" :key="item.id" :label="item.codeName" :value="Number(item.id)" :debug="true" />
        </el-select>
      </el-form-item>
      <el-form-item label="核对时间" prop="checkTime">
        <el-date-picker
          clearable
          v-model="paramsProps.row.checkTime"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm:ss"
          placeholder="请选择核对时间"
        />
      </el-form-item>
      <el-form-item label="最近一次同步时间" prop="lastSyncTime">
        <el-date-picker
          clearable
          v-model="paramsProps.row.lastSyncTime"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm:ss"
          placeholder="请选择最近一次同步时间"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="paramsProps.row.remark" placeholder="请填写备注" clearable />
      </el-form-item>
      <el-form-item label="附件" prop="url">
        <upload-files
          v-model:modelValue="fileUrls"
          :limit="5"
          :file-size="3"
          :dir="'teacher'"
          :debug="true"
          @all-success="handleAllSuccess"
        />
      </el-form-item>
      <el-form-item label="内容" prop="contentHtml">
        <jodit-editor
          v-model="paramsProps.row.contentHtml"
          :upload-dir="'teacher/aabb'"
          :height="'400px'"
          style="width: 100%; max-width: 100%; box-sizing: border-box"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false"> 取消 </el-button>
      <el-button type="primary" @click="handleSubmit"> 确定 </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { type ElForm, ElMessage } from 'element-plus';
import { useDictOptions } from '@/hooks/useDictOptions';
import UploadFiles from '@/components/Upload/UploadFiles.vue';
import type { IUploadResult } from '@/api/types/system/upload';
import JoditEditor from '@/components/JoditEditor/index.vue';
import { useDialogWidth } from '@/hooks/useDialogWidth';

defineOptions({
  name: 'TeacherStatisticsForm'
});
const dialogWidth = useDialogWidth();
const accountStatus = useDictOptions('account_status');

const rules = reactive({
  year: [{ required: true, message: '请填写统计年限' }],
  month: [{ required: true, message: '请填写统计月份' }],
  teacherId: [{ required: true, message: '请填写教师id' }],
  teacherCommonType: [{ required: true, message: '请填写讲师区分类型' }],
  checkStatus: [{ required: true, message: '请填写核对状态' }]
});

const visible = ref(false);
const paramsProps = ref<View.DefaultParams>({
  title: '',
  row: {},
  api: undefined,
  getTableList: undefined
});

const fileUrls = ref<IUploadResult[] | string[]>([]);

// 接收父组件传过来的参数
const acceptParams = (params: View.DefaultParams) => {
  paramsProps.value = params;
  fileUrls.value = params.row.url; // 附件回显--从表格数据传过来
  visible.value = true;
};

// 提交数据（新增/编辑）
const ruleFormRef = ref<InstanceType<typeof ElForm>>();
const handleSubmit = () => {
  ruleFormRef.value!.validate(async valid => {
    if (!valid) return;
    try {
      paramsProps.value.row.url = fileUrls.value; // 附件数据添加--从上传组件获取
      await paramsProps.value.api!(paramsProps.value.row);
      ElMessage.success({ message: `${paramsProps.value.title}成功！` });
      paramsProps.value.getTableList!();
      visible.value = false;
    } catch (error) {
      console.log(error);
    }
  });
};

function handleAllSuccess(list: IUploadResult[]) {
  console.log('全部上传成功，共', list.length, '条：', list);
}

defineExpose({
  acceptParams
});
</script>

<style scoped lang="scss"></style>
