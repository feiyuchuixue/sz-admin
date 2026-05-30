<template>
  <el-dialog
    v-model="visible"
    :title="`${paramsProps.title}：${paramsProps.row?.tableName}`"
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
                <el-input v-model="baseInfo.tableName" clearable disabled />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="表描述" prop="tableComment">
                <template #label>
                  <el-space :size="4">
                    <span>表描述</span>
                    <el-tooltip effect="dark" content="表名，注释信息" placement="top">
                      <i :class="'iconfont icon-yiwen'" />
                    </el-tooltip>
                  </el-space>
                  <span>&nbsp;:</span>
                </template>
                <el-input v-model="baseInfo.tableComment" placeholder="请填写表描述" clearable />
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
                      <i :class="'iconfont icon-yiwen'" />
                    </el-tooltip>
                  </el-space>
                  <span>&nbsp;:</span>
                </template>
                <el-input v-model="baseInfo.className" placeholder="请填写实体类名称" clearable />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="作者" prop="functionAuthor">
                <el-input v-model="baseInfo.functionAuthor" placeholder="请填写作者" clearable />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="备注" prop="remark">
                <el-input v-model="baseInfo.remark" placeholder="请填写备注" :rows="2" type="textarea" clearable />
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
            <p style="color: var(--el-color-info)">Tip： {{ typeContent[generatorInfo.generateType].tooltip }}</p>
            <p>{{ typeContent[generatorInfo.generateType].text }}</p>
          </div>
          <el-row>
            <el-col :span="6" v-if="generatorInfo.generateType === 'all' || generatorInfo.generateType === 'server'">
              <el-form-item prop="type">
                <template #label>
                  <el-space :size="4">
                    <span>Excel支持</span>
                    <el-tooltip effect="dark" content="是否支持列表的导入导出" placement="top">
                      <i :class="'iconfont icon-yiwen'" />
                    </el-tooltip>
                  </el-space>
                  <span>&nbsp;:</span>
                </template>
                <el-checkbox label="导入" name="type" v-model="generatorInfo.hasImport" true-value="1" false-value="0" />
                <el-checkbox label="导出" name="type" v-model="generatorInfo.hasExport" true-value="1" false-value="0" />
              </el-form-item>
            </el-col>
            <el-col :span="3">
              <el-form-item prop="type">
                <template #label>
                  <el-space :size="4">
                    <span>自动填充</span>
                    <el-tooltip effect="dark" content="对create、update操作进行自动填充。需遵循约定。" placement="top">
                      <i :class="'iconfont icon-yiwen'" />
                    </el-tooltip>
                  </el-space>
                  <span>&nbsp;:</span>
                </template>
                <el-checkbox name="type" v-model="generatorInfo.isAutofill" true-value="1" false-value="0" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item prop="type">
                <template #label>
                  <el-space :size="4">
                    <span>窗口展示方式</span>
                    <el-tooltip effect="dark" content="控制详情页组件的窗口展示方式：弹窗、抽屉。" placement="top">
                      <i :class="'iconfont icon-yiwen'" />
                    </el-tooltip>
                  </el-space>
                  <span>&nbsp;:</span>
                </template>
                <el-radio-group v-model="generatorInfo.windowShowType">
                  <el-radio value="0"> 弹窗Dialog </el-radio>
                  <el-radio value="1"> 抽屉Drawer </el-radio>
                </el-radio-group>
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
                <el-tooltip effect="dark" content="添加和修改时根据此属性进行唯一性校验." placement="top">
                  <i :class="'iconfont icon-yiwen'" />
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
                  <i :class="'iconfont icon-yiwen'" />
                </el-tooltip>
              </el-space>
            </template>

            <template #isInsertHeader="scope">
              {{ scope?.column.label }}
              <el-space :size="2" class="column-table-header-yiwen">
                <el-tooltip effect="dark" content="xxCreateDTO.java元素" placement="top" style="line-height: 1">
                  <i :class="'iconfont icon-yiwen'" />
                </el-tooltip>
              </el-space>
            </template>
            <template #isEditHeader="scope">
              {{ scope?.column.label }}
              <el-space :size="2" class="column-table-header-yiwen">
                <el-tooltip effect="dark" content="xxUpdateDTO.java元素" placement="top">
                  <i :class="'iconfont icon-yiwen'" />
                </el-tooltip>
              </el-space>
            </template>
            <template #isListHeader="scope">
              {{ scope?.column.label }}
              <el-space :size="2" class="column-table-header-yiwen">
                <el-tooltip effect="dark" content="xxVO.java元素" placement="top">
                  <i :class="'iconfont icon-yiwen'" />
                </el-tooltip>
              </el-space>
            </template>
            <template #isQueryHeader="scope">
              {{ scope?.column.label }}
              <el-space :size="2" class="column-table-header-yiwen">
                <el-tooltip effect="dark" content="xxListDTO.java元素" placement="top">
                  <i :class="'iconfont icon-yiwen'" />
                </el-tooltip>
              </el-space>
            </template>
            <template #isImportHeader="scope">
              {{ scope?.column.label }}
              <el-space :size="2" class="column-table-header-yiwen">
                <el-tooltip effect="dark" content="xxImportDTO.java元素" placement="top">
                  <i :class="'iconfont icon-yiwen'" />
                </el-tooltip>
              </el-space>
            </template>
            <template #isExportHeader="scope">
              {{ scope?.column.label }}
              <el-space :size="2" class="column-table-header-yiwen">
                <el-tooltip effect="dark" content="excel表格导出元素" placement="top">
                  <i :class="'iconfont icon-yiwen'" />
                </el-tooltip>
              </el-space>
            </template>
            <template #queryTypeHeader="scope">
              {{ scope?.column.label }}
              <el-space :size="2" class="column-table-header-yiwen">
                <el-tooltip effect="dark" content="sql条件查询关键字" placement="top">
                  <i :class="'iconfont icon-yiwen'" />
                </el-tooltip>
              </el-space>
            </template>
            <template #htmlTypeHeader="scope">
              {{ scope?.column.label }}
              <el-space :size="2" class="column-table-header-yiwen">
                <el-tooltip effect="dark" content="vue 组件" placement="top">
                  <i :class="'iconfont icon-yiwen'" />
                </el-tooltip>
              </el-space>
            </template>
            <template #dictTypeHeader="scope">
              {{ scope?.column.label }}
              <el-space :size="2" class="column-table-header-yiwen">
                <el-tooltip effect="dark" content="对应字典表，字典管理。" placement="top">
                  <i :class="'iconfont icon-yiwen'" />
                </el-tooltip>
              </el-space>
            </template>
            <template #dictShowWayHeader="scope">
              {{ scope?.column.label }}
              <el-space :size="2" class="column-table-header-yiwen">
                <el-tooltip effect="dark" content="字典展示类型：0 唯一标识；1 别名。" placement="top">
                  <i :class="'iconfont icon-yiwen'" />
                </el-tooltip>
              </el-space>
            </template>

            <template #columnComment="{ row }">
              <el-input v-model="row.columnComment" />
            </template>

            <template #javaType="{ row }">
              <el-select v-model="row.javaType" filterable>
                <el-option v-for="item in javaTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
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
              <el-checkbox v-if="row.isList == '1'" v-model="row.isExport" true-value="1" false-value="0" />
            </template>

            <template #queryType="{ row }">
              <el-select v-if="row.isLogicDel == '0' && row.isQuery == '1'" v-model="row.queryType" filterable>
                <el-option v-for="item in queryTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </template>

            <template #htmlType="{ row }">
              <el-select
                v-if="row.isLogicDel == '0' && row.isPk == '0' && (row.isInsert == '1' || row.isEdit == '1')"
                v-model="row.htmlType"
                filterable
                @change="htmlTypeChange(row)"
              >
                <el-option v-for="item in htmlTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </template>

            <template #dictType="{ row }">
              <el-select
                v-if="row.isLogicDel == '0'"
                v-model="row.dictType"
                :clearable="!isDictionaryDisplayType(row.htmlType)"
                filterable
                :placeholder="isDictionaryDisplayType(row.htmlType) ? '必选字典类型' : '请选择字典类型'"
                @change="dictTypeChange(row)"
              >
                <el-option-group v-for="group in dictTypeOptions" :key="group.label" :label="group.label">
                  <el-option v-for="item in group.options" :key="item.value" :label="item.label" :value="item.value" />
                </el-option-group>
              </el-select>
              <el-text
                v-if="isDictionaryDisplayType(row.htmlType) && !row.dictType"
                class="dict-required-tip"
                type="danger"
                size="small"
              >
                必填
              </el-text>
            </template>

            <template #dictShowWay="{ row }">
              <el-select v-if="row.isLogicDel == '0' && row.dictType" v-model="row.dictShowWay" filterable>
                <el-option v-for="item in dictShowWayOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </template>
          </ProTable>
        </div>
      </div>
      <div v-show="active === 2">
        <el-form
          ref="generatorFormRef"
          class="generator-form"
          label-width="180px"
          label-suffix=" :"
          :rules="generatorRules"
          :model="generatorInfo"
          @submit.enter.prevent="handleSubmit"
        >
          <h4 class="form-header h4">生成目标</h4>
          <el-row>
            <el-col :span="12">
              <el-form-item label="后端目标" prop="backendTargetType">
                <el-radio-group v-model="generatorInfo.backendTargetType" @change="backendTargetChange">
                  <el-radio value="existing"> 现有模块 </el-radio>
                  <el-radio value="new"> 新建模块 </el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="generatorInfo.backendTargetType === 'existing'">
              <el-form-item label="后端模块" prop="backendModuleName">
                <el-select
                  v-model="generatorInfo.backendModuleName"
                  filterable
                  placeholder="请选择后端模块"
                  popper-class="generator-module-popper"
                  @change="backendModuleChange"
                >
                  <el-option
                    v-for="item in backendModuleOptions"
                    :key="item.moduleName"
                    :label="item.moduleName"
                    :value="item.moduleName"
                  >
                    <div class="module-option-row">
                      <span class="module-option-name">{{ item.moduleName }}</span>
                      <el-tag
                        class="module-option-status"
                        size="small"
                        :type="backendModuleStatusType(item.status)"
                        effect="plain"
                      >
                        {{ backendModuleStatusText(item.status) }}
                      </el-tag>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12" v-else>
              <el-form-item label="新模块名" prop="backendModuleName">
                <el-input
                  v-model="generatorInfo.backendModuleName"
                  placeholder="建议使用 sz-module-demo，非强制"
                  clearable
                  @input="newBackendModuleChange"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <div v-if="moduleTargetSummary" class="target-summary">
            <el-tag size="small" :type="moduleTargetTagType" effect="plain">{{ moduleTargetTagText }}</el-tag>
            <span>{{ moduleTargetSummary }}</span>
          </div>
          <el-row>
            <el-col :span="12">
              <el-form-item label="api项目路径" prop="pathApi">
                <template #label>
                  <el-space :size="4">
                    <span>api项目路径</span>
                    <el-tooltip effect="dark" content="后端代码生成到该模块的真实磁盘路径" placement="top">
                      <i :class="'iconfont icon-yiwen'" />
                    </el-tooltip>
                  </el-space>
                  <span>&nbsp;:</span>
                </template>
                <el-select
                  v-if="generatorInfo.backendTargetType === 'existing'"
                  v-model="generatorInfo.pathApi"
                  filterable
                  placeholder="请选择后端模块路径"
                  popper-class="generator-path-popper"
                  @change="apiPathChange"
                >
                  <el-option
                    v-for="item in existingApiPathOptions"
                    :key="item.path"
                    class="path-option"
                    :label="item.path"
                    :value="item.path"
                  >
                    <div class="path-option-title">
                      <span>{{ item.name }}</span>
                      <el-tag v-if="item.status" size="small" :type="backendModuleStatusType(item.status)" effect="plain">
                        {{ backendModuleStatusText(item.status) }}
                      </el-tag>
                    </div>
                    <div class="path-option-value">{{ item.path }}</div>
                  </el-option>
                </el-select>
                <el-input
                  v-else
                  v-model="generatorInfo.pathApi"
                  placeholder="请填写新模块完整路径"
                  clearable
                  @input="newApiPathInput"
                />
              </el-form-item>
            </el-col>

            <el-col :span="12" v-if="generatorInfo.generateType == 'all'">
              <el-form-item label="web项目路径" prop="pathWeb">
                <template #label>
                  <el-space :size="4">
                    <span>web项目路径</span>
                    <el-tooltip effect="dark" content="web项目所在磁盘路径，直接生成代码到项目结构下" placement="top">
                      <i :class="'iconfont icon-yiwen'" />
                    </el-tooltip>
                  </el-space>
                  <span>&nbsp;:</span>
                </template>
                <el-input v-model="generatorInfo.pathWeb" placeholder="请填写路径" clearable />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="API模块" prop="apiPrefixModule">
                <template #label>
                  <el-space :size="4">
                    <span>API模块</span>
                    <el-tooltip effect="dark" content="用于前端创建对应模块的请求客户端，默认随后端模块自动匹配" placement="top">
                      <i :class="'iconfont icon-yiwen'" />
                    </el-tooltip>
                  </el-space>
                  <span>&nbsp;:</span>
                </template>
                <el-input
                  v-model="generatorInfo.apiPrefixModule"
                  placeholder="如 admin、audit、order"
                  :disabled="generatorInfo.backendTargetType === 'existing'"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="API前缀" prop="apiPrefix">
                <template #label>
                  <el-space :size="4">
                    <span>API前缀</span>
                    <el-tooltip
                      effect="dark"
                      content="最终接口访问前缀，例如 /admin、/audit，可按实际网关或后端配置调整"
                      placement="top"
                    >
                      <i :class="'iconfont icon-yiwen'" />
                    </el-tooltip>
                  </el-space>
                  <span>&nbsp;:</span>
                </template>
                <el-input
                  v-model="generatorInfo.apiPrefix"
                  placeholder="如 /admin"
                  :disabled="generatorInfo.backendTargetType === 'existing'"
                  clearable
                  @blur="normalizeApiPrefixInput"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <h4 class="form-header h4">生成行为</h4>
          <el-row>
            <el-col :span="12">
              <el-form-item label="模块名" prop="moduleName">
                <template #label>
                  <el-space :size="4">
                    <span>模块名</span>
                    <el-tooltip effect="dark" content="后端 Java 包下的业务分组名，也会作为旧版前端目录的模块名" placement="top">
                      <i :class="'iconfont icon-yiwen'" />
                    </el-tooltip>
                  </el-space>
                  <span>&nbsp;:</span>
                </template>
                <el-input v-model="generatorInfo.moduleName" placeholder="如 order" clearable @change="moduleNameChange" />
              </el-form-item>
            </el-col>
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
                      <i :class="'iconfont icon-yiwen'" />
                    </el-tooltip>
                  </el-space>
                  <span>&nbsp;:</span>
                </template>
                <el-input v-model="generatorInfo.businessName" placeholder="请填写业务名" clearable />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="功能名" prop="functionName">
                <template #label>
                  <el-space :size="4">
                    <span>功能名</span>
                    <el-tooltip effect="dark" content="展示名。如vue index页面title：编辑'商品信息' " placement="top">
                      <i :class="'iconfont icon-yiwen'" />
                    </el-tooltip>
                  </el-space>
                  <span>&nbsp;:</span>
                </template>
                <el-input v-model="generatorInfo.functionName" placeholder="请填写功能名" clearable />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" v-if="generatorInfo.generateType == 'all'">
              <el-form-item label="是否生成菜单" prop="menuInitType">
                <template #label>
                  <el-space :size="4">
                    <span>生成菜单</span>
                    <el-tooltip effect="dark" content="代码生成时是否直接生成菜单路由（自动添加到菜单管理列表）" placement="top">
                      <i :class="'iconfont icon-yiwen'" />
                    </el-tooltip>
                  </el-space>
                  <span>&nbsp;:</span>
                </template>
                <el-radio-group v-model="generatorInfo.menuInitType">
                  <el-radio value="1"> 是 </el-radio>
                  <el-radio value="0"> 否 </el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="generatorInfo.generateType == 'all'">
              <el-form-item label="上级菜单" prop="parentMenuId" v-show="generatorInfo.menuInitType === '1'">
                <template #label>
                  <el-space :size="4">
                    <span>上级菜单</span>
                    <el-tooltip effect="dark" content="设置当前菜单的上级目录(非按钮类型)" placement="top">
                      <i :class="'iconfont icon-yiwen'" />
                    </el-tooltip>
                  </el-space>
                  <span>&nbsp;:</span>
                </template>
                <el-tree-select
                  v-model="generatorInfo.parentMenuId"
                  :data="parentMenus"
                  check-strictly
                  node-key="id"
                  placeholder="请选择上级"
                  :render-after-expand="false"
                  clearable
                  :default-expand-all="true"
                  :props="treeProps"
                  @change="treeSelectChange"
                  ref="parentTreeRef"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12" v-if="generatorInfo.generateType == 'all'">
              <el-form-item label="生成按钮权限" prop="btnPermissionType" v-show="generatorInfo.menuInitType === '1'">
                <template #label>
                  <el-space :size="4">
                    <span>生成按钮权限</span>
                    <el-tooltip
                      effect="dark"
                      content="代码生成时是否直接生成按钮权限，如：sys.user.query_table。取消生成则不会对按钮进行权限控制。推荐开启。"
                      placement="top"
                    >
                      <i :class="'iconfont icon-yiwen'" />
                    </el-tooltip>
                  </el-space>
                  <span>&nbsp;:</span>
                </template>
                <el-radio-group v-model="generatorInfo.btnPermissionType">
                  <el-radio value="1"> 是 </el-radio>
                  <el-radio value="0"> 否 </el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="generatorInfo.generateType === 'all' || generatorInfo.generateType === 'server'">
              <el-form-item label="自动创建数据权限" prop="btnDataScopeType" v-show="generatorInfo.menuInitType === '1'">
                <template #label>
                  <el-space :size="4">
                    <span>自动创建数据权限</span>
                    <el-tooltip
                      effect="dark"
                      content="启用后将自动为菜单生成并开启数据权限控制。大多数 SQL 查询会受该权限影响，但特殊或复杂 SQL 场景下可能导致查询失效，请谨慎使用。"
                      placement="top"
                    >
                      <i :class="'iconfont icon-yiwen'" />
                    </el-tooltip>
                  </el-space>
                  <span>&nbsp;:</span>
                </template>
                <el-radio-group v-model="generatorInfo.btnDataScopeType">
                  <el-radio value="1"> 开启 </el-radio>
                  <el-radio value="0"> 关闭 </el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>

    <template #footer>
      <el-button type="primary" @click="handleSubmit"> 保存 </el-button>
      <el-button @click="visible = false"> 取消 </el-button>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import ProTable from '@/components/ProTable/index.vue';
