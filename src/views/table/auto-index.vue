<template>
  <!-- 布局包裹  -->
  <div class="app-container">
    <!-- search-bar 搜索工具栏   -->
    <div class="head-container">

      <el-input
        v-model="query.blurry"
        clearable
        size="mini"
        placeholder="输入名称"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="onSearch"
      />

      <date-range-picker v-model="query.time" class="date-item search-left" />
      <!-- 搜索与重置按钮     -->
      <span class="search-left">
        <el-button class="filter-item" size="mini" type="success" icon="el-icon-search" @click="onSearch">
          搜索
        </el-button>
        <el-button class="filter-item" size="mini" type="warning" icon="el-icon-refresh-left" @click="onReset">
          重置
        </el-button>
      </span>

      <!-- 左右按钮     -->
      <div class="crud-opts">
        <span class="crud-opts-left">
          <slot name="left" />
          <el-button
            class="filter-item"
            size="mini"
            type="primary"
            icon="el-icon-plus"
          >
            新增
          </el-button>
          <!--         <el-button
                     class="filter-item"
                     size="mini"
                     type="success"
                     icon="el-icon-edit"
                     :disabled="true"
                     @click=""
                   >
                  修改
                </el-button>
                 <el-button
                   slot="reference"
                   class="filter-item"
                   type="danger"
                   icon="el-icon-delete"
                   size="mini"
                   :disabled="true"
                   @click=""
                 >
                    删除
                  </el-button>-->
          <!--右侧-->
          <slot name="right" />
        </span>
        <!--        <el-button-group class="crud-opts-right">
        &lt;!&ndash;          <el-button
                    size="mini"
                    plain
                    type="info"
                    icon="el-icon-search"
                    @click=""
                  />
                  <el-button
                    size="mini"
                    icon="el-icon-refresh"
                    @click="refresh"
                  />&ndash;&gt;

        &lt;!&ndash;          <el-popover
                    placement="bottom-end"
                    width="150"
                    trigger="click"
                  >
                    <el-button
                      slot="reference"
                      size="mini"
                      icon="el-icon-s-grid"
                    >
                      <i
                        class="fa fa-caret-down"
                        aria-hidden="true"
                      />
                    </el-button>
                    <el-checkbox
                      v-model="table.allColumnsSelected"
                      :indeterminate="table.allColumnsSelectedIndeterminate"
                      @change="handleCheckAllChange"
                    >
                      全部
                    </el-checkbox>
                    <el-checkbox
                      v-for="item in table.tableColumns"
                      :key="item.property"
                      v-model="item.visible"
                      @change="handleCheckedTableColumnsChange(item)"
                    >
                      列
                    </el-checkbox>
                  </el-popover>&ndash;&gt;

                </el-button-group>-->
      </div>
    </div>

    <!-- table 表格   -->
    <el-table ref="table" v-loading="listLoading" :data="list" style="width: 100%;">
      <!-- checkbox     -->
      <el-table-column type="selection" width="55" />
      <el-table-column :show-overflow-tooltip="true" prop="groupwareId" label="Groupware ID" />
      <el-table-column :show-overflow-tooltip="true" prop="username" label="用户姓名" />
      <el-table-column label="状态" align="center" prop="status">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.status"
            dict
            :disabled="false"
            active-color="#409EFF"
            inactive-color="#F56C6C"
          />
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" prop="createTime" label="创建时间" />
      <!-- 右侧固定操作栏     -->
      <el-table-column
        fixed="right"
        label="操作"
        width="150"
      >
        <template slot-scope="scope">
          <el-button type="text" size="mini" @click="showDetail(scope)">查看</el-button>
          <el-button type="text" size="mini" @click="editColumn(scope)">编辑</el-button>
          <el-button type="text" size="mini" @click="deleteColumn(scope)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- page 分页  -->
    <template>
      <el-pagination
        :page-size.sync="page.limit"
        :total="page.total"
        :current-page.sync="page.page"
        style="margin-top: 8px;"
        layout="total, prev, pager, next, sizes"
        @size-change="pageSizeChangeHandler"
        @current-change="pageLimitChangeHandler"
      />
    </template>

  </div>
</template>

<script>
import DateRangePicker from '@/components/DateRangePicker'

