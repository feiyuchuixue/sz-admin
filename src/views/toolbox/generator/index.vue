<template>
  <div class="table-box">
    <ProTable
      ref="proTableRef"
      title="代码生成"
      :indent="20"
      :columns="columns"
      :search-columns="searchColumns"
      :request-api="getTableList"
      row-key="tableName"
    >
      <!-- 表格 header 按钮 -->
      <template #tableHeader="scope">
        <el-button type="info" :icon="Upload" @click="openImport" v-auth="'generator.import'"> 导入 </el-button>
        <el-button type="danger" :icon="Delete" @click="delGeneBatch" :disabled="!scope.isSelected" v-auth="'generator.remove'">
          删除
        </el-button>
      </template>

      <template #operation="{ row }">
        <el-button type="primary" link :icon="View" @click="previewGene(row)" v-auth="'generator.preview'"> 预览 </el-button>
        <el-button type="primary" link :icon="EditPen" @click="openEditDialog('编辑', row)" v-auth="'generator.update'">
          编辑
        </el-button>
        <el-button type="primary" link :icon="Delete" @click="delGene(row)" v-auth="'generator.remove'"> 删除 </el-button>
        <el-button type="primary" link @click="download(row)" v-auth="'generator.zip'">
          <el-icon class="el-icon--right">
            <SvgIcon name="zip" />
          </el-icon>
          &nbsp;&nbsp;zip下载
        </el-button>
        <el-button type="primary" link :icon="Download" @click="codeGene(row)" v-auth="'generator.generator'">
          生成代码
        </el-button>
      </template>
    </ProTable>
    <Import ref="importRef" @finished="refreshData" />
    <EditForm ref="editFormRef" />
    <Preview ref="previewRef" />
    <el-dialog v-model="generatorVisible" title="代码生成信息" center align-center append-to-body width="65%">
      <div class="tip custom-block">
        <template v-for="item in generatorCodeInfos" :key="item">
          <el-text type="info" class="el-text-code" size="small" line-clamp="2"> {{ item }} </el-text><br />
        </template>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="generatorVisible = false"> 确认 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import ProTable from '@/components/ProTable/index.vue';
import { Delete, Download, EditPen, Upload, View } from '@element-plus/icons-vue';
import type { GeneratorInfo, GeneratorQuery } from '@/api/types/toolbox/generator';
import type { ColumnProps, ProTableInstance, SearchProps } from '@/components/ProTable/interface';
import { ref } from 'vue';
import {
  codeGenerator,
  deleteGenerator,
  getGeneratorList,
  saveGenerator,
  downloadZip,
  checkDisk
} from '@/api/modules/toolbox/generator';
import Import from '@/views/toolbox/generator/components/Import.vue';
import EditForm from '@/views/toolbox/generator/components/EditForm.vue';
import { useDebounceFn } from '@vueuse/core';
import { isLocalEnv } from '@/utils';
import { useDownload } from '@/hooks/useDownload';
import Preview from '@/views/toolbox/generator/components/Preview.vue';
import SvgIcon from '@/components/SvgIcon/index.vue';
import { ElMessage, ElMessageBox } from 'element-plus';

defineOptions({
  name: 'Generator'
});

// 表格配置项
const columns: ColumnProps<GeneratorInfo>[] = [
  { type: 'selection', width: 80 },
  { type: 'index', label: '#', width: 80 },
  { prop: 'tableName', label: '表名称' },
  { prop: 'tableComment', label: '表描述' },
  { prop: 'className', label: '实体' },
  { prop: 'createTime', label: '创建时间' },
  { prop: 'updateTime', label: '修改时间' },
  { prop: 'operation', label: '操作', width: 400, fixed: 'right' }
];

const searchColumns: SearchProps[] = [
  { prop: 'tableName', label: '表名称', el: 'input' },
  { prop: 'tableComment', label: '表描述', el: 'input' }
];

// 获取 ProTable 元素，调用其获取刷新数据方法（还能获取到当前查询参数，方便导出携带参数）
const proTableRef = ref<ProTableInstance>();
const checkDiskVisible = ref(false);
const generatorVisible = ref(false);
const generatorCodeInfos = ref<string[]>([]);

// 获取table列表
const getTableList = (params: GeneratorQuery) => getGeneratorList(params);

const importRef = ref<InstanceType<typeof Import>>();
const openImport = () => {
  importRef.value?.show();
};
const refreshData = () => {
  proTableRef.value?.getTableList();
};

const editFormRef = ref<InstanceType<typeof EditForm>>();
// 编辑
const openEditDialog = (title: string, row = {}) => {
  const params: View.DefaultParams = {
    title,
    row: { ...row },
    api: saveGenerator
  };
  editFormRef.value?.acceptParams(params);
};
// 代码生成
const codeGene = (row: GeneratorInfo) => {
  if (!isLocalEnv()) {
    ElMessage.warning({ message: '生成代码仅在dev或local环境可用！！' });
    return;
  }
  checkDisk(row.tableName)
    .then(record => {
      if (!record.data.checkedApiPath || !record.data.checkedWebPath) {
        checkDiskVisible.value = true;
        let context = '';
        if (!record.data.checkedApiPath) {
          context +=
            '<div style="color: var(--el-color-error)">--JAVA项目路径不存在</div><br/><div style="font-size: 12px;font-weight: bold;color: var(--el-color-warning)">' +
            record.data.pathApi +
            '</div>';
        }
        if (!record.data.checkedWebPath) {
          context +=
            '<br/><div style="color: var(--el-color-error)">--VUE项目路径不存在</div><br/><div style="font-size: 12px;font-weight: bold;color: var(--el-color-warning)">' +
            record.data.pathWeb +
            '</div>';
        }
        ElMessageBox({
          title: '错误信息',
          type: 'error',
          center: true,
          message: context,
          dangerouslyUseHTMLString: true,
          showConfirmButton: false
        });
        return;
      }
      codeGenerator(row.tableName).then(res => {
        generatorVisible.value = true;
        generatorCodeInfos.value = res.data;
        ElMessage.success({ message: '生成成功！' });
      });
    })
    .catch(() => {
      ElMessage.error({ message: '生成失败！' });
    });
};

// 压缩文件下载
const download = (row: GeneratorInfo) => {
  useDownload(downloadZip, '', { tableNames: [row.tableName] });
};
// 删除
const delGene = (row: GeneratorInfo) => {
  ElMessageBox.confirm('您是否确认删除?', '温馨提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteGenerator({ tableNames: [row.tableName] }).then(() => {
      ElMessage.success({ message: '删除成功！' });
      refreshData();
    });
  });
};
//批量删除
const delGeneBatch = useDebounceFn(() => {
  const ids = proTableRef.value!.selectedListIds;
  if (ids.length <= 0) {
    ElMessage.error({ message: '至少选择一个表信息' });
    return;
  }
  deleteGenerator({ tableNames: ids }).then(() => {
    ElMessage.success({ message: '删除成功！' });
    refreshData();
  });
});

// 预览
const previewRef = ref();
const previewGene = (row: GeneratorInfo) => {
  const param = {
    title: '',
    tableName: row.tableName
  };
  previewRef.value?.acceptParams(param);
};
</script>

<style scoped lang="scss">
.custom-block.tip {
  padding: 8px 16px;
  background-color: var(--div-bg-box);
  border-radius: 4px;
}
.el-text-code {
  font-weight: bold;
  padding-top: 5px;
  word-break: break-all;
}
</style>
