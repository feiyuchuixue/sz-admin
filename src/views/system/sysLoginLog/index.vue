<template>
  <div class="table-box">
    <ProTable
      ref="proTableRef"
      title="登陆日志表"
      :indent="20"
      :columns="columns"
      :search-columns="searchColumns"
      :request-api="getTableList"
      row-key="id"
    >
      <!-- 表格 header 按钮 -->
      <template>
        <el-button v-auth="'sys.login.log.export'" type="primary" :icon="Download" plain @click="downloadFile"> 导出 </el-button>
      </template>
    </ProTable>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Download } from '@element-plus/icons-vue';
import ProTable from '@/components/ProTable/index.vue';
import { getSysLoginLogListApi, exportSysLoginLogExcelApi } from '@/api/modules/system/sysLoginLog';
import { useDictOptions } from '@/hooks/useDictOptions';
import type { ColumnProps, ProTableInstance, SearchProps } from '@/components/ProTable/interface';
import type { SysLoginLogQuery, SysLoginLogRow } from '@/api/types/system/sysLoginLog';
import { useDownload } from '@/hooks/useDownload';
import { useDict } from '@/hooks/useDict';

defineOptions({
  name: 'SysLoginLogView'
});
// 使用useDict Hook 主动加载字典
useDict(['login_status']);
const proTableRef = ref<ProTableInstance>();
// 表格配置项
const columns: ColumnProps<SysLoginLogRow>[] = [
  { type: 'selection', width: 80 },
  { prop: 'userName', label: '用户名' },
  {
    prop: 'loginStatus',
    label: '登陆状态',
    tag: true,
    enum: useDictOptions('login_status'),
    fieldNames: {
      label: 'codeName',
      value: 'id',
      tagType: 'callbackShowStyle'
    }
  },
  { prop: 'loginTime', label: '登陆时间', width: 180 },
  { prop: 'ipAddress', label: 'ip地址' },
  { prop: 'loginLocation', label: '登陆地点' },
  { prop: 'browser', label: '浏览器类型' },
  { prop: 'os', label: '操作系统' },
  { prop: 'msg', label: '提示消息' },
  { prop: 'remark', label: '备注' }
];
// 搜索条件项
const searchColumns: SearchProps[] = [
  { prop: 'userName', label: '用户名', el: 'input' },
  {
    prop: 'loginStatus',
    label: '登陆状态',
    el: 'select',
    enum: useDictOptions('login_status'),
    fieldNames: {
      label: 'codeName',
      value: 'id',
      tagType: 'callbackShowStyle'
    }
  },
  {
    prop: 'loginTime',
    label: '登陆时间',
    el: 'date-picker',
    span: 2,
    props: {
      type: 'datetimerange',
      valueFormat: 'YYYY-MM-DD HH:mm:ss'
    }
  }
];
// 获取table列表
const getTableList = (params: SysLoginLogQuery) => {
  let newParams = formatParams(params);
  return getSysLoginLogListApi(newParams);
};
const formatParams = (params: SysLoginLogQuery) => {
  let newParams = JSON.parse(JSON.stringify(params));
  if (newParams.loginTime) {
    newParams.loginTimeStart = newParams.loginTime[0];
    newParams.loginTimeEnd = newParams.loginTime[1];
    delete newParams.loginTime;
  }

  return newParams;
};
// 导出
const downloadFile = async () => {
  let newParams = formatParams(proTableRef.value?.searchParam as SysLoginLogQuery);
  useDownload(exportSysLoginLogExcelApi, '登陆日志表', newParams);
};
</script>
