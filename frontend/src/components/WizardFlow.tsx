import React, { useState, useEffect } from 'react';
import {
  Steps,
  Card,
  Form,
  Input,
  Select,
  Button,
  Upload,
  message,
  Progress,
  Alert,
  Spin,
  Table,
  Checkbox,
} from 'antd';
import {
  UploadOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { wizardAPI } from '../services/api';
import type { WizardSession, BusinessFeature } from '../types';
import './WizardFlow.css';

const { Option } = Select;
const { TextArea } = Input;

const WizardFlow: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [sessionId, setSessionId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<WizardSession | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    startWizard();
  }, []);

  const startWizard = async () => {
    try {
      const response: any = await wizardAPI.start('user-' + Date.now());
      setSessionId(response.data.sessionId);
      message.success('向导已启动');
    } catch (error: any) {
      message.error('启动失败: ' + error.message);
    }
  };

  const steps = [
    {
      title: '系统信息',
      description: '填写系统基本信息',
    },
    {
      title: 'API 配置',
      description: '配置 API 连接',
    },
    {
      title: 'API 导入',
      description: '导入 API 文档',
    },
    {
      title: 'AI 分析',
      description: '智能分析 API',
    },
    {
      title: '功能选择',
      description: '选择业务场景',
    },
    {
      title: '代码生成',
      description: '生成适配代码',
    },
    {
      title: '测试部署',
      description: '测试并部署',
    },
  ];

  const handleNext = async () => {
    setLoading(true);
    try {
      switch (current) {
        case 0:
          await saveSystemInfo();
          break;
        case 1:
          await saveAPIConfig();
          break;
        case 2:
          await importAPI();
          break;
        case 3:
          await analyzeAPI();
          break;
        case 4:
          await selectFeatures();
          break;
        case 5:
          await generateCode();
          break;
        case 6:
          await testAndDeploy();
          break;
      }
      setCurrent(current + 1);
      message.success('步骤完成');
    } catch (error: any) {
      message.error('操作失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveSystemInfo = async () => {
    const values = await form.validateFields();
    await wizardAPI.saveSystemInfo(sessionId, values);
  };

  const saveAPIConfig = async () => {
    const values = await form.validateFields();
    await wizardAPI.saveAPIConfig(sessionId, values);
  };

  const importAPI = async () => {
    const values = await form.validateFields();
    await wizardAPI.importAPI(sessionId, values);
  };

  const analyzeAPI = async () => {
    message.loading('AI 分析中，请稍候...', 0);
    await wizardAPI.analyzeAPI(sessionId);
    message.destroy();
  };

  const selectFeatures = async () => {
    const features = session?.aiAnalysis?.suggestedFeatures || [];
    await wizardAPI.selectFeatures(sessionId, features);
  };

  const generateCode = async () => {
    message.loading('代码生成中...', 0);
    await wizardAPI.generateCode(sessionId);
    message.destroy();
  };

  const testAndDeploy = async () => {
    message.loading('测试中...', 0);
    await wizardAPI.runTests(sessionId);
    await wizardAPI.deploy(sessionId);
    message.destroy();
    message.success('🎉 部署成功！');
  };

  const renderStepContent = () => {
    switch (current) {
      case 0:
        return (
          <Card title="系统信息" className="step-card">
            <Form form={form} layout="vertical">
              <Form.Item
                name="name"
                label="系统名称"
                rules={[{ required: true, message: '请输入系统名称' }]}
              >
                <Input placeholder="例如：自然 ERP" />
              </Form.Item>

              <Form.Item
                name="type"
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

              <Form.Item name="description" label="系统描述">
                <TextArea rows={4} placeholder="简要描述系统的功能..." />
              </Form.Item>
            </Form>
          </Card>
        );

      case 1:
        return (
          <Card title="API 配置" className="step-card">
            <Form form={form} layout="vertical">
              <Form.Item
                name="baseUrl"
                label="API 基础地址"
                rules={[{ required: true, message: '请输入 API 地址' }]}
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

              <Button type="primary" icon={<RocketOutlined />}>
                测试连接
              </Button>
            </Form>
          </Card>
        );

      case 2:
        return (
          <Card title="API 文档导入" className="step-card">
            <Form form={form} layout="vertical">
              <Form.Item name="method" label="导入方式">
                <Select placeholder="选择导入方式" defaultValue="swagger_url">
                  <Option value="swagger_url">Swagger URL（推荐）</Option>
                  <Option value="upload">上传文档</Option>
                  <Option value="manual">手动输入</Option>
                </Select>
              </Form.Item>

              <Form.Item name="swaggerUrl" label="Swagger URL">
                <Input placeholder="https://api.example.com/swagger.json" />
              </Form.Item>

              <Upload>
                <Button icon={<UploadOutlined />}>上传 Swagger 文档</Button>
              </Upload>
            </Form>
          </Card>
        );

      case 3:
        return (
          <Card title="AI 智能分析" className="step-card">
            <Alert
              message="AI 将自动分析 API 结构，识别业务场景"
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Spin indicator={<LoadingOutlined spin />} size="large" />
                <p style={{ marginTop: 16 }}>AI 分析中...</p>
                <Progress percent={85} status="active" />
              </div>
            ) : (
              <div>
                <h4>识别到的业务场景：</h4>
                <ul>
                  <li>✓ 订单管理（15 个端点）</li>
                  <li>✓ 客户管理（10 个端点）</li>
                  <li>✓ 库存管理（8 个端点）</li>
                </ul>
                <p>置信度: 95%</p>
              </div>
            )}
          </Card>
        );

      case 4:
        return (
          <Card title="选择业务功能" className="step-card">
            <Checkbox.Group style={{ width: '100%' }}>
              <div style={{ marginBottom: 16 }}>
                <Checkbox value="order" defaultChecked>
                  <strong>订单管理</strong>
                  <br />
                  <small>查询订单、创建订单、更新订单状态</small>
                </Checkbox>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Checkbox value="customer" defaultChecked>
                  <strong>客户管理</strong>
                  <br />
                  <small>查询客户、创建客户、更新客户信息</small>
                </Checkbox>
              </div>
              <div style={{ marginBottom: 16 }}>
                <Checkbox value="inventory">
                  <strong>库存管理</strong>
                  <br />
                  <small>查询库存、库存预警、库存调拨</small>
                </Checkbox>
              </div>
            </Checkbox.Group>
          </Card>
        );

      case 5:
        return (
          <Card title="代码生成" className="step-card">
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Spin indicator={<LoadingOutlined spin />} size="large" />
                <p style={{ marginTop: 16 }}>代码生成中...</p>
              </div>
            ) : (
              <div>
                <CheckCircleOutlined
                  style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }}
                />
                <h3>✓ 适配器代码已生成</h3>
                <p>✓ 3 个 Skills 已生成</p>
                <p>✓ 12 个测试用例已生成</p>

                <div
                  style={{
                    background: '#f5f5f5',
                    padding: 16,
                    borderRadius: 4,
                    marginTop: 16,
                  }}
                >
                  <pre>
                    {`// NaturalERPAdapter.ts
class NaturalERPAdapter {
  async queryOrder(params) {
    // 查询订单
    return await this.get('/api/orders', params);
  }
}`}
                  </pre>
                </div>
              </div>
            )}
          </Card>
        );

      case 6:
        return (
          <Card title="测试 & 部署" className="step-card">
            <Alert
              message="测试结果: 12/12 通过 ✅"
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Table
              dataSource={[
                { key: '1', name: '查询订单列表', status: '通过', time: '120ms' },
                { key: '2', name: '创建订单', status: '通过', time: '180ms' },
                { key: '3', name: '更新订单', status: '通过', time: '110ms' },
              ]}
              columns={[
                { title: '测试用例', dataIndex: 'name' },
                { title: '状态', dataIndex: 'status' },
                { title: '耗时', dataIndex: 'time' },
              ]}
              pagination={false}
              size="small"
            />

            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Button
                type="primary"
                size="large"
                icon={<RocketOutlined />}
                onClick={handleNext}
                loading={loading}
              >
                🚀 一键部署
              </Button>
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="wizard-flow">
      <Steps current={current} items={steps} />

      <div className="wizard-content">{renderStepContent()}</div>

      <div className="wizard-actions">
        {current > 0 && (
          <Button onClick={() => setCurrent(current - 1)}>上一步</Button>
        )}
        {current < steps.length - 1 && (
          <Button
            type="primary"
            onClick={handleNext}
            loading={loading}
            style={{ marginLeft: 8 }}
          >
            下一步
          </Button>
        )}
      </div>
    </div>
  );
};

export default WizardFlow;
