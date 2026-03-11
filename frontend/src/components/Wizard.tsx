import { useState } from 'react'
import { 
  Steps, Button, Form, Input, Select, Upload, Card, message, 
  Progress, Alert, Divider, Tag, Space, Tooltip, Collapse, Empty 
} from 'antd'
import { 
  UploadOutlined, RocketOutlined, InfoCircleOutlined,
  CheckCircleOutlined, LoadingOutlined, ApiOutlined,
  DatabaseOutlined, CloudOutlined, CodeOutlined, ThunderboltOutlined
} from '@ant-design/icons'
import './Wizard.css'

const { Option } = Select
const { TextArea } = Input
const { Panel } = Collapse

function Wizard() {
  const [current, setCurrent] = useState(0)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [analyzeProgress, setAnalyzeProgress] = useState(0)
  const [generatedCode, setGeneratedCode] = useState('')

  const steps = [
    { 
      title: '系统信息', 
      icon: <DatabaseOutlined />,
      description: '配置目标系统基本信息'
    },
    { 
      title: 'API 配置', 
      icon: <ApiOutlined />,
      description: '设置 API 连接参数'
    },
    { 
      title: '导入文档', 
      icon: <CloudOutlined />,
      description: '导入或发现 API 文档'
    },
    { 
      title: 'AI 分析', 
      icon: <ThunderboltOutlined />,
      description: '智能分析业务场景'
    },
    { 
      title: '功能选择', 
      icon: <CheckCircleOutlined />,
      description: '选择需要的业务功能'
    },
    { 
      title: '代码生成', 
      icon: <CodeOutlined />,
      description: '生成适配器代码'
    },
    { 
      title: '测试部署', 
      icon: <RocketOutlined />,
      description: '测试并部署到生产环境'
    },
  ]

  const handleNext = async () => {
    if (current === 3) {
      // AI 分析步骤，显示进度
      setLoading(true)
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200))
        setAnalyzeProgress(i)
      }
      setLoading(false)
      setCurrent(current + 1)
      message.success('分析完成')
    } else if (current === 5) {
      // 代码生成步骤
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1500))
      setGeneratedCode(generateSampleCode())
      setLoading(false)
      setCurrent(current + 1)
      message.success('代码生成完成')
    } else if (current < steps.length - 1) {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 300))
      setLoading(false)
      setCurrent(current + 1)
      message.success('步骤完成')
    }
  }

  const handlePrev = () => {
    if (current > 0) {
      setCurrent(current - 1)
      setAnalyzeProgress(0)
    }
  }

  const generateSampleCode = () => {
    return `// 自动生成的适配器代码
class BusinessSystemAdapter {
  constructor(config) {
    this.baseUrl = config.apiUrl;
    this.apiKey = config.apiKey;
  }

  async queryOrders(params) {
    const response = await fetch(\`\${this.baseUrl}/orders\`, {
      method: 'GET',
      headers: {
        'Authorization': \`Bearer \${this.apiKey}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });
    return response.json();
  }

  async createOrder(orderData) {
    // 创建订单逻辑
  }
}`
  }

  const renderStepContent = () => {
    switch (current) {
      case 0:
        return (
          <div className="step-content">
            <div className="step-header">
              <h2>📋 系统信息</h2>
              <p className="step-desc">请填写目标业务系统的基本信息，这将帮助 AI 更好地理解系统特性</p>
            </div>

            <Card className="form-card">
              <Alert
                message="提示"
                description="准确填写系统信息可以帮助 AI 生成更合适的适配器代码"
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />

              <Form form={form} layout="vertical">
                <Form.Item
                  name="systemName"
                  label={
                    <span>
                      系统名称 
                      <Tooltip title="给系统起个名字，方便识别">
                        <InfoCircleOutlined style={{ marginLeft: 8, color: '#999' }} />
                      </Tooltip>
                    </span>
                  }
                  rules={[{ required: true, message: '请输入系统名称' }]}
                >
                  <Input placeholder="例如：自然 ERP、公司 CRM" size="large" />
                </Form.Item>

                <Form.Item
                  name="systemType"
                  label={
                    <span>
                      系统类型
                      <Tooltip title="选择最符合的系统类型">
                        <InfoCircleOutlined style={{ marginLeft: 8, color: '#999' }} />
                      </Tooltip>
                    </span>
                  }
                  rules={[{ required: true, message: '请选择系统类型' }]}
                >
                  <Select placeholder="选择系统类型" size="large">
                    <Option value="erp">
                      <Space>
                        <Tag color="green">ERP</Tag>
                        企业资源计划
                      </Space>
                    </Option>
                    <Option value="crm">
                      <Space>
                        <Tag color="blue">CRM</Tag>
                        客户关系管理
                      </Space>
                    </Option>
                    <Option value="oa">
                      <Space>
                        <Tag color="orange">OA</Tag>
                        办公自动化
                      </Space>
                    </Option>
                    <Option value="im">
                      <Space>
                        <Tag color="purple">IM</Tag>
                        即时通讯
                      </Space>
                    </Option>
                    <Option value="custom">
                      <Space>
                        <Tag>自定义</Tag>
                        其他类型
                      </Space>
                    </Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="vendor"
                  label="系统厂商（可选）"
                >
                  <Input placeholder="例如：SAP、Oracle、用友、金蝶" size="large" />
                </Form.Item>

                <Form.Item
                  name="description"
                  label="系统描述"
                >
                  <TextArea 
                    rows={4} 
                    placeholder="简要描述系统的主要功能和业务场景..."
                    showCount
                    maxLength={500}
                  />
                </Form.Item>
              </Form>
            </Card>
          </div>
        )

      case 1:
        return (
          <div className="step-content">
            <div className="step-header">
              <h2>🔌 API 配置</h2>
              <p className="step-desc">配置 API 连接参数，确保能够正常访问业务系统的接口</p>
            </div>

            <Card className="form-card">
              <Alert
                message="安全提示"
                description="API Key 仅用于本地配置，不会被上传到服务器"
                type="success"
                showIcon
                style={{ marginBottom: 24 }}
              />

              <Form form={form} layout="vertical">
                <Form.Item
                  name="apiUrl"
                  label="API 基础地址"
                  rules={[
                    { required: true, message: '请输入 API 地址' },
                    { type: 'url', message: '请输入有效的 URL' }
                  ]}
                >
                  <Input 
                    placeholder="https://api.example.com/v1" 
                    size="large"
                    prefix={<ApiOutlined />}
                  />
                </Form.Item>

                <Form.Item
                  name="authType"
                  label="认证方式"
                  rules={[{ required: true, message: '请选择认证方式' }]}
                >
                  <Select placeholder="选择认证方式" size="large">
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
                  <Input.Password 
                    placeholder="输入 API Key" 
                    size="large"
                  />
                </Form.Item>

                <Divider />

                <Form.Item
                  name="timeout"
                  label="超时时间（秒）"
                  initialValue={30}
                >
                  <Input type="number" min={5} max={300} size="large" />
                </Form.Item>

                <Form.Item>
                  <Button 
                    type="default" 
                    icon={<RocketOutlined />}
                    size="large"
                  >
                    测试连接
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </div>
        )

      case 2:
        return (
          <div className="step-content">
            <div className="step-header">
              <h2>📚 导入 API 文档</h2>
              <p className="step-desc">导入 API 文档或让 AI 自动发现系统接口</p>
            </div>

            <Card className="form-card">
              <Collapse defaultActiveKey={['1']} bordered={false}>
                <Panel 
                  header={
                    <span>
                      <Tag color="green">推荐</Tag>
                      方式 1: 导入 Swagger/OpenAPI 文档
                    </span>
                  }
                  key="1"
                >
                  <Form form={form} layout="vertical">
                    <Form.Item
                      name="swaggerUrl"
                      label="Swagger URL"
                    >
                      <Input 
                        placeholder="https://api.example.com/swagger.json" 
                        size="large"
                      />
                    </Form.Item>
                    <Button type="primary">解析文档</Button>
                  </Form>
                </Panel>

                <Panel 
                  header="方式 2: 上传文档文件" 
                  key="2"
                >
                  <Upload.Dragger>
                    <p className="ant-upload-drag-icon">
                      <UploadOutlined />
                    </p>
                    <p className="ant-upload-text">点击或拖拽文件到此区域</p>
                    <p className="ant-upload-hint">
                      支持 JSON、YAML、Markdown 格式
                    </p>
                  </Upload.Dragger>
                </Panel>

                <Panel 
                  header="方式 3: AI 自动发现" 
                  key="3"
                >
                  <Alert
                    message="AI 将自动探索系统 API"
                    description="基于已配置的 API 地址和认证信息，AI 会尝试发现可用的接口"
                    type="info"
                    showIcon
                  />
                  <Button type="primary" style={{ marginTop: 16 }}>
                    开始发现
                  </Button>
                </Panel>
              </Collapse>
            </Card>
          </div>
        )

      case 3:
        return (
          <div className="step-content">
            <div className="step-header">
              <h2>🤖 AI 智能分析</h2>
              <p className="step-desc">AI 正在分析 API 结构，识别业务场景和数据模型</p>
            </div>

            <Card className="analysis-card">
              {loading ? (
                <div className="analysis-loading">
                  <LoadingOutlined style={{ fontSize: 48, color: '#2D3A2E' }} />
                  <h3>AI 分析中...</h3>
                  <Progress 
                    percent={analyzeProgress} 
                    status="active"
                    strokeColor="#2D3A2E"
                  />
                  <div className="analysis-tasks">
                    <p><CheckCircleOutlined /> 解析 API 端点结构</p>
                    <p><CheckCircleOutlined /> 识别数据模型</p>
                    <p><LoadingOutlined /> 分析业务场景</p>
                    <p>生成推荐配置</p>
                  </div>
                </div>
              ) : (
                <div className="analysis-result">
                  <Empty description="点击【下一步】开始 AI 分析" />
                </div>
              )}
            </Card>
          </div>
        )

      case 4:
        return (
          <div className="step-content">
            <div className="step-header">
              <h2>✅ 选择业务功能</h2>
              <p className="step-desc">根据 AI 分析结果，选择需要对接的业务场景</p>
            </div>

            <Card className="form-card">
              <Alert
                message="发现 4 个主要业务场景"
                description="建议先对接核心功能，后续可随时添加"
                type="success"
                showIcon
                style={{ marginBottom: 24 }}
              />

              <div className="feature-grid">
                {[
                  { 
                    icon: '📦', 
                    name: '订单管理', 
                    desc: '查询、创建、更新订单',
                    apis: 12,
                    checked: true
                  },
                  { 
                    icon: '👥', 
                    name: '客户管理', 
                    desc: '客户信息、联系人管理',
                    apis: 8,
                    checked: true
                  },
                  { 
                    icon: '📊', 
                    name: '报表统计', 
                    desc: '销售报表、库存报表',
                    apis: 5,
                    checked: false
                  },
                  { 
                    icon: '🏪', 
                    name: '库存管理', 
                    desc: '库存查询、预警、调拨',
                    apis: 6,
                    checked: false
                  },
                ].map((feature, index) => (
                  <div 
                    key={index}
                    className={`feature-card ${feature.checked ? 'checked' : ''}`}
                  >
                    <div className="feature-icon">{feature.icon}</div>
                    <div className="feature-info">
                      <h4>{feature.name}</h4>
                      <p>{feature.desc}</p>
                      <Tag>{feature.apis} 个 API</Tag>
                    </div>
                    <div className="feature-check">
                      {feature.checked && <CheckCircleOutlined />}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )

      case 5:
        return (
          <div className="step-content">
            <div className="step-header">
              <h2>⚡ 代码生成</h2>
              <p className="step-desc">基于选择的功能，自动生成适配器代码和 Skills</p>
            </div>

            <Card className="form-card">
              {loading ? (
                <div className="generating">
                  <LoadingOutlined style={{ fontSize: 48, color: '#2D3A2E' }} />
                  <h3>代码生成中...</h3>
                  <Progress 
                    percent={80} 
                    status="active"
                    strokeColor="#2D3A2E"
                  />
                </div>
              ) : generatedCode ? (
                <div className="generated-code">
                  <Alert
                    message="代码生成完成"
                    description="已生成适配器代码和 3 个 Skills"
                    type="success"
                    showIcon
                    style={{ marginBottom: 24 }}
                  />

                  <div className="code-preview">
                    <div className="code-header">
                      <span>BusinessSystemAdapter.ts</span>
                      <Button size="small">复制</Button>
                    </div>
                    <pre className="code-content">
                      {generatedCode}
                    </pre>
                  </div>

                  <Divider />

                  <h4>生成的 Skills:</h4>
                  <Space wrap>
                    <Tag color="green">查询订单</Tag>
                    <Tag color="blue">创建订单</Tag>
                    <Tag color="orange">更新订单</Tag>
                  </Space>
                </div>
              ) : (
                <Empty description="点击【下一步】生成代码" />
              )}
            </Card>
          </div>
        )

      case 6:
        return (
          <div className="step-content">
            <div className="step-header">
              <h2>🚀 测试 & 部署</h2>
              <p className="step-desc">测试生成的代码，然后一键部署到生产环境</p>
            </div>

            <Card className="form-card">
              <div className="deployment-ready">
                <div className="ready-icon">🎉</div>
                <h2>准备就绪！</h2>
                <p>所有配置已完成，可以开始测试和部署</p>

                <Divider />

                <div className="test-results">
                  <h4>测试结果</h4>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div className="test-item success">
                      <CheckCircleOutlined />
                      <span>API 连接测试</span>
                      <Tag color="success">通过</Tag>
                    </div>
                    <div className="test-item success">
                      <CheckCircleOutlined />
                      <span>认证测试</span>
                      <Tag color="success">通过</Tag>
                    </div>
                    <div className="test-item success">
                      <CheckCircleOutlined />
                      <span>数据格式验证</span>
                      <Tag color="success">通过</Tag>
                    </div>
                  </Space>
                </div>

                <Divider />

                <Space size="large">
                  <Button size="large">
                    运行测试
                  </Button>
                  <Button type="primary" size="large" icon={<RocketOutlined />}>
                    立即部署
                  </Button>
                </Space>
              </div>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="wizard-page">
      {/* 进度指示器 */}
      <div className="wizard-progress">
        <Progress 
          percent={Math.round((current / (steps.length - 1)) * 100)} 
          strokeColor="#2D3A2E"
          trailColor="#E8E4DE"
        />
      </div>

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
          size="large"
        >
          上一步
        </Button>
        
        <Button
          type="primary"
          onClick={handleNext}
          loading={loading}
          disabled={current === steps.length - 1}
          size="large"
        >
          {current === steps.length - 2 ? '生成代码' : '下一步'}
        </Button>
      </div>
    </div>
  )
}

export default Wizard
