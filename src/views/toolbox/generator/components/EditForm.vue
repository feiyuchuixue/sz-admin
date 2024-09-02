<template>
  <el-dialog
    v-model="visible"
    :title="`${paramsProps.title}`"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    width="95vw"
    top="5vh"
    append-to-body
  >
    <el-steps :active="active" align-center finish-status="success">
      <el-step title="基本信息" @click="active = 0" />
      <el-step title="字段信息" @click="active = 1" />
      <el-step title="生成信息" @click="active = 2" />
    </el-steps>
    <div class="mt20">
      <div v-show="active === 0">
        <el-form
          ref="baseFormRef"
          label-width="120px"
          label-suffix=" :"
          :rules="baseRules"
          :model="baseInfo"
          @submit.enter.prevent="handleSubmit"
        >
          <el-row>
            <el-col :span="12">
              <el-form-item label="表名称" prop="tableName">
                <el-input v-model="baseInfo.tableName" clearable disabled></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="表描述" prop="tableComment">
                <template #label>
                  <el-space :size="4">
                    <span>表描述</span>
                    <el-tooltip effect="dark" content="表名，注释信息" placement="top">
                      <i :class="'iconfont icon-yiwen'"></i>
                    </el-tooltip>
                  </el-space>
                  <span>&nbsp;:</span>
                </template>
                <el-input
                  v-model="baseInfo.tableComment"
                  placeholder="请填写表描述"
                  clearable
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="实体类名称" prop="className">
                <template #label>
                  <el-space :size="4">
                    <span>实体类名称</span>
                    <el-tooltip effect="dark" content="java PO层" placement="top">
                      <i :class="'iconfont icon-yiwen'"></i>
                    </el-tooltip>
                  </el-space>
                  <span>&nbsp;:</span>
                </template>
                <el-input
                  v-model="baseInfo.className"
                  placeholder="请填写实体类名称"
                  clearable
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="作者" prop="functionAuthor">
                <el-input
                  v-model="baseInfo.functionAuthor"
                  placeholder="请填写作者"
                  clearable
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="备注" prop="remark">
                <el-input
                  v-model="baseInfo.remark"
                  placeholder="请填写备注"
                  :rows="2"
                  type="textarea"
                  clearable
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <div v-show="active === 1" style="margin: 0 20px">
        <h4 class="form-header h4">选择模版</h4>
        <div class="form-type">
          <el-radio-group v-model="generatorInfo.generateType" size="large" @change="changeRadio">
            <el-radio-button label="全量" value="all" />
            <el-radio-button label="后端" value="server" />
            <el-radio-button label="接口" value="service" />
            <el-radio-button label="数据库" value="db" />
          </el-radio-group>
          <div class="tip custom-block">
            <p style="color: var(--el-color-info)">
              Tip： {{ typeContent[generatorInfo.generateType].tooltip }}
            </p>
            <p>{{ typeContent[generatorInfo.generateType].text }}</p>
          </div>
          <el-row>
            <el-col
              :span="3"
              v-if="generatorInfo.generateType === 'all' || generatorInfo.generateType === 'server'"
            >
              <el-form-item prop="type">
                <template #label>
                  <el-space :size="4">
                    <span>Excel支持</span>
                    <el-tooltip effect="dark" content="是否支持列表的导入导出" placement="top">
                      <i :class="'iconfont icon-yiwen'"></i>
                    </el-tooltip>
                  </el-space>
                  <span>&nbsp;:</span>
                </template>
                <el-checkbox
                  label="导入"
                  name="type"
                  v-model="generatorInfo.hasImport"
                  true-value="1"
                  false-value="0"
                />
                <el-checkbox
                  label="导出"
                  name="type"
                  v-model="generatorInfo.hasExport"
                  true-value="1"
                  false-value="0"
                />
              </el-form-item>
            </el-col>
            <el-col :span="3">
              <el-form-item prop="type">
                <template #label>
                  <el-space :size="4">
                    <span>自动填充</span>
                    <el-tooltip
                      effect="dark"
                      content="对create、update操作进行自动填充。需遵循约定。"
                      placement="top"
                    >
                      <i :class="'iconfont icon-yiwen'"></i>
                    </el-tooltip>
                  </el-space>
                  <span>&nbsp;:</span>
                </template>
                <el-checkbox
                  name="type"
                  v-model="generatorInfo.isAutofill"
                  true-value="1"
                  false-value="0"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <h4 class="form-header h4">配置字段</h4>
        <div style="padding: 0 18px 0 10px">
          <ProTable
            ref="editProTableRef"
            title="代码生成"
            :indent="20"
            :columns="columns"
            :data="columnsInfos"
            row-key="columnId"
            :pagination="false"
            :tool-button="false"
          >
            <template #isUniqueValidHeader="scope">
              {{ scope?.column.label }}
              <el-space :size="2" class="column-table-header-yiwen">
                <el-tooltip
                  effect="dark"
                  content="添加和修改时根据此属性进行唯一性校验."
                  placement="top"
                >
                  <i :class="'iconfont icon-yiwen'"></i>
                </el-tooltip>
              </el-space>
            </template>

            <template #isLogicDelHeader="scope">
              {{ scope?.column.label }}
              <el-space :size="2" class="column-table-header-yiwen">
                <el-tooltip
                  effect="dark"
                  content="逻辑删除标识，需配合mf配置 deleted-value-of-logic-delete 、normal-value-of-logic-delete 使用。sz-admin中默认设置其属性为T、F"
                  placement="top"
                >
                  <i :class="'iconfont icon-yiwen'"></i>
                </el-tooltip>
              </el-space>
            </template>

            <template #isInsertHeader="scope">
              {{ scope?.column.label }}
              <el-space :size="2" class="column-table-header-yiwen">
                <el-tooltip
                  effect="dark"
                  content="xxCreateDTO.java元素"
                  placement="top"
                  style="line-height: 1"
                >
                  <i :class="'iconfont icon-yiwen'"></i>
                </el-tooltip>
              </el-space>
            </template>
            <template #isEditHeader="scope">
              {{ scope?.column.label }}
              <el-space :size="2" class="column-table-header-yiwen">
                <el-tooltip effect="dark" content="xxUpdateDTO.java元素" placement="top">
                  <i :class="'iconfont icon-yiwen'"></i>
                </el-tooltip>
              </el-space>
            </template>
            <template #isListHeader="scope">
              {{ scope?.column.label }}
              <el-space :size="2" class="column-table-header-yiwen">
                <el-tooltip effect="dark" content="xxVO.java元素" placement="top">
                  <i :class="'iconfont icon-yiwen'"></i>
                </el-tooltip>
              </el-space>
            </template>
            <template #isQueryHeader="scope">
              {{ scope?.column.label }}
              <el-space :size="2" class="column-table-header-yiwen">
                <el-tooltip effect="dark" content="xxListDTO.java元素" placement="top">
                  <i :class="'iconfont icon-yiwen'"></i>
                </el-tooltip>
              </el-space>
            </template>
            <template #isImportHeader="scope">
              {{ scope?.column.label }}
              <el-space :size="2" class="column-table-header-yiwen">
                <el-tooltip effect="dark" content="xxImportDTO.java元素" placement="top">
                  <i :class="'iconfont icon-yiwen'"></i>
                </el-tooltip>
              </el-space>
            </template>
            <template #isExportHeader="scope">
              {{ scope?.column.label }}
              <el-space :size="2" class="column-table-header-yiwen">
                <el-tooltip effect="dark" content="excel表格导出元素" placement="top">
                  <i :class="'iconfont icon-yiwen'"></i>
                </el-tooltip>
              </el-space>
            </template>
            <template #queryTypeHeader="scope">
              {{ scope?.column.label }}
              <el-space :size="2" class="column-table-header-yiwen">
                <el-tooltip effect="dark" content="sql条件查询关键字" placement="top">
                  <i :class="'iconfont icon-yiwen'"></i>
                </el-tooltip>
              </el-space>
            </template>
            <template #htmlTypeHeader="scope">
              {{ scope?.column.label }}
              <el-space :size="2" class="column-table-header-yiwen">
                <el-tooltip effect="dark" content="vue 组件" placement="top">
                  <i :class="'iconfont icon-yiwen'"></i>
                </el-tooltip>
              </el-space>
            </template>
            <template #dictTypeHeader="scope">
              {{ scope?.column.label }}
              <el-space :size="2" class="column-table-header-yiwen">
                <el-tooltip effect="dark" content="对应字典表，字典管理。" placement="top">
                  <i :class="'iconfont icon-yiwen'"></i>
                </el-tooltip>
              </el-space>
            </template>

            <template #columnComment="{ row }">
              <el-input v-model="row.columnComment" />
            </template>

            <template #javaType="{ row }">
              <el-select v-model="row.javaType" filterable>
                <el-option
                  v-for="item in javaTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </template>

            <template #isPk="{ row }">
              <el-checkbox v-model="row.isPk" true-value="1" false-value="0" />
            </template>

            <template #isIncrement="{ row }">
              <el-checkbox v-model="row.isIncrement" true-value="1" false-value="0" />
            </template>

            <template #isUniqueValid="{ row }">
              <el-checkbox v-model="row.isUniqueValid" true-value="1" false-value="0" />
            </template>

            <template #isRequired="{ row }">
              <el-checkbox v-model="row.isRequired" true-value="1" false-value="0" />
            </template>

            <template #isLogicDel="{ row }">
              <el-checkbox v-model="row.isLogicDel" true-value="1" false-value="0" />
            </template>

            <template #isInsert="{ row }">
              <el-checkbox v-model="row.isInsert" true-value="1" false-value="0" />
            </template>

            <template #isEdit="{ row }">
              <el-checkbox v-model="row.isEdit" true-value="1" false-value="0" />
            </template>

            <template #isList="{ row }">
              <el-checkbox v-model="row.isList" true-value="1" false-value="0" />
            </template>

            <template #isQuery="{ row }">
              <el-checkbox v-model="row.isQuery" true-value="1" false-value="0" />
            </template>

            <template #isImport="{ row }">
              <el-checkbox v-model="row.isImport" true-value="1" false-value="0" />
            </template>

            <template #isExport="{ row }">
              <el-checkbox
                v-if="row.isList == '1'"
                v-model="row.isExport"
                true-value="1"
                false-value="0"
              />
            </template>

            <template #queryType="{ row }">
              <el-select
                v-if="row.isLogicDel == '0' && row.isQuery == '1'"
                v-model="row.queryType"
                filterable
              >
                <el-option
                  v-for="item in queryTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </template>

            <template #htmlType="{ row }">
              <el-select
                v-if="row.isLogicDel == '0' && row.isQuery == '1'"
                v-model="row.htmlType"
                filterable
              >
                <el-option
                  v-for="item in htmlTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </template>

            <template #dictType="{ row }">
              <el-select
                v-if="row.isLogicDel == '0' && row.isQuery == '1' && row.htmlType == 'select'"
                v-model="row.dictType"
                clearable
                filterable
              >
                <el-option-group
                  v-for="group in dictTypeOptions"
                  :key="group.label"
                  :label="group.label"
                >
                  <el-option
                    v-for="item in group.options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-option-group>
              </el-select>
            </template>
          </ProTable>
        </div>
      </div>
      <div v-show="active === 2">
        <el-form
          ref="generatorFormRef"
          label-width="140px"
          label-suffix=" :"
          :rules="generatorRules"
          :model="generatorInfo"
          @submit.enter.prevent="handleSubmit"
        >
          <el-row>
            <el-col :span="12">
              <el-form-item label="包路径" prop="packageName">
                <template #label>
                  <el-space :size="4">
                    <span>包名</span>
                    <el-tooltip effect="dark" content="java包名" placement="top">
                      <i :class="'iconfont icon-yiwen'"></i>
                    </el-tooltip>
                  </el-space>
                  <span>&nbsp;:</span>
                </template>
                <el-input
                  v-model="generatorInfo.packageName"
                  placeholder="请填写包路径"
                  clearable
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="模块名" prop="moduleName">
                <template #label>
                  <el-space :size="4">
                    <span>模块名</span>
                    <el-tooltip effect="dark" content="java包名下的一级目录名" placement="top">
                      <i :class="'iconfont icon-yiwen'"></i>
                    </el-tooltip>
                  </el-space>
                  <span>&nbsp;:</span>
                </template>
                <el-input
                  v-model="generatorInfo.moduleName"
                  placeholder="请填写模块名"
                  clearable
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="业务名" prop="businessName">
                <template #label>
                  <el-space :size="4">
                    <span>业务名</span>
                    <el-tooltip
                      effect="dark"
                      content="实际业务文件名。如java service：GoodService、vue Form表单Ref：goodRef "
                      placement="top"
                    >
                      <i :class="'iconfont icon-yiwen'"></i>
                    </el-tooltip>
                  </el-space>
                  <span>&nbsp;:</span>
                </template>
                <el-input
                  v-model="generatorInfo.businessName"
                  placeholder="请填写业务名"
                  clearable
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="功能名" prop="functionName">
                <template #label>
                  <el-space :size="4">
                    <span>功能名</span>
                    <el-tooltip
                      effect="dark"
                      content="展示名。如vue index页面title：编辑'商品信息' "
                      placement="top"
                    >
                      <i :class="'iconfont icon-yiwen'"></i>
                    </el-tooltip>
                  </el-space>
                  <span>&nbsp;:</span>
                </template>
                <el-input
                  v-model="generatorInfo.functionName"
                  placeholder="请填写功能名"
                  clearable
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" v-if="generatorInfo.generateType == 'all'">
              <el-form-item label="是否生成菜单" prop="menuInitType">
                <template #label>
                  <el-space :size="4">
                    <span>生成菜单</span>
                    <el-tooltip
                      effect="dark"
                      content="代码生成时是否直接生成菜单路由（自动添加到菜单管理列表）"
                      placement="top"
                    >
                      <i :class="'iconfont icon-yiwen'"></i>
                    </el-tooltip>
                  </el-space>
                  <span>&nbsp;:</span>
                </template>
                <el-radio-group v-model="generatorInfo.menuInitType">
                  <el-radio value="1">是</el-radio>
                  <el-radio value="0">否</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="generatorInfo.generateType == 'all'">
              <el-form-item
                label="上级菜单"
                prop="parentMenuId"
                v-show="generatorInfo.menuInitType === '1'"
              >
                <template #label>
                  <el-space :size="4">
                    <span>上级菜单</span>
                    <el-tooltip
                      effect="dark"
                      content="设置当前菜单的上级目录(非按钮类型)"
                      placement="top"
                    >
                      <i :class="'iconfont icon-yiwen'"></i>
                    </el-tooltip>
                  </el-space>
                  <span>&nbsp;:</span>
                </template>
                <el-tree-select
                  v-model="generatorInfo.parentMenuId"
                  :data="parentMenus"
                  check-strictly
                  placeholder="请选择上级"
                  :render-after-expand="false"
                  clearable
                  :default-expand-all="true"
                  :props="treeProps"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24" v-if="generatorInfo.generateType == 'all'">
              <el-form-item
                label="生成按钮权限"
                prop="btnPermissionType"
                v-show="generatorInfo.menuInitType === '1'"
              >
                <template #label>
                  <el-space :size="4">
                    <span>生成按钮权限</span>
                    <el-tooltip
                      effect="dark"
                      content="代码生成时是否直接生成按钮权限，如：sys.user.query_table。取消生成则不会对按钮进行权限控制。推荐开启。"
                      placement="top"
                    >
                      <i :class="'iconfont icon-yiwen'"></i>
                    </el-tooltip>
                  </el-space>
                  <span>&nbsp;:</span>
                </template>
                <el-radio-group v-model="generatorInfo.btnPermissionType">
                  <el-radio value="1">是</el-radio>
                  <el-radio value="0">否</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="api项目路径" prop="pathApi">
                <template #label>
                  <el-space :size="4">
                    <span>api项目路径</span>
                    <el-tooltip
                      effect="dark"
                      content="java项目所在磁盘路径，直接生成代码到项目结构下"
                      placement="top"
                    >
                      <i :class="'iconfont icon-yiwen'"></i>
                    </el-tooltip>
                  </el-space>
                  <span>&nbsp;:</span>
                </template>
                <el-input
                  v-model="generatorInfo.pathApi"
                  placeholder="请填写路径"
                  clearable
                ></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="12" v-if="generatorInfo.generateType == 'all'">
              <el-form-item label="web项目路径" prop="pathWeb">
                <template #label>
                  <el-space :size="4">
                    <span>web项目路径</span>
                    <el-tooltip
                      effect="dark"
                      content="web项目所在磁盘路径，直接生成代码到项目结构下"
                      placement="top"
                    >
                      <i :class="'iconfont icon-yiwen'"></i>
                    </el-tooltip>
                  </el-space>
                  <span>&nbsp;:</span>
                </template>
                <el-input
                  v-model="generatorInfo.pathWeb"
                  placeholder="请填写路径"
                  clearable
                ></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>

    <template #footer>
      <el-button type="primary" @click="handleSubmit"> 保存</el-button>
      <el-button @click="visible = false"> 取消</el-button>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import ProTable from '@/components/ProTable/index.vue'
