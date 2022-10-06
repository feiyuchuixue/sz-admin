<template>
  <!-- 布局包裹  -->
  <div class="app-container">
    <!-- search-bar 搜索工具栏   -->
    <div class="head-container">

      <el-input
        v-model="query.shopName"
        clearable
        size="mini"
        placeholder="输入店铺名称"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="onSearch"
      />

      <date-range-picker v-model="time" class="date-item search-left" />
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

          <!--右侧-->
          <slot name="right" />
        </span>

      </div>
    </div>

    <!-- table 表格   -->
    <el-table ref="table" v-loading="listLoading" :data="list" style="width: 100%;">
      <!-- checkbox     -->
      <!--      <el-table-column type="selection" width="55"/>-->
      <el-table-column fixed="left" prop="id" width="180" label="序号" />
      <el-table-column :show-overflow-tooltip="true" prop="name" label="店铺名称" />
      <el-table-column :show-overflow-tooltip="true" width="350" prop="detail" label="详情" />
      <el-table-column :show-overflow-tooltip="true" prop="workTime" label="营业时间" />
      <el-table-column :show-overflow-tooltip="true" prop="phone" label="联系电话" />
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
          <!--          <el-button @click="deleteColumn(scope)" type="text" size="mini">删除</el-button>-->
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
import { getShopList } from '@/api/shop'

export default {
  name: 'ShopInfo',
  components: { DateRangePicker },
  data() {
    return {
      time: [],
      // 搜索区域查询条件
      query: {
        shopName: '',
        time: [] // 设置默认时间
      },
      // 加载状态设置
      listLoading: true,
      // 表格渲染数据
      list: [],
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
      this.query.page = this.page.page
      this.query.limit = this.page.limit
      getShopList(this.query).then(response => {
        this.list = response.body.list
        this.page.page = response.body.pageNum
        this.page.limit = response.body.pageSize
        this.page.total = response.body.totalPage
        this.listLoading = false
      })
    },
    onSearch() {
      console.log(' onclick ...', this.query)
      this.getList()
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