import type { ColumnProps, ProTableInstance } from '@/components/ProTable/interface';
import type {
  GeneratorBackendModuleOption,
  GeneratorBaseInfo,
  GeneratorColumnInfo,
  GeneratorGeneratorInfo
} from '@/modules/toolbox/types/generator';
import { getGeneratorInfo, getGeneratorPathOptions } from '@/modules/toolbox/api/generator';
import {
  dictShowWayOptions,
  htmlTypeOptions,
  javaTypeOptions,
  queryTypeOptions
} from '@/modules/toolbox/views/generator/common/Options';
import { getDictTypeOptions } from '@/api/modules/system/dict';
import type { DictCategory, DictType, DictOption } from '@/api/types/system/dict';
import type { MenuTree } from '@/api/types/system/menu';
import { getMenuTree } from '@/api/modules/system/menu';
import { computed, nextTick, ref, watchEffect } from 'vue';
import { ElMessage } from 'element-plus';

defineOptions({
  name: 'EditForm'
});
const columnsInfos = ref<GeneratorColumnInfo[]>([]);
const generatorInfo = ref<GeneratorGeneratorInfo>({
  businessName: '',
  functionName: '',
  moduleName: '',
  backendTargetType: 'existing',
  backendModuleName: '',
  apiPrefixModule: 'admin',
  apiPrefix: '/admin',
  frontendLayout: 'module',
  frontendModuleName: '',
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
  isAutofill: '1',
  btnDataScopeType: '1',
  windowShowType: '0'
});
const isShowExcel = ref<boolean>(true);
const backendModuleOptions = ref<GeneratorBackendModuleOption[]>([]);
const newApiPathManuallyEdited = ref(false);
const lastNewModuleCode = ref('');
const initialNewBackendModule = ref({
  moduleName: '',
  moduleCode: '',
  pathApi: ''
});

