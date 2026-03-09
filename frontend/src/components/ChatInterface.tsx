import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, message, Spin, Card, Avatar, Tag } from 'antd';
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import { chatAPI } from '../services/api';
import type { ChatMessage } from '../types';
import './ChatInterface.css';

const { TextArea } = Input;

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response: any = await chatAPI.send(inputValue);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data || response.error || '处理完成',
        timestamp: new Date(),
        metadata: response.metadata,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      message.error('发送失败: ' + error.message);

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: '抱歉，处理您的请求时出现错误。请稍后重试。',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <RobotOutlined className="chat-icon" />
        <h2>AI Agent Platform</h2>
        <Tag color="green">在线</Tag>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-state">
            <RobotOutlined style={{ fontSize: 64, color: '#1890ff' }} />
            <h3>👋 你好！我是 AI Agent</h3>
            <p>我可以帮你：</p>
            <ul>
              <li>🔍 查询业务数据</li>
              <li>📊 分析业务报表</li>
              <li>🤖 对接业务系统</li>
              <li>💬 回答业务问题</li>
            </ul>
            <p>试试问我："帮我查询今天的订单"</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.role === 'user' ? 'user' : 'assistant'}`}
          >
            <Avatar
              icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
              style={{
                backgroundColor: msg.role === 'user' ? '#87d068' : '#1890ff',
              }}
            />
            <Card className="message-card" size="small">
              <div className="message-content">{msg.content}</div>
              <div className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </Card>
          </div>
        ))}

        {loading && (
          <div className="message assistant">
            <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#1890ff' }} />
            <Card className="message-card" size="small">
              <Spin indicator={<LoadingOutlined spin />} />
              <span style={{ marginLeft: 8 }}>思考中...</span>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <TextArea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入消息... (Enter 发送, Shift+Enter 换行)"
          autoSize={{ minRows: 2, maxRows: 4 }}
          disabled={loading}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          loading={loading}
          disabled={!inputValue.trim()}
        >
          发送
        </Button>
      </div>
    </div>
  );
};

export default ChatInterface;
