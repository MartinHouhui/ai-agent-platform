import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import { skillsAPI } from '../services/api';
import type { Skill } from '../types';
import './SkillsManager.css';

const { TextArea } = Input;
const { Option } = Select;

const SkillsManager: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    setLoading(true);
    try {
      const response: any = await skillsAPI.list();
      setSkills(response.data || []);
    } catch (error: any) {
      message.error('加载失败: ' + error.message);
      // 模拟数据
      setSkills([
        {
          id: '1',
          name: '查询订单',
          version: '1.0.0',
          description: '从业务系统查询订单信息',
          executorType: 'code',
          usageCount: 128,
          successRate: 0.95,
        },
        {
          id: '2',
          name: '创建订单',
          version: '1.0.0',
          description: '创建新的订单',
          executorType: 'code',
          usageCount: 56,
          successRate: 0.92,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingSkill(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill);
    form.setFieldsValue(skill);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await skillsAPI.delete(id);
      message.success('删除成功');
      loadSkills();
    } catch (error: any) {
      message.error('删除失败: ' + error.message);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingSkill) {
        await skillsAPI.update(editingSkill.id, values);
        message.success('更新成功');
      } else {
        await skillsAPI.create(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadSkills();
    } catch (error: any) {
      message.error('操作失败: ' + error.message);
    }
  };

  const columns = [
    {
      title: 'Skill 名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <CodeOutlined />
          <strong>{text}</strong>
        </Space>
      ),
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'executorType',
      key: 'executorType',
      render: (type: string) => {
        const color = type === 'code' ? 'blue' : type === 'prompt' ? 'green' : 'orange';
        return <Tag color={color}>{type.toUpperCase()}</Tag>;
      },
    },
    {
      title: '使用次数',
      dataIndex: 'usageCount',
      key: 'usageCount',
      sorter: (a: Skill, b: Skill) => a.usageCount - b.usageCount,
    },
    {
      title: '成功率',
      dataIndex: 'successRate',
      key: 'successRate',
      render: (rate: number) => (
        <Badge
          status={rate > 0.9 ? 'success' : rate > 0.7 ? 'warning' : 'error'}
          text={`${(rate * 100).toFixed(0)}%`}
        />
      ),
      sorter: (a: Skill, b: Skill) => a.successRate - b.successRate,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Skill) => (
        <Space>
          <Button
            type="link"
            icon={<PlayCircleOutlined />}
            onClick={() => message.info('测试功能开发中')}
          >
            测试
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个 Skill 吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="skills-manager">
      <Card
        title="Skills 管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建 Skill
          </Button>
        }
      >
        <Table
          dataSource={skills}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 个 Skills`,
          }}
        />
      </Card>

      <Modal
        title={editingSkill ? '编辑 Skill' : '新建 Skill'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Skill 名称"
            rules={[{ required: true, message: '请输入 Skill 名称' }]}
          >
            <Input placeholder="例如：查询订单" />
          </Form.Item>

          <Form.Item name="version" label="版本" initialValue="1.0.0">
            <Input placeholder="1.0.0" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <TextArea rows={3} placeholder="描述这个 Skill 的功能..." />
          </Form.Item>

          <Form.Item
            name="executorType"
            label="执行类型"
            rules={[{ required: true }]}
          >
            <Select placeholder="选择执行类型">
              <Option value="code">代码执行</Option>
              <Option value="prompt">提示词</Option>
              <Option value="hybrid">混合模式</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="code"
            label="执行代码"
            rules={[{ required: true, message: '请输入代码' }]}
          >
            <TextArea
              rows={8}
              placeholder={`async function execute(params, { adapters, logger }) {\n  // 你的代码\n  return { success: true, data: {} };\n}`}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SkillsManager;