const selectedBackendModule = computed(() =>
  backendModuleOptions.value.find(item => item.moduleName === generatorInfo.value.backendModuleName)
);

const existingApiPathOptions = computed(() =>
  backendModuleOptions.value.map(item => ({
    name: item.moduleName,
    path: item.path,
    status: item.status
  }))
);

const moduleRootPath = computed(() => {
  const modulePath = backendModuleOptions.value[0]?.path;
  if (!modulePath) return '';
  return modulePath.replace(/[\\/][^\\/]+$/, '');
});

const moduleTargetTagType = computed(() => {
  if (generatorInfo.value.backendTargetType === 'new') return 'success';
  return backendModuleStatusType(selectedBackendModule.value?.status);
});

const moduleTargetTagText = computed(() => {
  if (generatorInfo.value.backendTargetType === 'new') return '新建模块';
  return backendModuleStatusText(selectedBackendModule.value?.status);
});

const moduleTargetSummary = computed(() => {
  if (generatorInfo.value.backendTargetType === 'new') {
    return '请填写新模块名，建议使用 sz-module-xxx；api 路径会随模块名生成，也可手动调整。生成时会创建模块并自动接入 POM、服务依赖、API 前缀、MapperScan 与 Liquibase。';
  }
  if (!selectedBackendModule.value) return '';
  if (selectedBackendModule.value.status === 'pending') {
    return `生成时会先补齐缺失接入项：${selectedBackendModule.value.missingItems.join('、')}。`;
  }
  return '该模块已完成接入，可直接作为后端代码生成目标。';
});