import type { ColumnProps, ProTableInstance } from '@/components/ProTable/interface'
import type { IGenerator } from '@/api/interface/toolbox/generator'
import { getGeneratorInfo } from '@/api/modules/toolbox/generator'
import {
  htmlTypeOptions,
  javaTypeOptions,
  queryTypeOptions
} from '@/views/toolbox/generator/common/Options'
import { getDictTypeOptions } from '@/api/modules/system/dict'
import type { IDict } from '@/api/interface/system/dict'
import type { IMenu } from '@/api/interface/system/menu'
import { getMenuTree } from '@/api/modules/system/menu'
import { ref, watchEffect } from 'vue'
import { ElMessage } from 'element-plus'

defineOptions({
  name: 'EditForm'
})
const columnsInfos = ref<IGenerator.ColumnInfo[]>([])
const generatorInfo = ref<IGenerator.GeneratorInfo>({
  businessName: '',
  functionName: '',
  moduleName: '',
  options: '',
  packageName: '',
  parentMenuId: '',
  type: '',
  hasImport: '',
  hasExport: '',
  pathApi: '',
  pathWeb: '',
  generateType: 'all',
  menuInitType: '1',
  btnPermissionType: '1',
  isAutofill: '1'
})
const isShowExcel = ref<boolean>(true)

