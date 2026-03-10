import { useState } from 'react'
import { Steps, Button, Form, Input, Select, Upload, Card, message } from 'antd'
import { UploadOutlined, RocketOutlined } from '@ant-design/icons'
import './Wizard.css'

const { Option } = Select
const { TextArea } = Input

function Wizard() {
  const [current, setCurrent] = useState(0)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const steps = [
    { title: '系统信息', description: '填写系统基本信息' },
    { title: 'API 配置', description: '配置 API 连接' },
    { title: '导入文档', description: '导入 API 文档' },
    { title: 'AI 分析', description: '智能分析 API' },
    { title: '功能选择', description: '选择业务场景' },
    { title: '代码生成', description: '生成适配代码' },
    { title: '测试部署', description: '测试并部署' },
  ]

  const handleNext = async () => {
    if (current < steps.length - 1) {
      setLoading(true)
      
      // 模拟处理
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setLoading(false)
      setCurrent(current + 1)
      message.success('步骤完成')
    }
  }

  const handlePrev = () => {
    if (current > 0) {
      setCurrent(current - 1)
    }
  }

  const renderStepContent = () => {
    switch (current) {
      case 0:
        return (
          <Card className="step-card">
            <Form form={form} layout="vertical">
              <Form.Item
                name="systemName"
                label="系统名称"
                rules={[{ required: true, message: '请输入系统名称' }]}
              >
                <Input placeholder="例如：自然 ERP" />
              </Form.Item>

              <Form.Item
                name="systemType"
                label="系统类型"
                rules={[{ required: true, message: '请选择系统类型' }]}
              >
                <Select placeholder="选择系统类型">
                  <Option value="erp">ERP（企业资源计划）</Option>
                  <Option value="crm">CRM（客户关系管理）</Option>
                  <Option value="oa">OA（办公自动化）</Option>
                  <Option value="im">IM（即时通讯）</Option>
                  <Option value="custom">自定义</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="description"
                label="系统描述"
              >
                <TextArea rows={4} placeholder="简要描述系统的功能..." />
              </Form.Item>
            </Form>
          </Card>
        )

      case 1:
        return (
          <Card className="step-card">
            <Form form={form} layout="vertical">
              <Form.Item
                name="apiUrl"
                label="API 基础地址"
                rules={[
                  { required: true, message: '请输入 API 地址' },
                  { type: 'url', message: '请输入有效的 URL' }
                ]}
              >
                <Input placeholder="https://api.example.com/v1" />
              </Form.Item>

              <Form.Item
                name="authType"
                label="认证方式"
                rules={[{ required: true, message: '请选择认证方式' }]}
              >
                <Select placeholder="选择认证方式">
                  <Option value="api_key">API Key</Option>
                  <Option value="oauth">OAuth 2.0</Option>
                  <Option value="basic">Basic Auth</Option>
                  <Option value="custom">自定义 Header</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="apiKey"
                label="API Key"
                rules={[{ required: true, message: '请输入 API Key' }]}
              >
                <Input.Password placeholder="sk-xxxx-xxxx" />
              </Form.Item>

              <Button type="default" icon={<RocketOutlined />}>
                测试连接
              </Button>
            </Form>
          </Card>
        )

      case 2:
        return (
          <Card className="step-card">
            <Form form={form} layout="vertical">
              <Form.Item
                name="importMethod"
                label="导入方式"
              >
                <Select defaultValue="swagger_url">
                  <Option value="swagger_url">Swagger URL（推荐）</Option>
                  <Option value="upload">上传文档</Option>
                  <Option value="manual">手动输入</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="swaggerUrl"
                label="Swagger URL"
              >
                <Input placeholder="https://api.example.com/swagger.json" />
              </Form.Item>

              <Upload>
                <Button icon={<UploadOutlined />}>上传 Swagger 文档</Button>
              </Upload>
            </Form>
          </Card>
        )

      case 3:
        return (
          <Card className="step-card">
            <div className="analysis-placeholder">
              <div className="analysis-icon">🤖</div>
              <h3>AI 正在分析 API 结构</h3>
              <p>识别业务场景、数据模型、接口关系...</p>
            </div>
          </Card>
        )

      case 4:
        return (
          <Card className="step-card">
            <div className="feature-selection">
              <h3>选择需要的业务功能</h3>
              <div className="feature-grid">
                {['订单管理', '客户管理', '库存管理', '报表统计'].map((feature, index) => (
                  <div key={index} className="feature-item">
                    <span className="feature-icon">◆</span>
                    <span className="feature-text">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )

      case 5:
        return (
          <Card className="step-card">
            <div className="generation-placeholder">
              <div className="generation-icon">⚡</div>
              <h3>代码生成中...</h3>
              <p>正在生成适配器代码和 Skills</p>
            </div>
          </Card>
        )

      case 6:
        return (
          <Card className="step-card">
            <div className="deployment-placeholder">
              <div className="deployment-icon">🚀</div>
              <h3>准备部署</h3>
              <p>测试通过后一键部署到生产环境</p>
              <Button type="primary" size="large" icon={<RocketOutlined />}>
                开始部署
              </Button>
            </div>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="wizard-page">
      {/* 步骤条 */}
      <div className="steps-wrapper">
        <Steps current={current} items={steps} />
      </div>

      {/* 内容区 */}
      <div className="wizard-content">
        {renderStepContent()}
      </div>

      {/* 操作按钮 */}
      <div className="wizard-actions">
        <Button
          onClick={handlePrev}
          disabled={current === 0}
        >
          上一步
        </Button>
        
        <Button
          type="primary"
          onClick={handleNext}
          loading={loading}
          disabled={current === steps.length - 1}
        >
          下一步
        </Button>
      </div>
    </div>
  )
}

export default Wizard
