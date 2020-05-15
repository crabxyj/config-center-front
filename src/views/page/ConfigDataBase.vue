<template>
  <div class="table">
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item><i class="el-icon-lx-cascades"></i>数据库连接管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div class="handle-box">
        <el-button type="primary" icon="delete" class="handle-del mr10" @click="delAll">批量删除</el-button>
        <el-button type="primary" icon="el-icon-plus" class="handle-del mr10" @click="add">添加</el-button>
        <el-select v-model="searchForm.type" placeholder="筛选类型" class="handle-select mr10" clearable @change="loadTable">
            <el-option label="mysql" value='mysql'></el-option>
            <el-option label="redis" value='redis'></el-option>
        </el-select>
        <el-input v-model="searchForm.baseName" placeholder="请输入数据库名" class="handle-input mr10"></el-input>
        <el-button type="primary" icon="el-icon-search" @click="loadTable">搜索</el-button>
      </div>
      <el-table :data="tableData" border class="table" ref="multipleTable" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center"></el-table-column>
        <el-table-column prop="baseName" label="数据库名" width="180" sortable></el-table-column>
        <el-table-column prop="type" label="类型" width="80"></el-table-column>
        <el-table-column prop="username" label="用户名" sortable width="120"></el-table-column>
        <el-table-column prop="url" label="连接地址" show-overflow-tooltip width="220"></el-table-column>
        <!-- <el-table-column prop="password" label="值" width="180"></el-table-column> -->
        <el-table-column label="操作" min-width="180" align="center">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
            <el-button type="text" icon="el-icon-delete" class="red" @click="handleDelete(scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination">
        <el-pagination
          background
          @size-change="handleSizeChange"
          :page-sizes="[10, 20, 50, 100]"
          @current-change="handleCurrentChange"
          :current-page="curPage"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalCount">
        </el-pagination>
      </div>
    </div>
    <!-- 编辑弹出框 -->
    <el-dialog :title="formDialog.title" :visible.sync="formDialog.visible" width="30%">
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="名称">
          <el-input v-model="form.baseName" placeholder="请输入数据库名称"></el-input>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="form.type" placeholder="筛选类型">
              <el-option label="mysql" value='mysql'></el-option>
              <el-option label="redis" value='redis'></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="连接地址">
          <el-input v-model="form.url" placeholder="请输入url连接地址"></el-input>
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="form.username" placeholder="请输入登录用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" placeholder="请输入登录密码"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="formDialog.visible = false">取 消</el-button>
        <el-button type="primary" @click="saveModify">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 删除提示框 -->
    <el-dialog title="提示" :visible.sync="delVisible" width="300px" center>
      <div class="del-dialog-cnt">删除不可恢复，是否确定删除？</div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="delVisible = false">取 消</el-button>
        <el-button type="primary" @click="deleteRow">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'configDataBase',
  data () {
    return {
      tableData: [],
      totalCount: 100,
      curPage: 0,
      pageSize: 20,
      multipleSelection: [],
      moduleNames: [],
      searchForm: {
        baseName: '',
        type: ''
      },
      formDialog: {
        title: '',
        visible: false
      },
      form: {
        baseId: '',
        type: '',
        baseName: '',
        url: '',
        username: '',
        password: ''
      },
      delIds: [],
      delVisible: false
    }
  },
  created () {
    this.loadTable()
  },
  computed: {
  },
  methods: {
    // 分页导航
    handleCurrentChange (val) {
      this.curPage = val
      this.loadTable()
    },
    handleSizeChange (val) {
      this.pageSize = val
      this.loadTable()
    },
    loadTable () {
      console.log(this.searchForm)
      const data = {
        baseName: this.searchForm.baseName,
        type: this.searchForm.type,
        url: this.searchForm.baseName,
        curPage: this.curPage,
        pageSize: this.pageSize
      }
      const url = 'http://127.0.0.1:8081'
      const port = '/config/database/loadPage'
      const _this = this
      this.$http.get(url, port, data, function (res) {
        if (res.code !== 0) {
          _this.$message.warning(res.msg)
          return
        }
        console.log(res)
        _this.tableData = res.r.records
        _this.totalCount = res.r.total
      })
      // 开发环境使用 easy-mock 数据，正式环境使用 json 文件
      // if (process.env.NODE_ENV === 'development') {
      //   this.url = '/ms/table/list'
      // }
    },
    add () {
      this.form = {
        type: '',
        baseName: '',
        url: '',
        username: '',
        password: ''
      }
      this.formDialog.title = '添加配置'
      this.formDialog.visible = true
    },
    handleEdit (index, row) {
      this.form = {
        baseId: row.baseId,
        type: row.type,
        baseName: row.baseName,
        url: row.url,
        username: row.username,
        password: row.password
      }
      this.formDialog.title = '编辑配置'
      this.formDialog.visible = true
    },
    handleDelete (index, row) {
      this.delIds = [row.baseId]
      this.delVisible = true
    },
    delAll () {
      const delIds = []
      const length = this.multipleSelection.length
      for (let i = 0; i < length; i++) {
        delIds.push(this.multipleSelection[i].baseId)
      }
      this.delIds = delIds
      this.delVisible = true
      this.multipleSelection = []
    },
    handleSelectionChange (val) {
      this.multipleSelection = val
    },
    // 保存
    saveModify () {
      const url = 'http://127.0.0.1:8081'
      const port = this.form.baseId ? '/config/database/modify' : '/config/database/add'
      const _this = this
      const data = {
        baseId: this.form.baseId,
        type: this.form.type,
        baseName: this.form.baseName,
        url: this.form.url,
        username: this.form.username,
        password: this.form.password
      }
      console.log(data)
      this.$http.post(url, port, data, function (res) {
        if (res.code !== 0) {
          _this.$message.warning(res.msg)
          return
        }
        console.log(res)
        _this.formDialog.visible = false
        _this.$message.success(_this.form.baseId ? '修改成功' : '添加成功')
        _this.loadTable()
      })
    },
    // 确定删除
    deleteRow () {
      // rm this.delIds
      let str = ''
      const length = this.delIds.length
      for (let i = 0; i < length; i++) {
        str += ',' + this.delIds[i]
      }
      str = str.substring(1)
      const url = 'http://127.0.0.1:8081'
      const port = '/config/database/del'
      const _this = this
      this.$http.post(url, port, { ids: str }, function (res) {
        if (res.code !== 0) {
          _this.$message.warning(res.msg)
          return
        }
        console.log(res)
        _this.$message.success('删除' + str + '成功')
        _this.delVisible = false
        _this.loadTable()
      })
    }
  }
}
</script>

<style scoped>
  .handle-box {
    margin-bottom: 20px;
  }

  .handle-select {
    width: 120px;
  }

  .handle-input {
    width: 300px;
    display: inline-block;
  }

  .del-dialog-cnt {
    font-size: 16px;
    text-align: center
  }

  .table {
    width: 100%;
    font-size: 14px;
  }

  .red {
    color: #ff0000;
  }

  .mr10 {
    margin-right: 10px;
  }
</style>
