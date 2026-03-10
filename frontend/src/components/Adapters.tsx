import { useState } from 'react'
import { Button, Table, Tag, Space, Modal, Form, Input, Select, message, Badge } from 'antd'
import { PlusOutlined, ApiOutlined, SyncOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import './Adapters.css'

const { Option } = Select
const { TextArea } = Input

function Adapters() {
  const [adapters, setAdapters] = useState([
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

  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  const handleAdd = () => {
    form.resetFields()
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
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
    }
  }

  const handleTest = (adapter) => {
    message.loading(`测试连接 ${adapter.name}...`, 1).then(() => {
      message.success('连接成功')
    })
  }

  const handleDiscover = (adapter) => {
    message.loading(`发现 ${adapter.name} 的 API...`, 2).then(() => {
      message.success('API 发现完成')
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
            icon={<SyncOutlined />}
            onClick={() => handleTest(record)}
          >
            测试
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleDiscover(record)}
          >
            发现
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