// 表格配置项
// const columns: ColumnProps<IGenerator.ColumnInfo>[] = [
//   { type: 'sort', width: 100, label: '拖拽排序' },
//   { prop: 'columnName', label: '字段列名' },
//   { prop: 'columnComment', label: '字段描述' },
//   { prop: 'columnType', label: '物理类型' },
//   { prop: 'javaType', label: 'Java类型' },
//   { prop: 'isPk', label: '主键', width: 60 },
//   { prop: 'isIncrement', label: '自增', width: 60 },
//   { prop: 'isUniqueValid', label: '唯一', width: 80 },
//   { prop: 'isRequired', label: '必填', width: 60 },
//   { prop: 'isLogicDel', label: '逻辑删除', width: 120 },
//   { prop: 'isInsert', label: '插入', width: 80 },
//   { prop: 'isEdit', label: '编辑', width: 80 },
//   { prop: 'isList', label: '列表', width: 80 },
//   { prop: 'isQuery', label: '查询', width: 80 },
//   { prop: 'isImport', label: '导入', width: 80 },
//   { prop: 'isExport', label: '导出', width: 80 },
//   { prop: 'queryType', label: '查询方式' },
//   { prop: 'htmlType', label: '显示类型' },
//   { prop: 'dictType', label: '字典类型' }
// ]
const columns = ref<ColumnProps<IGenerator.ColumnInfo>[]>([
  { type: 'sort', width: 100, label: '拖拽排序' },
  { prop: 'columnName', label: '字段列名' },
  { prop: 'columnComment', label: '字段描述' },
  { prop: 'columnType', label: '物理类型' },
  { prop: 'javaType', label: 'Java类型' },
  { prop: 'isPk', label: '主键', width: 60 },
  { prop: 'isIncrement', label: '自增', width: 60 },
  { prop: 'isUniqueValid', label: '唯一', width: 80 },
  { prop: 'isRequired', label: '必填', width: 60 },
  { prop: 'isLogicDel', label: '逻辑删除', width: 120 },
  { prop: 'isInsert', label: '插入', width: 80 },
  { prop: 'isEdit', label: '编辑', width: 80 },
  { prop: 'isList', label: '列表', width: 80 },
  { prop: 'isQuery', label: '查询', width: 80 },
  { prop: 'isImport', label: '导入', width: 80 },
  { prop: 'isExport', label: '导出', width: 80 },
  { prop: 'queryType', label: '查询方式' },
  { prop: 'htmlType', label: '显示类型' },
  { prop: 'dictType', label: '字典类型' }
])

