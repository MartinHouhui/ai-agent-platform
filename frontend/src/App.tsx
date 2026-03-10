import { useState } from 'react'
import { Button } from 'antd'
import {
  MessageOutlined,
  ThunderboltOutlined,
  ApiOutlined,
  DatabaseOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import Chat from './components/Chat'
import Wizard from './components/Wizard'
import Skills from './components/Skills'
import Adapters from './components/Adapters'
import Settings from './components/Settings'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('chat')

  const pages = [
    { key: 'chat', icon: <MessageOutlined />, label: '对话' },
    { key: 'wizard', icon: <ThunderboltOutlined />, label: '向导' },
    { key: 'skills', icon: <ApiOutlined />, label: 'Skills' },
    { key: 'adapters', icon: <DatabaseOutlined />, label: '适配器' },
    { key: 'settings', icon: <SettingOutlined />, label: '设置' },
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

  return (
    <div className="app">
      {/* 侧边栏 */}
      <aside className="sidebar">
        <div className="logo">
          <div className="logo-icon">◆</div>
          <div className="logo-text">
            <h1>AI Agent</h1>
            <p>智能业务平台</p>
          </div>
        </div>

        <nav className="nav">
          {pages.map(page => (
            <button
              key={page.key}
              className={`nav-item ${currentPage === page.key ? 'active' : ''}`}
              onClick={() => setCurrentPage(page.key)}
            >
              <span className="nav-icon">{page.icon}</span>
              <span className="nav-label">{page.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="status">
            <span className="status-dot"></span>
            <span>运行中</span>
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="main">
        <header className="header">
          <h2 className="page-title">
            {pages.find(p => p.key === currentPage)?.label}
          </h2>
          <div className="user">
            <div className="avatar">A</div>
            <span>Admin</span>
          </div>
        </header>

        <div className="content">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

export default App
