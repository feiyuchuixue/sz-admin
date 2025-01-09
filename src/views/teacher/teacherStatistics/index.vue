<template>
  <div class="table-box">
    <ProTable
      ref="proTableRef"
      title="教师统计"
      :indent="20"
      :columns="columns"
      :search-columns="searchColumns"
      :request-api="getTableList"
      row-key="id"
    >
      <!-- 表格 header 按钮 -->
      <template #tableHeader="scope">
        <el-button type="primary" v-auth="'teacher.statistics.create'" :icon="CirclePlus" @click="openAddEdit('新增教师统计')">
          新增
        </el-button>
        <el-button
          v-auth="'teacher.statistics.remove'"
          type="danger"
          :icon="Delete"
          plain
          :disabled="!scope.isSelected"
          @click="batchDelete(scope.selectedListIds)"
        >
          批量删除
        </el-button>
        <el-button v-auth="'teacher.statistics.import'" type="primary" :icon="Upload" plain @click="importData"> 导入 </el-button>
        <el-button v-auth="'teacher.statistics.export'" type="primary" :icon="Download" plain @click="downloadFile">
          导出
        </el-button>
      </template>
      <template #operation="{ row }">
        <el-button
          v-auth="'teacher.statistics.update'"
          type="primary"
          link
          :icon="EditPen"
          @click="openAddEdit('编辑教师统计', row, false)"
        >
          编辑
        </el-button>
        <el-button v-auth="'teacher.statistics.remove'" type="primary" link :icon="Delete" @click="deleteInfo(row)">
          删除
        </el-button>
      </template>
    </ProTable>
    <TeacherStatisticsForm ref="teacherStatisticsRef" />
    <ImportExcel ref="ImportExcelRef" />
  </div>
</template>

<script setup lang="ts">
import { h, ref } from 'vue';
import { CirclePlus, Delete, EditPen, Upload, Download } from '@element-plus/icons-vue';
import ProTable from '@/components/ProTable/index.vue';
import {
  createTeacherStatisticsApi,
  removeTeacherStatisticsApi,
  updateTeacherStatisticsApi,
  getTeacherStatisticsListApi,
  getTeacherStatisticsDetailApi,
  importTeacherStatisticsExcelApi,
  exportTeacherStatisticsExcelApi,
  remoteTeacherStaticsSearchApi
} from '@/api/modules/teacher/teacherStatistics';
import { useHandleData } from '@/hooks/useHandleData';
import TeacherStatisticsForm from '@/views/teacher/teacherStatistics/components/TeacherStatisticsForm.vue';
import { useOptionsStore } from '@/stores/modules/options';
import type { ColumnProps, ProTableInstance, SearchProps } from '@/components/ProTable/interface';
import type { ITeacherStatistics } from '@/api/interface/teacher/teacherStatistics';
import ImportExcel from '@/components/ImportExcel/index.vue';
import { downloadTemplate } from '@/api/modules/system/common';
import { ElMessageBox } from 'element-plus';
import { useDownload } from '@/hooks/useDownload';
import RemoteSearchSelect from '@/components/RemoteSearchSelect/index.vue';