const active = ref(1)
const visible = ref(false)
const paramsProps = ref<View.DefaultParams>({
  title: '',
  row: {},
  api: undefined,
  getTableList: undefined
})

const dictTypeOptions = ref<IDict.DictCategory[]>([])
const getDictTypes = () => {
  getDictTypeOptions().then((res) => {
    dictTypeOptions.value = processDictionary(res.data)
  })
}

// 字典分组处理逻辑
const processDictionary = (data: IDict.DictType[]): IDict.DictCategory[] => {
  const categorizedDict = data.reduce<{
    [key: string]: IDict.DictCategory
  }>((acc, item) => {
    const option: IDict.DictOption = { value: item.typeCode, label: item.typeName };
    const category = item.isDynamic ? '动态字典' : '静态字典';

    if (!acc[category]) {
      acc[category] = { label: category, options: [] };
    }
    acc[category].options.push(option);

    return acc;
  }, {});

  return Object.values(categorizedDict);
}

getDictTypes()

const treeProps = {
  label: 'title',
  value: 'id'
}
const parentMenus = ref<IMenu.Tree[]>([])

const loadParentMenus = () => {
  getMenuTree({}).then((res) => {
    parentMenus.value = res.data
  })
}

loadParentMenus()

const editProTableRef = ref<ProTableInstance>()

