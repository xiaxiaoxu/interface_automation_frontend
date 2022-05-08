<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
        <a-form layout="inline">
          <a-row :gutter="48">
            <a-col :md="6" :sm="18">
              <a-form-item label="测试集合名称">
                <a-input v-model="testSuiteName" placeholder=""/>
              </a-form-item>
            </a-col>
            <a-col :md="!advanced && 8 || 24" :sm="24">
              <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
                <a-button type="primary" @click="getTestSuiteData()">查询</a-button>
              </span>
            </a-col>
          </a-row>
          <a-row :gutter="6">
            <a-col :md="5" :sm="10">
              <a-form-item label="延迟执行的时间(秒)">
                <a-input style="width: 100px" v-model="delayTime" placeholder="请输入"/>
              </a-form-item>
            </a-col>
            <a-col :md="4" :sm="8">
              <a-form-item label="运行环境">
                <a-select
                  show-search
                  default-value="Dev"
                  style="width: 100px"
                  @change="handleChange"
                >
                  <a-select-option value="dev">
                    Dev
                  </a-select-option>
                  <a-select-option value="prod">
                    Prod
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :md="5" :sm="12">
              <span class="table-page-search-submitButtons" :style="advanced && { float: 'right', overflow: 'hidden' } || {} ">
                <a-button type="primary" @click="runTestSuite">运行测试集合</a-button>
              </span>
            </a-col>
          </a-row>
          <a-row :gutter="48">
            <!-- <a-col :md="8" :sm="24">
              <a-form-item label="延迟执行的事件(秒)">
                <a-input style="width: 100px" v-model="queryParam.id" placeholder="请输入"/>
              </a-form-item>
            </a-col> -->
            <!-- <a-col :md="8" :sm="24">
              <a-form-item label="使用状态">
                <a-select v-model="queryParam.status" placeholder="请选择" default-value="0">
                  <a-select-option value="0">全部</a-select-option>
                  <a-select-option value="1">关闭</a-select-option>
                  <a-select-option value="2">运行中</a-select-option>
                </a-select>
              </a-form-item>
            </a-col> -->
            <template v-if="advanced">
              <a-col :md="8" :sm="24">
                <a-form-item label="调用次数">
                  <a-input-number v-model="queryParam.callNo" style="width: 100%"/>
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-form-item label="更新日期">
                  <a-date-picker v-model="queryParam.date" style="width: 100%" placeholder="请输入更新日期"/>
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-form-item label="使用状态">
                  <a-select v-model="queryParam.useStatus" placeholder="请选择" default-value="0">
                    <a-select-option value="0">全部</a-select-option>
                    <a-select-option value="1">关闭</a-select-option>
                    <a-select-option value="2">运行中</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :md="8" :sm="24">
                <a-form-item label="使用状态">
                  <a-select placeholder="请选择" default-value="0">
                    <a-select-option value="0">全部</a-select-option>
                    <a-select-option value="1">关闭</a-select-option>
                    <a-select-option value="2">运行中</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </template>
          </a-row>
        </a-form>
      </div>
      <a-table
        bordered
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        :columns="columns"
        rowKey="id"
        :data-source="testSuiteData"
        :loading="loading"
        class="select-table"
        :pagination="pagination"
      >
        <span slot="testSuiteCase">
          <a>查看/删除集合用例</a>
        </span>
        <span slot="manageTestSuiteCase">
          <a>添加集合用例</a>
        </span>
        <span slot="testSuiteExecuteResult">
          <a>查看集合执行结果</a>
        </span>
        <span slot="serial" slot-scope="text, record, index">
          {{ index + 1 }}
        </span>
        <span slot="status" slot-scope="text">
          <a-badge :status="text | statusTypeFilter" :text="text | statusFilter" />
        </span>
        <span slot="description" slot-scope="text">
          <ellipsis :length="10" tooltip>{{ text }}</ellipsis>
        </span>

        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="handleEdit(record)">查看</a>
            <!-- <a-divider type="vertical" />
            <a @click="handleSub(record)">订阅报警</a> -->
          </template>
        </span>
      </a-table>

      <create-form
        ref="createModal"
        :visible="visible"
        :loading="confirmLoading"
        :model="mdl"
        @cancel="handleCancel"
        @ok="handleOk"
      />
      <step-by-step-modal ref="modal" @ok="handleOk"/>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import moment from 'moment'
import { STable, Ellipsis } from '@/components'
import { getTestSuiteList, runTestSuite } from '@/api/test_suite'

import StepByStepModal from './modules/StepByStepModal'
import CreateForm from './modules/CreateForm'

const columns = [
  {
    title: '编号',
    scopedSlots: { customRender: 'serial' }
  },
  {
    title: '测试集合名称',
    dataIndex: 'suite_desc',
    scopedSlots: { customRender: 'suite_desc' }
  },
  {
    title: '创建人',
    dataIndex: 'creator',
    sorter: true,
    needTotal: false
    // customRender: (text) => text + ' 次'
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
    sorter: true
  },
  {
    title: '集合测试用例',
    dataIndex: 'testSuiteCase',
    scopedSlots: { customRender: 'testSuiteCase' }
  },
  {
    title: '管理集合测试用例',
    dataIndex: 'manageTestSuiteCase',
    scopedSlots: { customRender: 'manageTestSuiteCase' }
  },
  {
    title: '测试集合执行结果',
    dataIndex: 'testSuiteExecuteResult',
    width: '150px',
    scopedSlots: { customRender: 'testSuiteExecuteResult' }
  }
]

