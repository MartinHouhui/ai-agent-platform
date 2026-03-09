import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Divider,
  message,
  Tabs,
  Alert,
} from 'antd';
import {
  DatabaseOutlined,
  CloudOutlined,
  SafetyOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { TabsProps } from 'antd';
import './SettingsPage.css';

const { Option } = Select;
const { TextArea } = Input;

const SettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dbForm] = Form.useForm();
  const [modelForm] = Form.useForm();
  const [securityForm] = Form.useForm();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    // TODO: 从后端加载配置
    dbForm.setFieldsValue({
      host: 'localhost',
      port: 3306,
      username: 'root',
      database: 'ai_agent_platform',
    });

    modelForm.setFieldsValue({
      defaultModel: 'gpt-4-turbo',
      fallbackModel: 'qwen-max',
      temperature: 0.7,
      maxTokens: 2000,
    });

    securityForm.setFieldsValue({
      enableAuth: true,
      sessionTimeout: 3600,
      rateLimit: 100,
    });
  };

  const handleSaveDB = async () => {
    try {
      const values = await dbForm.validateFields();
      setLoading(true);
      // TODO: 保存到后端
      message.success('数据库配置保存成功');
    } catch (error: any) {
      message.error('保存失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setLoading(true);
      // TODO: 测试数据库连接
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('数据库连接成功');
    } catch (error: any) {
      message.error('连接失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveModel = async () => {
    try {
      const values = await modelForm.validateFields();
      setLoading(true);
      // TODO: 保存到后端
      message.success('模型配置保存成功');
    } catch (error: any) {
      message.error('保存失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecurity = async () => {
    try {
      const values = await securityForm.validateFields();
      setLoading(true);
      // TODO: 保存到后端
      message.success('安全配置保存成功');
    } catch (error: any) {
      message.error('保存失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const databaseSettings = (
    <Card title="数据库配置" className="settings-card">
      <Alert
        message="数据库配置"
        description="配置 MySQL 数据库连接信息。修改后需要重启服务。"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form form={dbForm} layout="vertical">
        <Form.Item
          name="host"
          label="主机地址"
          rules={[{ required: true, message: '请输入主机地址' }]}
        >
          <Input placeholder="localhost" />
        </Form.Item>

        <Form.Item
          name="port"
          label="端口"
          rules={[{ required: true, message: '请输入端口' }]}
        >
          <Input type="number" placeholder="3306" />
        </Form.Item>

        <Form.Item
          name="username"
          label="用户名"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input placeholder="root" />
        </Form.Item>

        <Form.Item
          name="password"
          label="密码"
        >
          <Input.Password placeholder="数据库密码" />
        </Form.Item>

        <Form.Item
          name="database"
          label="数据库名"
          rules={[{ required: true, message: '请输入数据库名' }]}
        >
          <Input placeholder="ai_agent_platform" />
        </Form.Item>

        <Button type="default" onClick={handleTestConnection} loading={loading} style={{ marginRight: 8 }}>
          测试连接
        </Button>
        <Button type="primary" onClick={handleSaveDB} loading={loading}>
          保存配置
        </Button>
      </Form>
    </Card>
  );

  const modelSettings = (
    <Card title="模型配置" className="settings-card">
      <Alert
        message="AI 模型配置"
        description="配置默认使用的 AI 模型和参数。支持 GPT-4、通义千问、GLM 等多个模型。"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form form={modelForm} layout="vertical">
        <Form.Item
          name="defaultModel"
          label="默认模型"
          rules={[{ required: true }]}
        >
          <Select placeholder="选择默认模型">
            <Option value="gpt-4-turbo">GPT-4 Turbo (推荐)</Option>
            <Option value="gpt-4">GPT-4</Option>
            <Option value="qwen-max">通义千问 Max</Option>
            <Option value="glm-4">GLM-4</Option>
            <Option value="claude-3-opus">Claude 3 Opus</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="fallbackModel"
          label="备用模型"
        >
          <Select placeholder="选择备用模型">
            <Option value="qwen-max">通义千问 Max</Option>
            <Option value="glm-4">GLM-4</Option>
            <Option value="gpt-3.5-turbo">GPT-3.5 Turbo</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="temperature"
          label="Temperature (创造性)"
        >
          <Input type="number" min={0} max={2} step={0.1} placeholder="0.7" />
        </Form.Item>

        <Form.Item
          name="maxTokens"
          label="最大 Token 数"
        >
          <Input type="number" min={100} max={4000} placeholder="2000" />
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
          <Input.Password placeholder="阿里云 API Key" />
        </Form.Item>

        <Form.Item
          name="glmKey"
          label="GLM API Key"
        >
          <Input.Password placeholder="智谱 API Key" />
        </Form.Item>

        <Button type="primary" onClick={handleSaveModel} loading={loading}>
          保存配置
        </Button>
      </Form>
    </Card>
  );

  const securitySettings = (
    <Card title="安全配置" className="settings-card">
      <Alert
        message="安全设置"
        description="配置访问控制、会话管理等安全相关选项。"
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form form={securityForm} layout="vertical">
        <Form.Item
          name="enableAuth"
          label="启用认证"
          valuePropName="checked"
        >
          <Switch checkedChildren="开启" unCheckedChildren="关闭" />
        </Form.Item>

        <Form.Item
          name="sessionTimeout"
          label="会话超时时间（秒）"
        >
          <Input type="number" min={300} max={86400} placeholder="3600" />
        </Form.Item>

        <Form.Item
          name="rateLimit"
          label="API 速率限制（次/分钟）"
        >
          <Input type="number" min={10} max={1000} placeholder="100" />
        </Form.Item>

        <Form.Item
          name="enableLogs"
          label="启用详细日志"
          valuePropName="checked"
        >
          <Switch checkedChildren="开启" unCheckedChildren="关闭" defaultChecked />
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

        <Button type="primary" onClick={handleSaveSecurity} loading={loading}>
          保存配置
        </Button>
      </Form>
    </Card>
  );

  const items: TabsProps['items'] = [
    {
      key: 'database',
      label: (
        <span>
          <DatabaseOutlined />
          数据库
        </span>
      ),
      children: databaseSettings,
    },
    {
      key: 'model',
      label: (
        <span>
          <CloudOutlined />
          AI 模型
        </span>
      ),
      children: modelSettings,
    },
    {
      key: 'security',
      label: (
        <span>
          <SafetyOutlined />
          安全
        </span>
      ),
      children: securitySettings,
    },
  ];

  return (
    <div className="settings-page">
      <div className="settings-header">
        <SettingOutlined style={{ fontSize: 32, color: '#1890ff' }} />
        <h2>系统设置</h2>
      </div>

      <Tabs defaultActiveKey="database" items={items} />
    </div>
  );
};

export default SettingsPage;