const columns = ref<ColumnProps<GeneratorColumnInfo>[]>([
  { type: 'sort', width: 75, label: '拖拽排序' },
  { prop: 'columnName', label: '字段列名' },
  { prop: 'columnComment', label: '字段描述' },
  { prop: 'columnType', label: '物理类型' },
  { prop: 'javaType', label: 'Java类型' },
  { prop: 'isPk', label: '主键', width: 45 },
  { prop: 'isIncrement', label: '自增', width: 50 },
  { prop: 'isUniqueValid', label: '唯一', width: 65 },
  { prop: 'isRequired', label: '必填', width: 45 },
  { prop: 'isLogicDel', label: '逻辑删除', width: 90 },
  { prop: 'isInsert', label: '插入', width: 65 },
  { prop: 'isEdit', label: '编辑', width: 65 },
  { prop: 'isList', label: '列表', width: 65 },
  { prop: 'htmlType', label: '显示类型' },
  { prop: 'isQuery', label: '查询', width: 65 },
  { prop: 'isImport', label: '导入', width: 65 },
  { prop: 'isExport', label: '导出', width: 65 },
  { prop: 'queryType', label: '查询方式', width: 105 },
  { prop: 'dictType', label: '字典类型' },
  { prop: 'dictShowWay', label: '字典显示方式' }
]);

