import { useEffect, useState } from 'react';
import { Modal, Button, Steps, Card, Typography } from 'antd';
import { RocketOutlined, CheckCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;
const { Step } = Steps;

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // 检查是否已完成引导
    const completed = localStorage.getItem('onboarding_completed');
    if (completed) {
      setVisible(false);
      onComplete();
    }
  }, [onComplete]);

  const handleComplete = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setVisible(false);
    onComplete();
  };

  const steps = [
    {
      title: '欢迎使用',
      icon: <RocketOutlined />,
      content: (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🤖</div>
          <Title level={3}>欢迎来到 AI Agent Platform</Title>
          <Paragraph style={{ fontSize: '16px', color: '#666' }}>
            这是一个帮助您快速对接业务系统的智能平台
          </Paragraph>
          <Paragraph style={{ fontSize: '16px', color: '#666' }}>
            无需编程经验，3 步即可完成对接
          </Paragraph>
        </div>
      ),
    },
    {
      title: '选择系统',
      icon: <CheckCircleOutlined />,
      content: (
        <div style={{ padding: '20px' }}>
          <Title level={4}>第一步：选择要对接的系统</Title>
          <Paragraph>
            平台支持多种常见业务系统：
          </Paragraph>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '16px' }}>
            {[
              { icon: '📦', name: 'ERP 系统', desc: '企业资源计划' },
              { icon: '👥', name: 'CRM 系统', desc: '客户关系管理' },
              { icon: '🏢', name: 'OA 系统', desc: '办公自动化' },
              { icon: '💰', name: '财务系统', desc: '财务管理' },
            ].map((item) => (
              <Card
                key={item.name}
                hoverable
                style={{ textAlign: 'center' }}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{item.icon}</div>
                <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                <div style={{ fontSize: '12px', color: '#999' }}>{item.desc}</div>
              </Card>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: '配置连接',
      icon: <PlayCircleOutlined />,
      content: (
        <div style={{ padding: '20px' }}>
          <Title level={4}>第二步：配置 API 连接</Title>
          <Paragraph>
            只需填写 3 个信息：
          </Paragraph>
          <div style={{ marginTop: '16px' }}>
            {[
              { step: '1', title: 'API 地址', desc: '系统提供的接口地址' },
              { step: '2', title: '认证方式', desc: '选择 API Key 或其他方式' },
              { step: '3', title: 'API Key', desc: '输入访问密钥' },
            ].map((item) => (
              <div
                key={item.step}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '16px',
                  padding: '12px',
                  background: '#f5f5f5',
                  borderRadius: '8px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#1890ff',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '12px',
                    fontWeight: 'bold',
                  }}
                >
                  {item.step}
                </div>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{item.title}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: '开始使用',
      icon: <RocketOutlined />,
      content: (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🎉</div>
          <Title level={3}>准备就绪！</Title>
          <Paragraph style={{ fontSize: '16px', color: '#666' }}>
            点击下方按钮开始您的第一次对接
          </Paragraph>
          <Paragraph style={{ fontSize: '14px', color: '#999', marginTop: '16px' }}>
            随时可以通过右上角的"?"按钮查看帮助
          </Paragraph>
        </div>
      ),
    },
  ];

  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  return (
    <Modal
      open={visible}
      onCancel={handleComplete}
      footer={null}
      width={700}
      centered
      maskClosable={false}
    >
      <Steps current={current} style={{ marginBottom: '24px' }}>
        {steps.map((item) => (
          <Step key={item.title} title={item.title} icon={item.icon} />
        ))}
      </Steps>

      <div style={{ minHeight: '300px' }}>{steps[current].content}</div>

      <div style={{ marginTop: '24px', textAlign: 'right' }}>
        {current > 0 && (
          <Button style={{ margin: '0 8px' }} onClick={prev}>
            上一步
          </Button>
        )}
        {current < steps.length - 1 && (
          <Button type="primary" onClick={next}>
            下一步
          </Button>
        )}
        {current === steps.length - 1 && (
          <Button type="primary" size="large" onClick={handleComplete}>
            开始使用
          </Button>
        )}
      </div>
    </Modal>
  );
}
