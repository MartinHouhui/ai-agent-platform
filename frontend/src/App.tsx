import { useState } from 'react'
import { Layout, Menu, theme } from 'antd'
import {
  RobotOutlined,
  ApiOutlined,
  ThunderboltOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import ChatInterface from './components/ChatInterface'
import WizardFlow from './components/WizardFlow'
import SkillsManager from './components/SkillsManager'
import './App.css'

const { Header, Content, Sider } = Layout

function App() {
  const [currentPage, setCurrentPage] = useState('chat')
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  const menuItems = [
    {
      key: 'chat',
      icon: <RobotOutlined />,
      label: '对话',
    },
    {
      key: 'wizard',
      icon: <ThunderboltOutlined />,
      label: '适配向导',
    },
    {
      key: 'skills',
      icon: <ApiOutlined />,
      label: 'Skills 管理',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
  ]

  const renderContent = () => {
    switch (currentPage) {
      case 'chat':
        return <ChatInterface />
      case 'wizard':
        return <WizardFlow />
      case 'skills':
        return <SkillsManager />
      case 'settings':
        return (
          <div style={{ textAlign: 'center', marginTop: 100 }}>
            <SettingOutlined style={{ fontSize: 64, color: '#1890ff' }} />
            <h2>设置</h2>
            <p>正在开发中...</p>
          </div>
        )
      default:
        return <ChatInterface />
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        breakpoint="lg"
        collapsedWidth={80}
        theme="light"
      >
        <div className="logo">
          <RobotOutlined style={{ fontSize: 32, color: '#1890ff' }} />
        </div>
        <Menu
          mode="inline"
          selectedKeys={[currentPage]}
          items={menuItems}
          onClick={(e) => setCurrentPage(e.key)}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <div className="header-content">
            <h2>AI Agent Platform</h2>
          </div>
        </Header>
        <Content style={{ margin: '24px 16px 0' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              height: 'calc(100vh - 112px)',
              overflow: 'hidden',
            }}
          >
            {renderContent()}
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
