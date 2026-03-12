import { useState } from 'react'
import { Button, Input, message } from 'antd'
import { SendOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons'
import api from '../services/api'
import './Chat.css'

const { TextArea } = Input

function Chat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: '你好！我是 AI 助手，我可以帮你查询业务数据、分析报表、对接系统。有什么我可以帮你的吗？',
      time: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: input,
      time: new Date()
    }

    setMessages(prev => [...prev, userMsg])
    const currentInput = input
    setInput('')
    setLoading(true)

    try {
      // 调用后端 Agent 引擎 API
      const response = await api.post('/api/agent/chat', {
        message: currentInput
      })

      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.data.response || response.data.message || '处理完成',
        time: new Date()
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (error: any) {
      console.error('Agent chat error:', error)
      const errorMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `抱歉，处理时出现错误：${error.response?.data?.error || error.message || '未知错误'}`,
        time: new Date()
      }
      setMessages(prev => [...prev, errorMsg])
      message.error('请求失败，请检查后端服务')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const quickActions = [
    { icon: '📊', text: '查询今天的订单' },
    { icon: '📈', text: '生成销售报表' },
    { icon: '🔍', text: '分析业务数据' },
    { icon: '💡', text: '获取业务建议' },
  ]

  return (
    <div className="chat">
      {/* 头部 */}
      <div className="chat-header">
        <div className="chat-title">
          <div className="chat-icon">◆</div>
          <div>
            <h3>AI 助手</h3>
            <span className="chat-status">
              <span className="dot"></span>
              在线
            </span>
          </div>
        </div>
      </div>

      {/* 消息区 */}
      <div className="messages">
        {messages.length === 1 && messages[0].role === 'assistant' && (
          <div className="welcome">
            <div className="welcome-icon">👋</div>
            <h2>欢迎使用 AI 助手</h2>
            <p>我可以帮你查询业务数据、分析报表、对接系统</p>
            
            <div className="quick-actions">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="action-btn"
                  onClick={() => setInput(action.text)}
                >
                  <span className="action-icon">{action.icon}</span>
                  <span>{action.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.slice(1).map(msg => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <div className={`avatar ${msg.role}`}>
              {msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
            </div>
            <div className="message-body">
              <div className="message-header">
                <span className="name">{msg.role === 'user' ? '你' : 'AI'}</span>
                <span className="time">{formatTime(msg.time)}</span>
              </div>
              <div className={`bubble ${msg.role}`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="message assistant">
            <div className="avatar assistant">
              <RobotOutlined />
            </div>
            <div className="message-body">
              <div className="bubble assistant typing">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 输入区 */}
      <div className="input-area">
        <div className="input-wrapper">
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息... (Enter 发送)"
            autoSize={{ minRows: 1, maxRows: 4 }}
            disabled={loading}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={loading}
            disabled={!input.trim()}
          />
        </div>
      </div>
    </div>
  )
}

export default Chat