const baseInfo = ref<IGenerator.BaseInfo>({
  tableId: 0,
  tableName: '',
  tableComment: '',
  className: '',
  functionAuthor: '',
  remark: ''
})

const baseRules = ref({
  tableComment: [{ required: true, message: '请填写表描述' }],
  className: [{ required: true, message: '请填写实体类名称' }],
  functionAuthor: [{ required: true, message: '请填写作者' }]
})

const generatorRules = ref({
  packageName: [{ required: true, message: '请填写包路径' }],
  moduleName: [{ required: true, message: '请填写模块名' }],
  businessName: [{ required: true, message: '请填写业务名' }],
  functionName: [{ required: true, message: '请填写功能名' }]
})

const getInfo = () => {
  const tableName = paramsProps.value.row.tableName
  getGeneratorInfo(tableName).then((res) => {
    baseInfo.value = res.data.baseInfo
    columnsInfos.value = res.data.columns
    generatorInfo.value = res.data.generatorInfo
  })
}

// 更新列属性的通用函数
const updateColumns = (newValue: string, propToUpdate: string) => {
  const existingColumn = columns.value.find((col) => col.prop === propToUpdate)

  if (existingColumn) {
    existingColumn.isShow = newValue === '1'
  }
}

// 监听多个属性的变化，并执行相同的更新逻辑
watchEffect(() => {
  try {
    updateColumns(generatorInfo.value.hasImport, 'isImport')
    updateColumns(generatorInfo.value.hasExport, 'isExport')
    // 如果有其他类似的属性，也可以在这里进行处理
  } catch (error) {
    console.error('Error in watchEffect:', error)
    // 根据实际情况进行错误处理，如显示错误提示、回滚变更等
  }
})