const active = ref(1);
const visible = ref(false);
const paramsProps = ref<View.DefaultParams>({
  title: '',
  row: {},
  api: undefined,
  getTableList: undefined
});

const dictTypeOptions = ref<DictCategory[]>([]);
const getDictTypes = () => {
  getDictTypeOptions().then(res => {
    dictTypeOptions.value = processDictionary(res.data);
  });
};

// 字典分组处理逻辑
const processDictionary = (data: DictType[]): DictCategory[] => {
  const categorizedDict = data.reduce<{
    [key: string]: DictCategory;
  }>((acc, item) => {
    const option: DictOption = { value: item.typeCode, label: item.typeName };
    const category = item.isDynamic ? '动态字典' : '静态字典';

    if (!acc[category]) {
      acc[category] = { label: category, options: [] };
    }
    acc[category].options.push(option);

    return acc;
  }, {});

  return Object.values(categorizedDict);
};

getDictTypes();

const treeProps = {
  label: 'title',
  value: 'id'
};
const parentMenus = ref<MenuTree[]>([]);

const loadParentMenus = () => {
  getMenuTree({}).then(res => {
    parentMenus.value = res.data;
  });
};

loadParentMenus();

const editProTableRef = ref<ProTableInstance>();

const baseInfo = ref<GeneratorBaseInfo>({
  tableId: 0,
  tableName: '',
  tableComment: '',
  className: '',
  functionAuthor: '',
  remark: ''
});

const baseRules = ref({
  tableComment: [{ required: true, message: '请填写表描述' }],
  className: [{ required: true, message: '请填写实体类名称' }],
  functionAuthor: [{ required: true, message: '请填写作者' }]
});

const generatorRules = ref({
  backendTargetType: [{ required: true, message: '请选择后端目标' }],
  backendModuleName: [
    { required: true, message: '请选择或填写后端模块' },
    { validator: validateBackendModuleName, trigger: ['blur', 'change'] }
  ],
  pathApi: [
    { required: true, message: '请选择或填写 api 项目路径' },
    { validator: validateApiPath, trigger: ['blur', 'change'] }
  ],
  apiPrefixModule: [{ required: true, message: '请填写 API 模块' }],
  apiPrefix: [
    { required: true, message: '请填写 API 前缀' },
    { validator: validateApiPrefix, trigger: ['blur', 'change'] }
  ],
  moduleName: [{ required: true, message: '请填写模块名' }],
  businessName: [{ required: true, message: '请填写业务名' }],
  functionName: [{ required: true, message: '请填写功能名' }]
});

function validateBackendModuleName(_rule: unknown, value: string, callback: (error?: Error) => void) {
  if (generatorInfo.value.backendTargetType !== 'new' || !value) {
    callback();
    return;
  }
  const conflict = findExistingModuleConflict(value);
  if (conflict && !isInitialNewBackendModule(value, generatorInfo.value.pathApi)) {
    callback(new Error(`该模块已存在：${conflict.moduleName}，请切换为现有模块或更换新模块名`));
    return;
  }
  callback();
}

function validateApiPath(_rule: unknown, value: string, callback: (error?: Error) => void) {
  if (generatorInfo.value.backendTargetType !== 'new' || !value) {
    callback();
    return;
  }
  const normalizedPath = normalizePath(value);
  const conflict = backendModuleOptions.value.find(item => normalizePath(item.path) === normalizedPath);
  if (conflict && !isInitialNewBackendModule(generatorInfo.value.backendModuleName, value)) {
    callback(new Error(`该路径已属于现有模块：${conflict.moduleName}，请切换为现有模块或更换路径`));
    return;
  }
  callback();
}

function validateApiPrefix(_rule: unknown, value: string, callback: (error?: Error) => void) {
  if (!value || value.startsWith('/')) {
    callback();
    return;
  }
  callback(new Error('API 前缀需要以 / 开头'));
}

const getInfo = () => {
  const tableName = paramsProps.value.row.tableName;
  Promise.all([getGeneratorInfo(tableName), getGeneratorPathOptions()]).then(([res, pathRes]) => {
    baseInfo.value = res.data.baseInfo;
    columnsInfos.value = res.data.columns;
    const info = res.data.generatorInfo;
    generatorInfo.value = {
      ...info,
      backendTargetType: info.backendTargetType || 'existing',
      backendModuleName: info.backendModuleName || '',
      apiPrefixModule: info.apiPrefixModule || 'admin',
      apiPrefix: info.apiPrefix || '/admin',
      frontendLayout: info.frontendLayout || 'module',
      frontendModuleName: info.frontendModuleName || ''
    };
    initialNewBackendModule.value =
      generatorInfo.value.backendTargetType === 'new'
        ? {
            moduleName: normalizeModuleName(generatorInfo.value.backendModuleName),
            moduleCode: normalizeModuleCode(generatorInfo.value.backendModuleName),
            pathApi: normalizePath(generatorInfo.value.pathApi)
          }
        : {
            moduleName: '',
            moduleCode: '',
            pathApi: ''
          };
    backendModuleOptions.value = pathRes.data.backendModuleOptions || [];
    applyGeneratorDefaults(pathRes.data.defaultApiPath, pathRes.data.defaultWebPath);
  });
};

