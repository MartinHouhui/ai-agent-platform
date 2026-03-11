import { useState, useEffect } from 'react'
import { Button, Table, Tag, Space, Modal, Form, Input, Select, message, Badge } from 'antd'
import { PlusOutlined, ApiOutlined, SyncOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { TableSkeleton } from './Skeletons'
import './Adapters.css'

const { Option } = Select
const { TextArea } = Input

function Adapters() {
  const [adapters, setAdapters] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [testingId, setTestingId] = useState(null)
  const [discoveringId, setDiscoveringId] = useState(null)

  // 模拟初始数据加载
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      // 模拟 API 调用延迟
      await new Promise(resolve => setTimeout(resolve, 600))
      setAdapters([
        {
          id: 1,
          name: 'natural-erp',
          type: 'ERP',
          apiUrl: 'https://erp.natural.com/api',
          status: 'online',
          lastSync: '2026-03-10 12:30:00',
        },
        {
          id: 2,
          name: 'company-crm',
          type: 'CRM',
          apiUrl: 'https://crm.company.com/api',
          status: 'offline',
          lastSync: '2026-03-09 18:20:00',
        },
      ])
      setLoading(false)
    }
    loadData()
  }, [])

  const handleAdd = () => {
    form.resetFields()
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      const values = await form.validateFields()
      
      // 模拟 API 调用延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newAdapter = {
        id: Date.now(),
        ...values,
        status: 'offline',
        lastSync: '-',
      }
      setAdapters([...adapters, newAdapter])
      message.success('适配器创建成功')
      setModalVisible(false)
    } catch (error) {
      // 验证失败
      if (error.errorFields) {
        message.error('请检查表单填写')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleTest = async (adapter) => {
    setTestingId(adapter.id)
    const hide = message.loading(`测试连接 ${adapter.name}...`, 0)
    
    // 模拟测试
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    hide()
    setTestingId(null)
    
    // 模拟测试结果（70% 成功率）
    const success = Math.random() > 0.3
    if (success) {
      message.success(`${adapter.name} 连接成功`)
      // 更新状态为在线
      setAdapters(adapters.map(a => 
        a.id === adapter.id ? { ...a, status: 'online' } : a
      ))
    } else {
      message.error(`${adapter.name} 连接失败`)
    }
  }

  const handleDiscover = async (adapter) => {
    setDiscoveringId(adapter.id)
    const hide = message.loading(`发现 ${adapter.name} 的 API...`, 0)
    
    // 模拟发现过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    hide()
    setDiscoveringId(null)
    
    Modal.success({
      title: 'API 发现完成',
      content: (
        <div>
          <p>已发现 <strong>{adapter.name}</strong> 的以下 API：</p>
          <ul>
            <li>GET /api/orders - 查询订单</li>
            <li>POST /api/orders - 创建订单</li>
            <li>GET /api/products - 查询产品</li>
            <li>PUT /api/products/:id - 更新产品</li>
          </ul>
        </div>
      ),
    })
  }

  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个适配器吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        setAdapters(adapters.filter(a => a.id !== id))
        message.success('删除成功')
      }
    })
  }

  const columns = [
    {
      title: '适配器名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <ApiOutlined />
          <span className="adapter-name">{text}</span>
        </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const colors = {
          ERP: 'green',
          CRM: 'blue',
          OA: 'orange',
          IM: 'purple',
        }
        return <Tag color={colors[type] || 'default'}>{type}</Tag>
      }
    },
    {
      title: 'API 地址',
      dataIndex: 'apiUrl',
      key: 'apiUrl',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge
          status={status === 'online' ? 'success' : 'error'}
          text={status === 'online' ? '在线' : '离线'}
        />
      )
    },
    {
      title: '最后同步',
      dataIndex: 'lastSync',
      key: 'lastSync',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<SyncOutlined spin={testingId === record.id} />}
            onClick={() => handleTest(record)}
            disabled={testingId === record.id}
          >
            {testingId === record.id ? '测试中...' : '测试'}
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleDiscover(record)}
            disabled={discoveringId === record.id}
            loading={discoveringId === record.id}
          >
            {discoveringId === record.id ? '发现中...' : '发现'}
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div className="adapters-page">
      {/* 头部 */}
      <div className="page-header">
        <div className="header-info">
          <h2>适配器管理</h2>
          <p>管理业务系统适配器</p>
        </div>
        <Space>
          <Button icon={<SyncOutlined />}>
            刷新
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            className="add-button"
          >
            添加适配器
          </Button>
        </Space>
      </div>

      {/* 表格 */}
      <div className="table-wrapper">
        {loading ? (
          <TableSkeleton />
        ) : (
          <Table
            dataSource={adapters}
            columns={columns}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 个适配器`
            }}
          />
        )}
      </div>

      {/* 添加 Modal */}
      <Modal
        title="添加适配器"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
        okText="创建"
        cancelText="取消"
        confirmLoading={submitting}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="适配器名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder="例如：natural-erp" />
          </Form.Item>

          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select placeholder="选择类型">
              <Option value="ERP">ERP</Option>
              <Option value="CRM">CRM</Option>
              <Option value="OA">OA</Option>
              <Option value="IM">IM</Option>
              <Option value="Custom">自定义</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="apiUrl"
            label="API 基础地址"
            rules={[
              { required: true, message: '请输入 API 地址' },
              { type: 'url', message: '请输入有效的 URL' }
            ]}
          >
            <Input placeholder="https://api.example.com" />
          </Form.Item>

          <Form.Item
            name="authType"
            label="认证方式"
          >
            <Select placeholder="选择认证方式">
              <Option value="api_key">API Key</Option>
              <Option value="oauth">OAuth 2.0</Option>
              <Option value="basic">Basic Auth</Option>
              <Option value="none">无认证</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="apiKey"
            label="API Key"
          >
            <Input.Password placeholder="输入 API Key" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={3} placeholder="描述这个适配器的用途..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Adapters
