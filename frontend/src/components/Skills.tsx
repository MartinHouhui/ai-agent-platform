import { useState } from 'react'
import { Button, Table, Tag, Space, Modal, Form, Input, Select, message } from 'antd'
import { PlusOutlined, PlayCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import './Skills.css'

const { TextArea } = Input
const { Option } = Select

function Skills() {
  const [skills, setSkills] = useState([
    {
      id: 1,
      name: '查询订单',
      type: 'code',
      status: 'active',
      usageCount: 128,
      successRate: 95,
      createdAt: '2026-03-09',
    },
    {
      id: 2,
      name: '创建订单',
      type: 'code',
      status: 'active',
      usageCount: 56,
      successRate: 92,
      createdAt: '2026-03-09',
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
      const newSkill = {
        id: Date.now(),
        ...values,
        status: 'active',
        usageCount: 0,
        successRate: 100,
        createdAt: new Date().toISOString().split('T')[0],
      }
      setSkills([...skills, newSkill])
      message.success('Skill 创建成功')
      setModalVisible(false)
    } catch (error) {
      // 表单验证失败
    }
  }

  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个 Skill 吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        setSkills(skills.filter(s => s.id !== id))
        message.success('删除成功')
      }
    })
  }

  const handleTest = (skill) => {
    message.info(`测试 Skill: ${skill.name}`)
  }

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span className="skill-name">{text}</span>
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'code' ? 'green' : 'blue'}>
          {type === 'code' ? '代码' : '提示词'}
        </Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'success' : 'default'}>
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      )
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      key: 'usageCount',
      sorter: (a, b) => a.usageCount - b.usageCount
    },
    {
      title: '成功率',
      dataIndex: 'successRate',
      key: 'successRate',
      render: (rate) => `${rate}%`,
      sorter: (a, b) => a.successRate - b.successRate
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={() => handleTest(record)}
          >
            测试
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
    <div className="skills-page">
      {/* 头部 */}
      <div className="page-header">
        <div className="header-info">
          <h2>Skills 管理</h2>
          <p>管理和配置业务技能</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          className="add-button"
        >
          新建 Skill
        </Button>
      </div>

      {/* 表格 */}
      <div className="table-wrapper">
        <Table
          dataSource={skills}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 个 Skills`
          }}
        />
      </div>

      {/* 新建 Modal */}
      <Modal
        title="新建 Skill"
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
            label="Skill 名称"
            rules={[{ required: true, message: '请输入名称' }]}
          >
            <Input placeholder="例如：查询订单" />
          </Form.Item>

          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select placeholder="选择类型">
              <Option value="code">代码执行</Option>
              <Option value="prompt">提示词模板</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={3} placeholder="描述这个 Skill 的功能" />
          </Form.Item>

          <Form.Item
            name="code"
            label="执行代码"
            rules={[{ required: true, message: '请输入代码' }]}
          >
            <TextArea
              rows={8}
              placeholder="async function execute(params, { adapters, logger }) {
  // 你的代码
  return { success: true, data: {} }
}"
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Skills
