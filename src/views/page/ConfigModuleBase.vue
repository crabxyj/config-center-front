<template>
  <div class="table">
    <div class="crumbs">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item><i class="el-icon-lx-cascades"></i>模块数据库管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="container">
      <div class="handle-box">
        <el-button type="primary" icon="el-icon-plus" class="handle-del mr10" @click="add">添加</el-button>
        <el-input v-model="searchForm.moduleName" placeholder="筛选模块" class="handle-input mr10"></el-input>
        <el-button type="primary" icon="el-icon-search" @click="loadTable">搜索</el-button>
      </div>
      <el-table :data="tableData" border class="table">
        <el-table-column prop="moduleName" label="模块名称"  width="150"></el-table-column>
        <el-table-column prop="version" label="版本" sortable width="80"></el-table-column>
        <el-table-column prop="baseIds" label="值" width="250">
          <template slot-scope="scope">
            <el-tag v-for="item in scope.row.baseIds.split(',').filter(id => id) " :key='item'>{{baseMap[item].baseName}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="90">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
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
        <el-form-item label="模块">
          <el-input v-model="form.moduleName" placeholder="请输入模块"></el-input>
        </el-form-item>
        <el-form-item label="版本">
          <el-input v-model="form.version" placeholder="请输入版本"></el-input>
        </el-form-item>
        <el-form-item label="数据库">
          <el-select v-model="form.baseIds" multiple placeholder="请选择">
            <el-option
              v-for="item in bases"
              :key="item.baseId"
              :label="item.baseName"
              :value="item.baseId">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="formDialog.visible = false">取 消</el-button>
        <el-button type="primary" @click="saveModify">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'configModule',
  data () {
    return {
      tableData: [],
      totalCount: 100,
      curPage: 0,
      pageSize: 20,
      bases: [],
      baseMap: {},
      searchForm: {
        moduleName: '',
        version: null
      },
      formDialog: {
        title: '',
        visible: false
      },
      form: {
        moduleName: '',
        version: '0.0.1',
        baseIds: []
      }
    }
  },
  created () {
    this.loadBases()
    this.loadTable()
  },
  computed: {
  },
  methods: {
    loadBases () {
      const url = 'http://127.0.0.1:8081'
      const port = '/config/database/load'
      const _this = this
      this.$http.get(url, port, {}, function (res) {
        if (res.code !== 0) {
          _this.$message.warning(res.msg)
          return
        }
        console.log(res)
        const baseMap = {}
        for (let i = 0; i < res.rs.length; i++) {
          const base = res.rs[i]
          base.baseId = base.baseId + ''
          baseMap[base.baseId] = base
        }
        _this.baseMap = baseMap
        _this.bases = res.rs
      })
    },
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
        moduleName: this.searchForm.moduleName,
        version: this.searchForm.version,
        curPage: this.curPage,
        pageSize: this.pageSize
      }
      const url = 'http://127.0.0.1:8081'
      const port = '/config/moduleBase/loadPage'
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
    },
    add () {
      this.form = {
        moduleName: '',
        version: '',
        baseIds: ''
      }
      this.formDialog.title = '添加'
      this.formDialog.visible = true
    },
    handleEdit (index, row) {
      this.form = {
        moduleName: row.moduleName,
        version: row.version,
        baseIds: row.baseIds.split(',')
      }
      this.formDialog.title = '编辑'
      this.formDialog.visible = true
    },
    // 保存
    saveModify () {
      const url = 'http://127.0.0.1:8081'
      const port = this.form.id ? '/config/moduleBase/modify' : '/config/moduleBase/add'
      const _this = this
      const data = {
        id: this.form.id,
        moduleName: this.form.moduleName,
        version: this.form.version,
        baseIds: ''
      }
      for (let i = 0; i < this.form.baseIds.length; i++) {
        data.baseIds += this.form.baseIds[i] + ','
      }
      console.log(data)
      this.$http.post(url, port, data, function (res) {
        if (res.code !== 0) {
          _this.$message.warning(res.msg)
          return
        }
        console.log(res)
        _this.formDialog.visible = false
        _this.$message.success(_this.form.id ? '修改成功' : '添加成功')
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
