import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Badge,
  Descriptions,
} from 'antd';
import {
  ApiOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import './AdaptersPage.css';

const { Option } = Select;
const { TextArea } = Input;

interface Adapter {
  id: string;
  name: string;
  type: string;
  baseUrl: string;
  isActive: boolean;
  lastChecked: Date;
}

const AdaptersPage: React.FC = () => {
  const [adapters, setAdapters] = useState<Adapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAdapter, setEditingAdapter] = useState<Adapter | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadAdapters();
  }, []);

  const loadAdapters = async () => {
    setLoading(true);
    try {
      // TODO: 调用真实 API
      // const response = await adaptersAPI.list();
      // setAdapters(response.data);

      // 模拟数据
      setAdapters([
        {
          id: '1',
          name: 'natural-erp',
          type: 'ERP',
          baseUrl: 'https://erp.natural.com/api',
          isActive: true,
          lastChecked: new Date(),
        },
        {
          id: '2',
          name: 'company-crm',
          type: 'CRM',
          baseUrl: 'https://crm.company.com/api',
          isActive: false,
          lastChecked: new Date(),
        },
      ]);
    } catch (error: any) {
      message.error('加载失败: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingAdapter(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (adapter: Adapter) => {
    setEditingAdapter(adapter);
    form.setFieldsValue(adapter);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个适配器吗？',
      onOk: async () => {
        try {
          // await adaptersAPI.delete(id);
          message.success('删除成功');
          loadAdapters();
        } catch (error: any) {
          message.error('删除失败: ' + error.message);
        }
      },
    });
  };

  const handleTest = async (id: string) => {
    try {
      message.loading('测试连接中...', 0);
      // await adaptersAPI.test(id);
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.destroy();
      message.success('连接成功');
      loadAdapters();
    } catch (error: any) {
      message.destroy();
      message.error('连接失败: ' + error.message);
    }
  };

  const handleDiscover = async (id: string) => {
    try {
      message.loading('发现 API 中...', 0);
      // await adaptersAPI.discover(id);
      await new Promise(resolve => setTimeout(resolve, 2000));
      message.destroy();
      message.success('API 发现完成');
    } catch (error: any) {
      message.destroy();
      message.error('发现失败: ' + error.message);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingAdapter) {
        // await adaptersAPI.update(editingAdapter.id, values);
        message.success('更新成功');
      } else {
        // await adaptersAPI.create(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadAdapters();
    } catch (error: any) {
      message.error('操作失败: ' + error.message);
    }
  };

  const columns = [
    {
      title: '适配器名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <ApiOutlined />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const color = type === 'ERP' ? 'blue' : type === 'CRM' ? 'green' : 'orange';
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: 'API 地址',
      dataIndex: 'baseUrl',
      key: 'baseUrl',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Badge
          status={isActive ? 'success' : 'error'}
          text={isActive ? '在线' : '离线'}
        />
      ),
    },
    {
      title: '最后检查',
      dataIndex: 'lastChecked',
      key: 'lastChecked',
      render: (date: Date) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Adapter) => (
        <Space>
          <Button
            type="link"
            icon={<CheckCircleOutlined />}
            onClick={() => handleTest(record.id)}
          >
            测试
          </Button>
          <Button
            type="link"
            icon={<SyncOutlined />}
            onClick={() => handleDiscover(record.id)}
          >
            发现
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="adapters-page">
      <Card
        title="适配器管理"
        extra={
          <Space>
            <Button onClick={loadAdapters} icon={<SyncOutlined />}>
              刷新
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加适配器
            </Button>
          </Space>
        }
      >
        <Table
          dataSource={adapters}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 个适配器`,
          }}
        />
      </Card>

      <Modal
        title={editingAdapter ? '编辑适配器' : '添加适配器'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
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
            name="baseUrl"
            label="API 基础地址"
            rules={[{ required: true, message: '请输入 API 地址' }]}
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
  );
};

export default AdaptersPage;
