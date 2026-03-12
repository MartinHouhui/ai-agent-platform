import { useState } from 'react'
import { Button, Badge, Avatar, Dropdown, ConfigProvider, theme } from 'antd'
import {
  MessageOutlined,
  ThunderboltOutlined,
  ApiOutlined,
  DatabaseOutlined,
  SettingOutlined,
  UserOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RobotOutlined,
  BulbOutlined,
  BulbFilled,
} from '@ant-design/icons'
import Chat from './components/Chat'
import Wizard from './components/Wizard'
import Skills from './components/Skills'
import Adapters from './components/Adapters'
import Settings from './components/Settings'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('chat')
  const [collapsed, setCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  const { defaultAlgorithm, darkAlgorithm } = theme

  const pages = [
    { key: 'chat', icon: <MessageOutlined />, label: '对话', desc: '智能对话助手' },
    { key: 'wizard', icon: <ThunderboltOutlined />, label: '向导', desc: '系统配置向导' },
    { key: 'skills', icon: <ApiOutlined />, label: '技能', desc: '管理业务技能' },
    { key: 'adapters', icon: <DatabaseOutlined />, label: '适配器', desc: '业务系统对接' },
    { key: 'settings', icon: <SettingOutlined />, label: '设置', desc: '系统配置' },
  ]

  const renderContent = () => {
    switch (currentPage) {
      case 'chat':
        return <Chat />
      case 'wizard':
        return <Wizard />
      case 'skills':
        return <Skills />
      case 'adapters':
        return <Adapters />
      case 'settings':
        return <Settings />
      default:
        return <Chat />
    }
  }

  const userMenuItems = [
    {
      key: 'profile',
      label: '个人资料',
      icon: <UserOutlined />,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <UserOutlined />,
    },
  ]

  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode ? darkAlgorithm : defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
        },
      }}
    >
      <div className={`app ${darkMode ? 'dark' : ''}`}>
        {/* 侧边栏 */}
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
          {/* Logo */}
          <div className="logo-section">
            <div className="logo-mark">
              <RobotOutlined />
            </div>
            {!collapsed && (
              <div className="logo-text">
                <div className="logo-title">AI Agent</div>
                <div className="logo-subtitle">智能业务平台</div>
              </div>
            )}
          </div>

          {/* 导航菜单 */}
          <nav className="nav-menu">
            {pages.map(page => (
              <button
                key={page.key}
                className={`nav-item ${currentPage === page.key ? 'active' : ''}`}
                onClick={() => setCurrentPage(page.key)}
              >
                <div className="nav-icon">{page.icon}</div>
                {!collapsed && (
                  <div className="nav-content">
                    <div className="nav-label">{page.label}</div>
                    <div className="nav-desc">{page.desc}</div>
                  </div>
                )}
              </button>
            ))}
          </nav>

          {/* 底部状态 */}
          {!collapsed && (
            <div className="sidebar-footer">
              <div className="status-badge">
                <Badge status="success" />
                <span className="status-text">系统运行中</span>
              </div>
              <div className="version-tag">v1.0.0</div>
            </div>
          )}
        </aside>

        {/* 主内容区 */}
        <main className="main">
          {/* 顶部栏 */}
          <header className="header">
            <div className="header-left">
              <Button
                type="text"
                className="toggle-btn"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
              />
              <div className="page-info">
                <h1 className="page-title">
                  {pages.find(p => p.key === currentPage)?.label}
                </h1>
                <span className="page-desc">
                  {pages.find(p => p.key === currentPage)?.desc}
                </span>
              </div>
            </div>

            <div className="header-right">
              <Button
                type="text"
                icon={darkMode ? <BulbFilled /> : <BulbOutlined />}
                className="icon-btn theme-toggle"
                onClick={() => setDarkMode(!darkMode)}
                title={darkMode ? '切换到亮色模式' : '切换到暗色模式'}
              />
              
              <Badge count={3} size="small" className="notification-badge">
                <Button 
                  type="text" 
                  icon={<BellOutlined />}
                  className="icon-btn"
                />
              </Badge>
              
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <div className="user-profile">
                  <Avatar 
                    size="small" 
                    icon={<UserOutlined />}
                    className="user-avatar"
                  />
                  <span className="user-name">Admin</span>
                </div>
              </Dropdown>
            </div>
          </header>

          {/* 内容区 */}
          <div className="content">
            {renderContent()}
          </div>
        </main>
      </div>
    </ConfigProvider>
  )
}

export default App
