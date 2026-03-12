/**
 * WebSocket 服务
 * 实现实时通信
 */

import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import { sessionCache } from './SessionCache';

interface ClientInfo {
  id: string;
  userId?: string;
  sessionId?: string;
  connectedAt: Date;
}

export class WebSocketService {
  private io: Server | null = null;
  private clients: Map<string, ClientInfo> = new Map();

  /**
   * 初始化 WebSocket 服务
   */
  init(httpServer: HttpServer): void {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.setupEventHandlers();
    logger.info('✅ WebSocket 服务已启动');
  }

  /**
   * 设置事件处理器
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      this.handleConnection(socket);
    });
  }

  /**
   * 处理客户端连接
   */
  private handleConnection(socket: Socket): void {
    const clientId = socket.id;
    
    // 注册客户端
    this.clients.set(clientId, {
      id: clientId,
      connectedAt: new Date()
    });

    logger.info('客户端已连接', { clientId, total: this.clients.size });

    // 发送欢迎消息
    socket.emit('connected', {
      message: '连接成功',
      clientId,
      timestamp: new Date().toISOString()
    });

    // 处理事件
    socket.on('disconnect', () => this.handleDisconnect(socket));
    socket.on('join_session', (data) => this.handleJoinSession(socket, data));
    socket.on('leave_session', () => this.handleLeaveSession(socket));
    socket.on('chat_message', (data) => this.handleChatMessage(socket, data));
    socket.on('typing', (data) => this.handleTyping(socket, data));
    socket.on('ping', () => this.handlePing(socket));
  }

  /**
   * 处理客户端断开
   */
  private handleDisconnect(socket: Socket): void {
    const clientId = socket.id;
    const clientInfo = this.clients.get(clientId);

    if (clientInfo) {
      // 离开会话房间
      if (clientInfo.sessionId) {
        socket.leave(`session:${clientInfo.sessionId}`);
      }

      this.clients.delete(clientId);
      logger.info('客户端已断开', { clientId, total: this.clients.size });
    }
  }

  /**
   * 加入会话房间
   */
  private handleJoinSession(socket: Socket, data: { sessionId: string; userId?: string }): void {
    const clientId = socket.id;
    const { sessionId, userId } = data;

    // 更新客户端信息
    const clientInfo = this.clients.get(clientId);
    if (clientInfo) {
      clientInfo.sessionId = sessionId;
      clientInfo.userId = userId;
    }

    // 加入房间
    socket.join(`session:${sessionId}`);

    // 通知其他成员
    socket.to(`session:${sessionId}`).emit('user_joined', {
      userId,
      timestamp: new Date().toISOString()
    });

    logger.info('客户端加入会话', { clientId, sessionId });

    // 发送确认
    socket.emit('session_joined', { sessionId });
  }

  /**
   * 离开会话房间
   */
  private handleLeaveSession(socket: Socket): void {
    const clientId = socket.id;
    const clientInfo = this.clients.get(clientId);

    if (clientInfo && clientInfo.sessionId) {
      const sessionId = clientInfo.sessionId;
      
      socket.leave(`session:${sessionId}`);
      
      // 通知其他成员
      socket.to(`session:${sessionId}`).emit('user_left', {
        userId: clientInfo.userId,
        timestamp: new Date().toISOString()
      });

      clientInfo.sessionId = undefined;
      logger.info('客户端离开会话', { clientId, sessionId });
    }
  }

  /**
   * 处理聊天消息
   */
  private async handleChatMessage(socket: Socket, data: { message: string; sessionId: string }): Promise<void> {
    const clientId = socket.id;
    const { message, sessionId } = data;

    logger.info('收到聊天消息', { clientId, sessionId, message });

    // 广播给会话中的所有人
    this.io?.to(`session:${sessionId}`).emit('chat_message', {
      message,
      senderId: clientId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 处理正在输入
   */
  private handleTyping(socket: Socket, data: { isTyping: boolean }): void {
    const clientId = socket.id;
    const clientInfo = this.clients.get(clientId);

    if (clientInfo && clientInfo.sessionId) {
      socket.to(`session:${clientInfo.sessionId}`).emit('user_typing', {
        userId: clientInfo.userId,
        isTyping: data.isTyping
      });
    }
  }

  /**
   * 处理心跳
   */
  private handlePing(socket: Socket): void {
    socket.emit('pong', { timestamp: new Date().toISOString() });
  }

  /**
   * 发送消息给特定会话
   */
  emitToSession(sessionId: string, event: string, data: any): void {
    this.io?.to(`session:${sessionId}`).emit(event, data);
  }

  /**
   * 发送消息给所有客户端
   */
  broadcast(event: string, data: any): void {
    this.io?.emit(event, data);
  }

  /**
   * 获取在线用户数
   */
  getOnlineCount(): number {
    return this.clients.size;
  }

  /**
   * 获取会话中的用户
   */
  getSessionUsers(sessionId: string): ClientInfo[] {
    const users: ClientInfo[] = [];
    this.clients.forEach((client) => {
      if (client.sessionId === sessionId) {
        users.push(client);
      }
    });
    return users;
  }

  /**
   * 关闭服务
   */
  close(): void {
    if (this.io) {
      this.io.close();
      this.clients.clear();
      logger.info('WebSocket 服务已关闭');
    }
  }
}

// 单例实例
export const webSocketService = new WebSocketService();
