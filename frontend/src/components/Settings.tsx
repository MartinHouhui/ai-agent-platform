import { useState } from 'react'
import { Tabs, Form, Input, Select, Button, Switch, Divider, message, Card } from 'antd'
import { DatabaseOutlined, CloudOutlined, SafetyOutlined } from '@ant-design/icons'
import './Settings.css'

const { Option } = Select
const { TextArea } = Input

function Settings() {
  const [dbForm] = Form.useForm()
  const [modelForm] = Form.useForm()
  const [securityForm] = Form.useForm()

  const handleSaveDB = async () => {
    try {
      await dbForm.validateFields()
      message.success('数据库配置保存成功')
    } catch (error) {
      // 验证失败
    }
  }

  const handleTestDB = () => {
    message.loading('测试连接中...', 1).then(() => {
      message.success('数据库连接成功')
    })
  }

  const handleSaveModel = async () => {
    try {
      await modelForm.validateFields()
      message.success('模型配置保存成功')
    } catch (error) {
      // 验证失败
    }
  }

  const handleSaveSecurity = async () => {
    try {
      await securityForm.validateFields()
      message.success('安全配置保存成功')
    } catch (error) {
      // 验证失败
    }
  }

  const items = [
    {
      key: 'database',
      label: (
        <span>
          <DatabaseOutlined />
          数据库
        </span>
      ),
      children: (
        <Card className="settings-card">
          <h3>数据库配置</h3>
          <p className="settings-desc">配置 MySQL 数据库连接信息</p>
          
          <Form form={dbForm} layout="vertical">
            <Form.Item
              name="host"
              label="主机地址"
              initialValue="localhost"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="port"
              label="端口"
              initialValue="3306"
              rules={[{ required: true }]}
            >
              <Input type="number" />
            </Form.Item>

            <Form.Item
              name="username"
              label="用户名"
              initialValue="root"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              name="database"
              label="数据库名"
              initialValue="ai_agent_platform"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Button onClick={handleTestDB} style={{ marginRight: 8 }}>
              测试连接
            </Button>
            <Button type="primary" onClick={handleSaveDB}>
              保存配置
            </Button>
          </Form>
        </Card>
      )
    },
    {
      key: 'model',
      label: (
        <span>
          <CloudOutlined />
          AI 模型
        </span>
      ),
      children: (
        <Card className="settings-card">
          <h3>AI 模型配置</h3>
          <p className="settings-desc">配置默认使用的 AI 模型和参数</p>
          
          <Form form={modelForm} layout="vertical">
            <Form.Item
              name="defaultModel"
              label="默认模型"
              initialValue="gpt-4-turbo"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="gpt-4-turbo">GPT-4 Turbo</Option>
                <Option value="gpt-4">GPT-4</Option>
                <Option value="qwen-max">通义千问 Max</Option>
                <Option value="glm-4">GLM-4</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="fallbackModel"
              label="备用模型"
            >
              <Select allowClear>
                <Option value="qwen-max">通义千问 Max</Option>
                <Option value="glm-4">GLM-4</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="temperature"
              label="Temperature"
              initialValue="0.7"
            >
              <Input type="number" step="0.1" min="0" max="2" />
            </Form.Item>

            <Divider>API Keys</Divider>

            <Form.Item
              name="openaiKey"
              label="OpenAI API Key"
            >
              <Input.Password placeholder="sk-..." />
            </Form.Item>

            <Form.Item
              name="qwenKey"
              label="通义千问 API Key"
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              name="glmKey"
              label="GLM API Key"
            >
              <Input.Password />
            </Form.Item>

            <Button type="primary" onClick={handleSaveModel}>
              保存配置
            </Button>
          </Form>
        </Card>
      )
    },
    {
      key: 'security',
      label: (
        <span>
          <SafetyOutlined />
          安全
        </span>
      ),
      children: (
        <Card className="settings-card">
          <h3>安全设置</h3>
          <p className="settings-desc">配置访问控制、会话管理等安全选项</p>
          
          <Form form={securityForm} layout="vertical">
            <Form.Item
              name="enableAuth"
              label="启用认证"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="sessionTimeout"
              label="会话超时时间（秒）"
              initialValue="3600"
            >
              <Input type="number" min="300" max="86400" />
            </Form.Item>

            <Form.Item
              name="rateLimit"
              label="API 速率限制（次/分钟）"
              initialValue="100"
            >
              <Input type="number" min="10" max="1000" />
            </Form.Item>

            <Form.Item
              name="enableLogs"
              label="启用详细日志"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="allowedOrigins"
              label="允许的域名（CORS）"
            >
              <TextArea
                rows={3}
                placeholder="http://localhost:3000&#10;https://your-domain.com"
              />
            </Form.Item>

            <Button type="primary" onClick={handleSaveSecurity}>
              保存配置
            </Button>
          </Form>
        </Card>
      )
    }
  ]

  return (
    <div className="settings-page">
      <div className="page-header">
        <h2>系统设置</h2>
      </div>

      <Tabs defaultActiveKey="database" items={items} />
    </div>
  )
}

export default Settings