const baseFormRef = ref()
const generatorFormRef = ref()

const handleSubmit = () => {
  const baseValidate = new Promise((resolve, reject) => {
    baseFormRef.value
      ?.validate((valid: boolean) => {
        resolve(valid)
      })
      .catch((err: any) => {
        reject(err)
      })
  })
  const geneValidate = new Promise((resolve, reject) => {
    generatorFormRef.value
      ?.validate((valid: boolean) => {
        resolve(valid)
      })
      .catch((err: any) => {
        reject(err)
      })
  })
  Promise.all([baseValidate, geneValidate]).then((res) => {
    if (res[0] === false) {
      active.value = 0
      return
    }
    if (res[1] === false) {
      active.value = 2
      return
    }

    paramsProps.value.api!({
      baseInfo: baseInfo.value,
      columns: columnsInfos.value,
      generatorInfo: generatorInfo.value
    }).then(() => {
      ElMessage.success({ message: '保存成功！' })
      visible.value = false
    })
  })
}

// 接收父组件传过来的参数
const acceptParams = (params: View.DefaultParams) => {
  paramsProps.value = params
  getInfo()
  visible.value = true
}

const typeContent = ref<{
  [key: string]: {
    tooltip: string
    text: string
  }
}>({
  all: {
    tooltip: '【增删改查】 所有组件，包括后端服务和前端视图',
    text: 'Controller、Service、Mapper、DTO、PO、VO、 | views (vue)、interface (vue)、module (vue)'
  },
  server: {
    tooltip: '【增删改查】 后端服务组件，不包括前端视图',
    text: 'Controller、Service、Mapper、DTO、PO、VO'
  },
  service: {
    tooltip: '服务层组件',
    text: 'Service、Mapper、PO'
  },
  db: {
    tooltip: '数据库交互组件，包括数据模型和映射配置',
    text: 'PO、Mapper'
  }
})

const changeRadio = (val: string) => {
  isShowExcel.value = val === 'all' || val === 'server'
}

defineExpose({
  acceptParams
})
</script>

<style scoped lang="scss">
.form-type {
  margin: 0 0 30px 10px;
}

.form-header {
  font-size: 15px;
  color: #6379bb;
  border-bottom: 1px solid #ddd;
  margin: 8px 20px 25px 10px;
  padding-bottom: 5px;
}

.custom-block.tip {
  padding: 8px 16px;
  background-color: var(--div-bg-box);
  border-radius: 4px;
  border-left: 5px solid var(--el-color-primary);
  margin: 20px 20px 20px 0;
}

.column-table-header-yiwen {
  line-height: 1;
  font-weight: normal;
}

:deep(.el-select-group .el-select-dropdown__item) {
  padding-left: 32px;
}
</style>
