<template>
  <div class="table-box">
    <ProTable
      ref="proTableRef"
      title="字典类型列表"
      :indent="20"
      :columns="columns"
      :search-columns="searchColumns"
      :request-api="getTableList"
    >
      <!-- 表格 header 按钮 -->
      <template #tableHeader="scope">
        <el-button type="primary" :icon="CirclePlus" @click="openAddEdit('新增字典类型')">
          新增字典类型</el-button>
        <el-button
          type="danger"
          :icon="Delete"
          plain
          :disabled="!scope.isSelected"
          @click="batchDelete(scope.selectedListIds)"
        >
          批量删除字典类型
        </el-button>
      </template>

      <template #typeCode="{ row }">
        <el-button type="primary" link @click="openDictDta(row)">
          {{ row?.typeCode }}
        </el-button>
      </template>

      <template #type="{ row }">
        <el-tag :type="row.type === 'system' ? 'primary' : 'info'">{{
          dictBusinessTypeLabel(row?.type)
        }}</el-tag>
      </template>

      <template #isShow="{ row }">
        <el-tag :type="row.isShow === 'T' ? 'success' : 'danger'">{{
          yesNoOptionsLabel(row?.isShow)
        }}</el-tag>
      </template>

      <template #operation="{ row }">
        <el-button
          v-if="row.isLock !== 'T'"
          type="primary"
          link
          :icon="EditPen"
          @click="openAddEdit('编辑字典类型', row, false)"
        >
          编辑
        </el-button>
        <el-button
          v-if="row.isLock !== 'T'"
          type="primary"
          link
          :icon="Delete"
          @click="deleteInfo(row)"
        >
          删除
        </el-button>
      </template>
    </ProTable>
    <DictTypeForm ref="dictTypeRef" />
    <DictData ref="dictDataRef" />
  </div>
</template>

<script setup lang="ts">
import { CirclePlus, Delete, EditPen } from '@element-plus/icons-vue'
import ProTable from '@/components/ProTable/index.vue'
import { addDictType, deleteDictType, editDictType, getDictType } from '@/api/modules/system/dict'
import {
  dictBusinessType,
  dictBusinessTypeLabel,
  yesNoOptions,
  yesNoOptionsLabel
} from '@/config/consts'
import DictTypeForm from '@/views/system/dictManage/components/DictTypeForm.vue'
import { useHandleData } from '@/hooks/useHandleData'
import DictData from '@/views/system/dictManage/components/DictData.vue'
import type { ColumnProps, ProTableInstance, SearchProps } from '@/components/ProTable/interface'
import type { IDict } from '@/api/interface/system/dict'
import { ref } from 'vue'

defineOptions({
  name: 'dictManage'
})

// 表格配置项
const columns: ColumnProps<IDict.DictType>[] = [
  { type: 'selection', width: 80, selectable: (row) => row.isLock !== 'T' },
  { prop: 'id', label: '编号', width: 100 },
  { prop: 'typeName', label: '名称' },
  { prop: 'typeCode', label: '类型', width: 200 },
  { prop: 'type', label: '业务类型', enum: dictBusinessType, width: 120 },
  { prop: 'isShow', label: '显示', enum: yesNoOptions, width: 80 },
  { prop: 'remark', label: '备注' },
  { prop: 'createTime', label: '创建时间' },
  { prop: 'updateTime', label: '修改时间' },
  { prop: 'operation', label: '操作', width: 150, fixed: 'right' }
]

const searchColumns: SearchProps[] = [
  { prop: 'typeName', label: '名称', el: 'input' },
  { prop: 'typeCode', label: '类型', el: 'input' }
]

// 获取 ProTable 元素，调用其获取刷新数据方法（还能获取到当前查询参数，方便导出携带参数）
const proTableRef = ref<ProTableInstance>()

// 获取table列表
const getTableList = (params: IDict.DictTypeQuery) => getDictType(params)

// 打开 drawer(新增、查看、编辑)
const dictTypeRef = ref<InstanceType<typeof DictTypeForm>>()
const openAddEdit = (title: string, row = {}, isAdd = true) => {
  if (isAdd) {
    row = { type: 'business' }
  }
  const params: View.DefaultParams = {
    title,
    row: { ...row },
    api: isAdd ? addDictType : editDictType,
    getTableList: proTableRef.value?.getTableList,
    isAdd: isAdd
  }
  dictTypeRef.value?.acceptParams(params)
}

// 删除信息
const deleteInfo = async (params: IDict.DictType) => {
  await useHandleData(deleteDictType, { ids: [params.id] }, `删除【${params.typeCode}】字典类型`)
  proTableRef.value?.getTableList()
}

// 批量删除信息
const batchDelete = async (ids: string[]) => {
  await useHandleData(deleteDictType, { ids }, '删除所选字典类型信息')
  proTableRef.value?.clearSelection()
  proTableRef.value?.getTableList()
}

const dictDataRef = ref<InstanceType<typeof DictData> | null>()
const openDictDta = (row: IDict.DictType) => {
  dictDataRef.value?.show(row)
}
</script>