const statusMap = {
  0: {
    status: 'default',
    text: '关闭'
  },
  1: {
    status: 'processing',
    text: '运行中'
  },
  2: {
    status: 'success',
    text: '已上线'
  },
  3: {
    status: 'error',
    text: '异常'
  }
}

export default {
  name: 'ModuleList',
  components: {
    STable,
    Ellipsis,
    CreateForm,
    StepByStepModal
  },
  data () {
    this.columns = columns
    return {
      // create model
      visible: false,
      confirmLoading: false,
      mdl: null,
      delayTime: '',
      testSuiteData: [],
      testSuiteName: '',
      env: '',
      // 高级搜索 展开/关闭
      advanced: false,
      // 查询参数
      queryParam: {},
      selectedRowKeys: [],
      selectedRows: [],
      pagination: {
        defaultCurrent: 1, // 默认当前页数
        defaultPageSize: 20, // 默认当前页显示数据的大小
        total: 0, // 总数，必须先有
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ['10', '20', '30', '40'],
        showTotal: (total) => `共 ${total} 条`, // 显示总数
        onShowSizeChange: (current, pageSize) => {
          this.pagination.defaultCurrent = 1
          this.pagination.defaultPageSize = pageSize
        },
        // 改变每页数量时更新显示
        onChange: (current) => {
          this.pagination.defaultCurrent = current
        }
      }
    }
  },
  filters: {
    statusFilter (type) {
      return statusMap[type].text
    },
    statusTypeFilter (type) {
      return statusMap[type].status
    }
  },
  created () {
    this.getTestSuiteData()
  },
  computed: {
    rowSelection () {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: this.onSelectChange
      }
    }
  },
  methods: {
    handleChange (value) {
      // console.log('value in handleChange:')
      console.log(`selected ${value}`) // { key: "lucy", label: "Lucy (101)" }
      this.env = value
    },
    getTestSuiteData () {
      console.log('in getTestSuiteData')
      const params = {
        test_suite_name: this.testSuiteName
      }
      this.loading = true
      getTestSuiteList(params).then(res => {
       this.testSuiteData = res.data
       this.loading = false
      }).catch(err => {
        this.$message.error(err.message)
      }).finally(() => {
        this.loading = false
      })
    },
    runTestSuite () {
      console.log('in runTestSuite')
      if (this.selectedRowKeys.length === 0) {
          this.$message.info('请选择用例后再运行')
          console.log('!this.selectedRowKeys:', !this.selectedRowKeys)
      } else {
        this.$message.info('提交运行成功')
        this.selectedRowKeys = []
        const params = {
          env: this.env,
          testcase_ids: this.selectedRowKeys,
          delay_time: this.delayTime
        }
        console.log('params in runTestSuite: ', params)
        runTestSuite(params).then(res => {
        console.log(res.message)
        }).catch(err => {
          this.$message.error(err.message)
        })
      }
    },
    handleAdd () {
      this.mdl = null
      this.visible = true
    },
    handleEdit (record) {
      this.visible = true
      this.mdl = { ...record }
    },
    handleOk () {
      const form = this.$refs.createModal.form
      this.confirmLoading = true
      form.validateFields((errors, values) => {
        if (!errors) {
          console.log('values', values)
          if (values.id > 0) {
            // 修改 e.g.
            new Promise((resolve, reject) => {
              setTimeout(() => {
                resolve()
              }, 1000)
            }).then(res => {
              this.visible = false
              this.confirmLoading = false
              // 重置表单数据
              form.resetFields()
              // 刷新表格
              this.$refs.table.refresh()

              this.$message.info('修改成功')
            })
          } else {
            // 新增
            new Promise((resolve, reject) => {
              setTimeout(() => {
                resolve()
              }, 1000)
            }).then(res => {
              this.visible = false
              this.confirmLoading = false
              // 重置表单数据
              form.resetFields()
              // 刷新表格
              this.$refs.table.refresh()

              this.$message.info('新增成功')
            })
          }
        } else {
          this.confirmLoading = false
        }
      })
    },
    handleCancel () {
      this.visible = false

      const form = this.$refs.createModal.form
      form.resetFields() // 清理表单数据（可不做）
    },
    handleSub (record) {
      if (record.status !== 0) {
        this.$message.info(`${record.no} 订阅成功`)
      } else {
        this.$message.error(`${record.no} 订阅失败，规则已关闭`)
      }
    },
    onSelectChange (selectedRowKeys, selectedRows) {
      console.log('selectedRowKeys: ', selectedRowKeys)
      console.log('selectedRows: ', selectedRows)
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    toggleAdvanced () {
      this.advanced = !this.advanced
    },
    resetSearchForm () {
      this.queryParam = {
        date: moment(new Date())
      }
    }
  }
}
</script>