defineOptions({
  name: 'TeacherStatisticsView'
});
const optionsStore = useOptionsStore();
const proTableRef = ref<ProTableInstance>();
// 表格配置项
const columns: ColumnProps<ITeacherStatistics.Row>[] = [
  { type: 'selection', width: 80 },
  { prop: 'year', label: '统计年限' },
  { prop: 'month', label: '统计月份' },
  { prop: 'duringTime', label: '统计年月' },
  { prop: 'teacherId', label: '教师id' },
  {
    prop: 'teacherCommonType',
    label: '讲师区分类型',
    tag: true,
    enum: optionsStore.getDictOptions('account_status'),
    fieldNames: {
      label: 'codeName',
      value: 'id',
      tagType: 'callbackShowStyle'
    }
  },
  { prop: 'totalTeaching', label: '授课总数' },
  { prop: 'totalClassCount', label: '服务班次数' },
  { prop: 'totalHours', label: '课时总数' },
  {
    prop: 'checkStatus',
    label: '核对状态',
    tag: true,
    enum: optionsStore.getDictOptions('account_status'),
    fieldNames: {
      label: 'codeName',
      value: 'id',
      tagType: 'callbackShowStyle'
    }
  },
  { prop: 'checkTime', label: '核对时间' },
  { prop: 'lastSyncTime', label: '最近一次同步时间' },
  { prop: 'remark', label: '备注' },
  { prop: 'operation', label: '操作', width: 250, fixed: 'right' }
];
// 搜索条件项
const searchColumns: SearchProps[] = [
  { prop: 'year', label: '统计年限', el: 'input' },
  { prop: 'month', label: '统计月份', el: 'input' },
  {
    prop: 'duringTime',
    label: '统计年月',
    el: 'date-picker',
    span: 2,
    props: {
      type: 'datetimerange',
      valueFormat: 'YYYY-MM-DD HH:mm:ss'
    }
  },
  {
    prop: 'remoteTeacherId',
    label: '演示：远程搜索',
    el: 'select',
    render: (params: any) => {
      return h(RemoteSearchSelect, {
        modelValue: params.modelValue,
        'onUpdate:modelValue': params['onUpdate:modelValue'],
        placeholder: '教师id，输入数字触发搜索',
        fetchOptions: remoteTeacherStaticsSearchApi,
        api: (query: any) => ({ keyword: query }),
        fieldMappings: {
          key: 'id',
          label: 'teacherId',
          value: 'id'
        }
      });
    }
  },
  {
    prop: 'teacherCommonType',
    label: '讲师区分类型',
    el: 'select',
    enum: optionsStore.getDictOptions('account_status'),
    fieldNames: {
      label: 'codeName',
      value: 'id',
      tagType: 'callbackShowStyle'
    }
  },
  { prop: 'totalTeaching', label: '授课总数', el: 'input' },
  { prop: 'totalClassCount', label: '服务班次数', el: 'input' },
  { prop: 'totalHours', label: '课时总数', el: 'input' },
  {
    prop: 'checkStatus',
    label: '核对状态',
    el: 'select',
    fieldNames: {
      label: 'codeName',
      value: 'id',
      tagType: 'callbackShowStyle'
    }
  },
  {
    prop: 'checkTime',
    label: '核对时间',
    el: 'date-picker',
    span: 2,
    props: {
      type: 'datetimerange',
      valueFormat: 'YYYY-MM-DD HH:mm:ss'
    }
  },
  {
    prop: 'lastSyncTime',
    label: '最近一次同步时间',
    el: 'date-picker',
    span: 2,
    props: {
      type: 'datetimerange',
      valueFormat: 'YYYY-MM-DD HH:mm:ss'
    }
  }
];
// 获取table列表
const getTableList = (params: ITeacherStatistics.Query) => {
  let newParams = formatParams(params);
  return getTeacherStatisticsListApi(newParams);
};
const formatParams = (params: ITeacherStatistics.Query) => {
  let newParams = JSON.parse(JSON.stringify(params));
  newParams.checkTime && (newParams.checkTimeStart = newParams.checkTime[0]);
  newParams.checkTime && (newParams.checkTimeEnd = newParams.checkTime[1]);
  delete newParams.checkTime;
  return newParams;
};
// 打开 drawer(新增、查看、编辑)
const teacherStatisticsRef = ref<InstanceType<typeof TeacherStatisticsForm>>();
const openAddEdit = async (title: string, row: any = {}, isAdd = true) => {
  if (!isAdd) {
    const record = await getTeacherStatisticsDetailApi({ id: row?.id });
    row = record?.data;
  }
  const params = {
    title,
    row: { ...row },
    api: isAdd ? createTeacherStatisticsApi : updateTeacherStatisticsApi,
    getTableList: proTableRef.value?.getTableList
  };
  teacherStatisticsRef.value?.acceptParams(params);
};
// 删除信息
const deleteInfo = async (params: ITeacherStatistics.Row) => {
  await useHandleData(removeTeacherStatisticsApi, { ids: [params.id] }, `删除【${params.id}】教师统计`);
  proTableRef.value?.getTableList();
};
// 批量删除信息
const batchDelete = async (ids: (string | number)[]) => {
  await useHandleData(removeTeacherStatisticsApi, { ids }, '删除所选教师统计');
  proTableRef.value?.clearSelection();
  proTableRef.value?.getTableList();
};
// 导入
const ImportExcelRef = ref<InstanceType<typeof ImportExcel>>();
const importData = () => {
  const params = {
    title: '教师统计',
    templateName: '教师统计模板',
    tempApi: downloadTemplate,
    importApi: importTeacherStatisticsExcelApi,
    getTableList: proTableRef.value?.getTableList
  };
  ImportExcelRef.value?.acceptParams(params);
};
// 导出
const downloadFile = async () => {
  ElMessageBox.confirm('确认导出教师统计数据?', '温馨提示', { type: 'warning' }).then(() => {
    let newParams = formatParams(proTableRef.value?.searchParam as ITeacherStatistics.Query);
    useDownload(exportTeacherStatisticsExcelApi, '教师统计', newParams);
  });
};
</script>