export default {
  name: 'AutoIndexVue',
  components: { DateRangePicker },
  data() {
    return {
      // 搜索区域查询条件
      query: {
        blurry: '',
        time: ['2022-06-02 00:00:00', '2022-06-13 00:00:00'] // 设置默认时间
      },
      // 加载状态设置
      listLoading: true,
      // 表格渲染数据
      list: [
        {
          'approveResult': 1,
          'createId': '',
          'createTime': '2022-02-23 14:21:28',
          'disabled': true,
          'groupwareId': 'admin',
          'id': 3,
          'roles': [{
            'createId': null,
            'createTime': null,
            'dataScope': null,
            'description': null,
            'id': 1,
            'level': null,
            'menus': null,
            'name': 'adminstrator',
            'updateId': null,
            'updateTime': null
          }],
          'status': true,
          'updateId': '',
          'updateTime': null,
          'userRemark': '测试账户',
          'username': 'admin'
        },
        {
          'approveResult': 1,
          'createId': '',
          'createTime': '2022-03-07 13:13:25',
          'disabled': false,
          'groupwareId': 'test',
          'id': 29,
          'roles': [{
            'createId': null,
            'createTime': null,
            'dataScope': null,
            'description': null,
            'id': 1,
            'level': null,
            'menus': null,
            'name': 'adminstrator',
            'updateId': null,
            'updateTime': null
          }],
          'status': true,
          'updateId': '',
          'updateTime': null,
          'userRemark': 'test',
          'username': 'test'
        },
        {
          'approveResult': 2,
          'createId': '',
          'createTime': '2022-03-08 10:41:39',
          'disabled': false,
          'groupwareId': 'test2',
          'id': 35,
          'roles': [{
            'createId': null,
            'createTime': null,
            'dataScope': null,
            'description': null,
            'id': 4,
            'level': null,
            'menus': null,
            'name': 'test',
            'updateId': null,
            'updateTime': null
          }],
          'status': true,
          'updateId': '',
          'updateTime': null,
          'userRemark': null,
          'username': 'test2'
        },
        {
          'approveResult': 1,
          'createId': '',
          'createTime': '2022-03-09 09:11:07',
          'disabled': false,
          'groupwareId': 'test3',
          'id': 36,
          'roles': [{
            'createId': null,
            'createTime': null,
            'dataScope': null,
            'description': null,
            'id': 4,
            'level': null,
            'menus': null,
            'name': 'test',
            'updateId': null,
            'updateTime': null
          }],
          'status': true,
          'updateId': '',
          'updateTime': null,
          'userRemark': null,
          'username': 'test3'
        },
        {
          'approveResult': 1,
          'createId': '',
          'createTime': '2022-03-09 10:17:57',
          'disabled': false,
          'groupwareId': 'curyu',
          'id': 37,
          'roles': [{
            'createId': null,
            'createTime': null,
            'dataScope': null,
            'description': null,
            'id': 1,
            'level': null,
            'menus': null,
            'name': 'adminstrator',
            'updateId': null,
            'updateTime': null
          }],
          'status': true,
          'updateId': '',
          'updateTime': null,
          'userRemark': null,
          'username': 'curyu'
        },
        {
          'approveResult': 1,
          'createId': '',
          'createTime': '2022-03-09 11:10:40',
          'disabled': false,
          'groupwareId': 'sbjo',
          'id': 38,
          'roles': [{
            'createId': null,
            'createTime': null,
            'dataScope': null,
            'description': null,
            'id': 3,
            'level': null,
            'menus': null,
            'name': 'develop',
            'updateId': null,
            'updateTime': null
          }],
          'status': true,
          'updateId': '',
          'updateTime': null,
          'userRemark': null,
          'username': 'sbjo'
        },
        {
          'approveResult': 0,
          'createId': '',
          'createTime': '2022-03-09 13:29:19',
          'disabled': false,
          'groupwareId': 'admn',
          'id': 40,
          'roles': null,
          'status': true,
          'updateId': '',
          'updateTime': null,
          'userRemark': null,
          'username': 'admn'
        },
        {
          'approveResult': 1,
          'createId': '',
          'createTime': '2022-03-09 14:25:46',
          'disabled': false,
          'groupwareId': 'aaaa',
          'id': 43,
          'roles': [{
            'createId': null,
            'createTime': null,
            'dataScope': null,
            'description': null,
            'id': 7,
            'level': null,
            'menus': null,
            'name': 'qs',
            'updateId': null,
            'updateTime': null
          }],
          'status': true,
          'updateId': '',
          'updateTime': null,
          'userRemark': null,
          'username': 'aaaa'
        },
        {
          'approveResult': 1,
          'createId': '',
          'createTime': '2022-03-10 07:44:02',
          'disabled': false,
          'groupwareId': 'bbb',
          'id': 44,
          'roles': [{
            'createId': null,
            'createTime': null,
            'dataScope': null,
            'description': null,
            'id': 3,
            'level': null,
            'menus': null,
            'name': 'develop',
            'updateId': null,
            'updateTime': null
          }],
          'status': true,
          'updateId': '',
          'updateTime': null,
          'userRemark': null,
          'username': 'bbb'
        },
        {
          'approveResult': 1,
          'createId': '',
          'createTime': '2022-03-10 07:57:04',
          'disabled': false,
          'groupwareId': 'ccc',
          'id': 45,
          'roles': [{
            'createId': null,
            'createTime': null,
            'dataScope': null,
            'description': null,
            'id': 3,
            'level': null,
            'menus': null,
            'name': 'develop',
            'updateId': null,
            'updateTime': null
          }, {
            'createId': null,
            'createTime': null,
            'dataScope': null,
            'description': null,
            'id': 2,
            'level': null,
            'menus': null,
            'name': 'operate',
            'updateId': null,
            'updateTime': null
          }],
          'status': true,
          'updateId': '',
          'updateTime': null,
          'userRemark': null,
          'username': 'ccc'
        }
      ],
      // 分页设置
      page: {
        page: 1,
        limit: 10,
        total: 22
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      // ...
      this.listLoading = false
    },
    onSearch() {
      console.log(' onclick ...', this.query)
    },
    onReset() {
      this.query = {}
      console.log(' on reset ...')
    },
    // 表格局部更新( 添加、修改、删除时)
    refresh() {
      this.page.page = 1
      this.page.limit = 10
      this.query = {}
      console.log('刷新...')
      this.getList()
    },
    // 展示记录详情
    showDetail(scope) {
      console.log('查看', scope)
    },
    // 编辑操作
    editColumn(scope) {
      console.log('编辑', scope)
    },
    // 删除
    deleteColumn(scope) {
      console.log('删除', scope)
    },
    // 翻页
    pageSizeChangeHandler(val) {
      this.page.limit = val
      this.getList()
    },
    // 每页最大条数修改
    pageLimitChangeHandler(val) {
      this.page.page = val
      this.getList()
    }
  }
}
</script>

<style scoped>
/*搜索-重置按钮,左边距*/
.search-left {
  margin-left: 10px;
}

.crud-opts {
  padding: 4px 0;
  display: -webkit-flex;
  display: flex;
  align-items: center;
}

.crud-opts .crud-opts-right {
  margin-left: auto;
}

.crud-opts .crud-opts-right span {
  float: left;
}

</style>