const applyGeneratorDefaults = (defaultApiPath: string, defaultWebPath: string) => {
  newApiPathManuallyEdited.value = generatorInfo.value.backendTargetType === 'new' && Boolean(generatorInfo.value.pathApi);
  if (generatorInfo.value.backendTargetType !== 'new' && !generatorInfo.value.pathApi) {
    generatorInfo.value.pathApi = defaultApiPath;
  }
  if (!generatorInfo.value.pathWeb) {
    generatorInfo.value.pathWeb = defaultWebPath;
  }
  if (!generatorInfo.value.frontendLayout) {
    generatorInfo.value.frontendLayout = 'module';
  }
  if (!generatorInfo.value.backendTargetType) {
    generatorInfo.value.backendTargetType = 'existing';
  }
  if (generatorInfo.value.backendTargetType !== 'new' && generatorInfo.value.backendModuleName) {
    const selected = backendModuleOptions.value.find(item => item.moduleName === generatorInfo.value.backendModuleName);
    if (selected) {
      applyBackendModule(selected);
    }
  }
  if (generatorInfo.value.backendTargetType !== 'new' && !generatorInfo.value.backendModuleName) {
    const recommended =
      backendModuleOptions.value.find(item => item.recommended) ||
      backendModuleOptions.value.find(item => item.status === 'ready');
    if (recommended) {
      applyBackendModule(recommended);
    }
  }
  if (generatorInfo.value.backendTargetType === 'new' && generatorInfo.value.backendModuleName && !generatorInfo.value.pathApi) {
    generatorInfo.value.pathApi = buildNewModulePath(generatorInfo.value.backendModuleName);
  }
  if (generatorInfo.value.backendTargetType === 'new' && !generatorInfo.value.frontendModuleName) {
    generatorInfo.value.frontendModuleName = generatorInfo.value.moduleName;
  }
};

const backendModuleStatusText = (status?: GeneratorBackendModuleOption['status']) => {
  const statusMap = {
    ready: '已接入',
    pending: '将自动补齐',
    unavailable: '不可用'
  };
  return status ? statusMap[status] || status : '未选择';
};

const backendModuleStatusType = (status?: GeneratorBackendModuleOption['status']) => {
  if (status === 'ready') return 'success';
  if (status === 'pending') return 'info';
  if (status === 'unavailable') return 'danger';
  return 'info';
};

const applyBackendModule = (moduleOption: GeneratorBackendModuleOption) => {
  generatorInfo.value.backendTargetType = 'existing';
  generatorInfo.value.backendModuleName = moduleOption.moduleName;
  generatorInfo.value.pathApi = moduleOption.path;
  generatorInfo.value.packageName = moduleOption.packageName;
  generatorInfo.value.apiPrefixModule = moduleOption.apiPrefixModule;
  generatorInfo.value.apiPrefix = moduleOption.apiPrefix;
  generatorInfo.value.frontendModuleName = moduleOption.moduleCode;
};

const backendModuleChange = (moduleName: string) => {
  const moduleOption = backendModuleOptions.value.find(item => item.moduleName === moduleName);
  if (moduleOption) {
    applyBackendModule(moduleOption);
  }
};

const apiPathChange = (path: string) => {
  const moduleOption = backendModuleOptions.value.find(item => item.path === path);
  if (moduleOption) {
    applyBackendModule(moduleOption);
  }
};

const backendTargetChange = () => {
  if (generatorInfo.value.backendTargetType === 'existing') {
    newApiPathManuallyEdited.value = false;
    lastNewModuleCode.value = '';
    const recommended =
      backendModuleOptions.value.find(item => item.recommended) ||
      backendModuleOptions.value.find(item => item.status === 'ready');
    if (recommended) {
      applyBackendModule(recommended);
    }
    return;
  }
  generatorInfo.value.backendModuleName = '';
  generatorInfo.value.pathApi = '';
  generatorInfo.value.packageName = '';
  generatorInfo.value.apiPrefixModule = '';
  generatorInfo.value.apiPrefix = '';
  generatorInfo.value.frontendModuleName = '';
  lastNewModuleCode.value = '';
  newApiPathManuallyEdited.value = false;
  validateNewModuleFields();
};

const newBackendModuleChange = () => {
  const rawModuleName = (generatorInfo.value.backendModuleName || '').trim();
  const moduleCode = normalizeModuleCode(rawModuleName);
  const previousModuleCode = lastNewModuleCode.value;
  if (!moduleCode) {
    generatorInfo.value.packageName = '';
    if (!generatorInfo.value.apiPrefixModule || generatorInfo.value.apiPrefixModule === previousModuleCode) {
      generatorInfo.value.apiPrefixModule = '';
    }
    if (!generatorInfo.value.apiPrefix || generatorInfo.value.apiPrefix === `/${previousModuleCode}`) {
      generatorInfo.value.apiPrefix = '';
    }
    if (!generatorInfo.value.frontendModuleName || generatorInfo.value.frontendModuleName === previousModuleCode) {
      generatorInfo.value.frontendModuleName = '';
    }
    if (!newApiPathManuallyEdited.value) {
      generatorInfo.value.pathApi = '';
    }
    lastNewModuleCode.value = '';
    validateNewModuleFields();
    return;
  }
  if (!generatorInfo.value.apiPrefixModule || generatorInfo.value.apiPrefixModule === previousModuleCode) {
    generatorInfo.value.apiPrefixModule = moduleCode;
  }
  if (!generatorInfo.value.apiPrefix || generatorInfo.value.apiPrefix === `/${previousModuleCode}`) {
    generatorInfo.value.apiPrefix = `/${moduleCode}`;
  }
  generatorInfo.value.packageName = `com.sz.${moduleCode.replace(/-/g, '')}`;
  if (!generatorInfo.value.frontendModuleName || generatorInfo.value.frontendModuleName === previousModuleCode) {
    generatorInfo.value.frontendModuleName = moduleCode;
  }
  if (!generatorInfo.value.moduleName || generatorInfo.value.moduleName === previousModuleCode) {
    generatorInfo.value.moduleName = moduleCode;
  }
  if (!newApiPathManuallyEdited.value) {
    generatorInfo.value.pathApi = buildNewModulePath(rawModuleName);
  }
  lastNewModuleCode.value = moduleCode;
  validateNewModuleFields();
};

