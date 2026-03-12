/**
 * 会话缓存服务
 * 使用 Redis 缓存会话历史
 */

import { redisCache } from './RedisCache';
import { logger } from '../utils/logger';

export interface SessionMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export class SessionCache {
  private readonly prefix = 'session:';
  private readonly maxMessages = 10;
  private readonly ttl = 3600; // 1小时

  /**
   * 获取会话历史
   */
  async getHistory(sessionId: string): Promise<SessionMessage[]> {
    try {
      const key = `${this.prefix}${sessionId}`;
      const data = await redisCache.get<SessionMessage[]>(key);
      return data || [];
    } catch (error: any) {
      logger.error('获取会话历史失败', { sessionId, error: error.message });
      return [];
    }
  }

  /**
   * 添加消息到会话
   */
  async addMessage(sessionId: string, message: SessionMessage): Promise<void> {
    try {
      const history = await this.getHistory(sessionId);
      
      // 添加新消息
      history.push({
        ...message,
        timestamp: Date.now(),
      });

      // 保留最近 N 条消息
      if (history.length > this.maxMessages) {
        history.splice(0, history.length - this.maxMessages);
      }

      // 保存到 Redis
      const key = `${this.prefix}${sessionId}`;
      await redisCache.set(key, history, this.ttl);

      logger.debug('会话消息已缓存', { sessionId, messageCount: history.length });
    } catch (error: any) {
      logger.error('添加会话消息失败', { sessionId, error: error.message });
    }
  }

  /**
   * 清除会话历史
   */
  async clearHistory(sessionId: string): Promise<void> {
    try {
      const key = `${this.prefix}${sessionId}`;
      await redisCache.del(key);
      logger.info('会话历史已清除', { sessionId });
    } catch (error: any) {
      logger.error('清除会话历史失败', { sessionId, error: error.message });
    }
  }

  /**
   * 获取会话 TTL
   */
  async getTTL(sessionId: string): Promise<number> {
    try {
      const key = `${this.prefix}${sessionId}`;
      return await redisCache.ttl(key);
    } catch (error: any) {
      logger.error('获取会话 TTL 失败', { sessionId, error: error.message });
      return -1;
    }
  }

  /**
   * 批量清除过期会话（清理任务）
   */
  async cleanupExpiredSessions(pattern: string = '*'): Promise<number> {
    try {
      const searchPattern = `${this.prefix}${pattern}`;
      const deleted = await redisCache.delPattern(searchPattern);
      logger.info('清理过期会话完成', { pattern, deleted });
      return deleted;
    } catch (error: any) {
      logger.error('清理过期会话失败', { pattern, error: error.message });
      return 0;
    }
  }
}

// 单例实例
export const sessionCache = new SessionCache();