const newApiPathInput = () => {
  newApiPathManuallyEdited.value = true;
  validateNewModuleFields();
};

const moduleNameChange = (value: string) => {
  const moduleName = value?.trim() || '';
  generatorInfo.value.moduleName = moduleName;
};

const normalizeApiPrefixInput = () => {
  const apiPrefix = generatorInfo.value.apiPrefix?.trim();
  if (!apiPrefix) {
    generatorInfo.value.apiPrefix = '';
    return;
  }
  generatorInfo.value.apiPrefix = apiPrefix.startsWith('/') ? apiPrefix : `/${apiPrefix}`;
};

const buildNewModulePath = (moduleName: string) => {
  const rootPath = moduleRootPath.value;
  const trimmedModuleName = moduleName.trim();
  if (!rootPath || !trimmedModuleName) return '';
  const separator = rootPath.includes('\\') ? '\\' : '/';
  return `${rootPath}${separator}${trimmedModuleName}`;
};

const normalizeModuleCode = (moduleName: string) =>
  moduleName
    .trim()
    .replace(/^sz-module-/, '')
    .replace(/_/g, '-')
    .toLowerCase();

const normalizeModuleName = (moduleName?: string) => (moduleName || '').trim().toLowerCase();

const isInitialNewBackendModule = (moduleName?: string, pathApi?: string) => {
  if (!initialNewBackendModule.value.moduleName && !initialNewBackendModule.value.pathApi) {
    return false;
  }
  const moduleMatched =
    normalizeModuleName(moduleName) === initialNewBackendModule.value.moduleName ||
    normalizeModuleCode(moduleName || '') === initialNewBackendModule.value.moduleCode;
  const pathMatched = normalizePath(pathApi) === initialNewBackendModule.value.pathApi;
  return moduleMatched && pathMatched;
};

const findExistingModuleConflict = (moduleName: string) => {
  const normalizedModuleName = moduleName.trim().toLowerCase();
  const moduleCode = normalizeModuleCode(moduleName);
  return backendModuleOptions.value.find(
    item => item.moduleName.toLowerCase() === normalizedModuleName || item.moduleCode.toLowerCase() === moduleCode
  );
};

const normalizePath = (path?: string) =>
  (path || '')
    .trim()
    .replace(/[\\/]+/g, '/')
    .replace(/\/$/, '')
    .toLowerCase();

const dictionaryDisplayTypes = ['select', 'radio', 'radio-group', 'checkbox'];
const isDictionaryDisplayType = (htmlType?: string) => dictionaryDisplayTypes.includes(htmlType || '');

const htmlTypeChange = (row: GeneratorColumnInfo) => {
  if (row.htmlType === 'radio-group') {
    row.htmlType = 'radio';
  }
  if (!isDictionaryDisplayType(row.htmlType)) {
    return;
  }
  row.searchType = 'select';
  if (!row.dictShowWay) {
    row.dictShowWay = '0';
  }
};

const dictTypeChange = (row: GeneratorColumnInfo) => {
  if (row.dictType && !row.dictShowWay) {
    row.dictShowWay = '0';
  }
};

const validateColumnDictConfig = () => {
  for (const row of columnsInfos.value) {
    if (row.isLogicDel !== '0' || !isDictionaryDisplayType(row.htmlType)) {
      continue;
    }
    if (!row.dictType) {
      active.value = 1;
      ElMessage.warning(`字段「${row.columnComment || row.columnName}」选择了 ${row.htmlType}，请先配置字典类型`);
      return false;
    }
    if (!row.dictShowWay) {
      row.dictShowWay = '0';
    }
    if (row.htmlType === 'radio-group') {
      row.htmlType = 'radio';
    }
    row.searchType = 'select';
  }
  return true;
};

const validateNewModuleFields = () => {
  nextTick(() => {
    if (generatorInfo.value.backendTargetType !== 'new') return;
    generatorFormRef.value?.validateField('backendModuleName');
    generatorFormRef.value?.validateField('pathApi');
  });
};

// 更新列属性的通用函数
const updateColumnVisibility = (propToUpdate: string, isVisible: boolean) => {
  const existingColumn = columns.value.find(col => col.prop === propToUpdate);
  if (existingColumn) {
    existingColumn.isShow = isVisible;
  }
};

// 监听多个属性的变化，并执行相同的更新逻辑
watchEffect(() => {
  try {
    const genType = generatorInfo.value.generateType;
    updateColumnVisibility('isInsert', genType === 'all' || genType === 'server');
    updateColumnVisibility('isEdit', genType === 'all' || genType === 'server');
    updateColumnVisibility('isList', genType === 'all' || genType === 'server');
    updateColumnVisibility('isQuery', genType === 'all' || genType === 'server');
    updateColumnVisibility('isImport', (genType === 'all' || genType === 'server') && generatorInfo.value.hasImport === '1');
    updateColumnVisibility('isExport', (genType === 'all' || genType === 'server') && generatorInfo.value.hasExport === '1');
    updateColumnVisibility('queryType', genType === 'all' || genType === 'server');
    updateColumnVisibility('htmlType', genType === 'all');
    // 如果有其他类似的属性，也可以在这里进行处理
  } catch (error) {
    console.error('Error in watchEffect:', error);
    // 根据实际情况进行错误处理，如显示错误提示、回滚变更等
  }
});

const baseFormRef = ref();
const generatorFormRef = ref();

const handleSubmit = () => {
  normalizeDerivedGeneratorInfo();
  const baseValidate = new Promise((resolve, reject) => {
    baseFormRef.value
      ?.validate((valid: boolean) => {
        resolve(valid);
      })
      .catch((err: any) => {
        reject(err);
      });
  });
  const geneValidate = new Promise((resolve, reject) => {
    generatorFormRef.value
      ?.validate((valid: boolean) => {
        resolve(valid);
      })
      .catch((err: any) => {
        reject(err);
      });
  });
  Promise.all([baseValidate, geneValidate]).then(res => {
    if (res[0] === false) {
      active.value = 0;
      return;
    }
    if (res[1] === false) {
      active.value = 2;
      return;
    }
    if (!validateColumnDictConfig()) {
      return;
    }

    paramsProps.value.api!({
      baseInfo: baseInfo.value,
      columns: columnsInfos.value,
      generatorInfo: generatorInfo.value
    }).then(() => {
      ElMessage.success({ message: '保存成功！' });
      visible.value = false;
    });
  });
};

const normalizeDerivedGeneratorInfo = () => {
  if (!generatorInfo.value.frontendLayout) {
    generatorInfo.value.frontendLayout = 'module';
  }
  if (generatorInfo.value.backendTargetType === 'new') {
    const moduleCode = normalizeModuleCode(generatorInfo.value.backendModuleName || '');
    if (moduleCode) {
      if (!generatorInfo.value.packageName) {
        generatorInfo.value.packageName = `com.sz.${moduleCode.replace(/-/g, '')}`;
      }
      if (!generatorInfo.value.apiPrefixModule) {
        generatorInfo.value.apiPrefixModule = moduleCode;
      }
      if (!generatorInfo.value.frontendModuleName) {
        generatorInfo.value.frontendModuleName = moduleCode;
      }
    }
  } else if (generatorInfo.value.backendModuleName) {
    const selected = backendModuleOptions.value.find(item => item.moduleName === generatorInfo.value.backendModuleName);
    if (selected && !generatorInfo.value.frontendModuleName) {
      generatorInfo.value.frontendModuleName = selected.moduleCode;
    }
  }
  if (!generatorInfo.value.frontendModuleName) {
    generatorInfo.value.frontendModuleName = generatorInfo.value.moduleName;
  }
  if (!generatorInfo.value.apiPrefixModule) {
    generatorInfo.value.apiPrefixModule = 'admin';
  }
  if (!generatorInfo.value.apiPrefix) {
    generatorInfo.value.apiPrefix = `/${generatorInfo.value.apiPrefixModule}`;
  }
  normalizeApiPrefixInput();
};

// 接收父组件传过来的参数
const acceptParams = (params: View.DefaultParams) => {
  paramsProps.value = params;
  getInfo();
  visible.value = true;
};

const typeContent = ref<{
  [key: string]: {
    tooltip: string;
    text: string;
  };
}>({
  all: {
    tooltip: '【增删改查】 所有组件，包括后端服务和前端视图',
    text: 'Controller、Service、Mapper、DTO、PO、VO | modules/<业务模块>/views、api、types、register'
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
});

const changeRadio = (val: string) => {
  isShowExcel.value = val === 'all' || val === 'server';
};

const parentTreeRef = ref();

const treeSelectChange = () => {
  if (parentTreeRef.value!.getCurrentNode().menuTypeCd === '1002001') {
    const menuName = parentTreeRef.value!.getCurrentNode().name;
    generatorInfo.value.moduleName = menuName;
    if (generatorInfo.value.backendTargetType === 'new') {
      generatorInfo.value.frontendModuleName = menuName;
    }
  }
};

defineExpose({
  acceptParams
});
</script>

<style scoped lang="scss">
.form-type {
  margin: 0 0 30px 10px;
}

.generator-form {
  padding: 0 12px;
}

.form-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 20px 18px 0;
  padding-bottom: 10px;
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 600;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.form-header::before {
  width: 3px;
  height: 14px;
  content: '';
  border-radius: 2px;
  background: var(--el-color-primary);
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

.dict-required-tip {
  margin-left: 6px;
  white-space: nowrap;
}

.module-option-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
}

.module-option-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.module-option-status {
  flex: 0 0 auto;
  margin-left: 12px;
}

.target-summary {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-height: 26px;
  margin: -4px 20px 16px 190px;
  padding: 2px 0;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 18px;
}

.target-summary :deep(.el-tag) {
  flex: 0 0 auto;
  margin-top: 1px;
}

.target-summary > span:last-child {
  flex: 1;
  min-width: 0;
}

.path-option-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--el-text-color-primary);
  line-height: 20px;
}

.path-option-value {
  margin-top: 2px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 18px;
  word-break: break-all;
}

:global(.generator-module-popper .el-select-dropdown__item) {
  height: 34px;
  line-height: 34px;
}

:global(.generator-module-popper .module-option-row) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
}

:global(.generator-module-popper .module-option-name) {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:global(.generator-module-popper .module-option-status) {
  flex: 0 0 auto;
  margin-left: 12px;
}

:global(.generator-path-popper .el-select-dropdown__item.path-option) {
  height: auto;
  min-height: 58px;
  padding: 7px 12px;
  line-height: 1.35;
}

:global(.generator-path-popper .path-option-title) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--el-text-color-primary);
  line-height: 20px;
}

:global(.generator-path-popper .path-option-title > span) {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:global(.generator-path-popper .path-option-value) {
  margin-top: 2px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 18px;
  white-space: normal;
  word-break: break-all;
}

:deep(.el-select-group .el-select-dropdown__item) {
  padding-left: 32px;
}
:deep(.el-table .el-table__header th) {
  font-size: 12px;
}
:deep(.el-table--default .cell) {
  padding: 0 10px;
}

:deep(.table-main .el-table .el-table__row) {
  font-size: 12px;
}
</style>
