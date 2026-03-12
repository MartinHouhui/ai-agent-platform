/**
 * Redis 缓存服务
 */

import Redis from 'ioredis';
import { logger } from '../utils/logger';

export class RedisCache {
  private client: Redis | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.connect();
  }

  /**
   * 连接 Redis
   */
  private connect(): void {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    try {
      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        retryStrategy: (times: number) => {
          if (times > 3) {
            logger.error('Redis 重连次数超过限制');
            return null;
          }
          return Math.min(times * 100, 3000);
        }
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        logger.info('✅ Redis 连接成功');
      });

      this.client.on('error', (error) => {
        logger.error('Redis 连接错误', { error: error.message });
        this.isConnected = false;
      });

      this.client.on('close', () => {
        this.isConnected = false;
        logger.warn('Redis 连接关闭');
      });

    } catch (error: any) {
      logger.warn('Redis 初始化失败，将使用内存缓存', { error: error.message });
      this.client = null;
    }
  }

  /**
   * 获取缓存
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      if (!value) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error: any) {
      logger.error('Redis get 失败', { key, error: error.message });
      return null;
    }
  }

  /**
   * 设置缓存
   */
  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const stringValue = JSON.stringify(value);
      
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, stringValue);
      } else {
        await this.client.set(key, stringValue);
      }
      
      return true;
    } catch (error: any) {
      logger.error('Redis set 失败', { key, error: error.message });
      return false;
    }
  }

  /**
   * 删除缓存
   */
  async del(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error: any) {
      logger.error('Redis del 失败', { key, error: error.message });
      return false;
    }
  }

  /**
   * 批量删除（模糊匹配）
   */
  async delPattern(pattern: string): Promise<number> {
    if (!this.isConnected || !this.client) {
      return 0;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }
      await this.client.del(...keys);
      return keys.length;
    } catch (error: any) {
      logger.error('Redis delPattern 失败', { pattern, error: error.message });
      return 0;
    }
  }

  /**
   * 检查键是否存在
   */
  async exists(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error: any) {
      logger.error('Redis exists 失败', { key, error: error.message });
      return false;
    }
  }

  /**
   * 获取 TTL（剩余时间）
   */
  async ttl(key: string): Promise<number> {
    if (!this.isConnected || !this.client) {
      return -1;
    }

    try {
      return await this.client.ttl(key);
    } catch (error: any) {
      logger.error('Redis ttl 失败', { key, error: error.message });
      return -1;
    }
  }

  /**
   * 关闭连接
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      logger.info('Redis 连接已关闭');
    }
  }

  /**
   * 获取连接状态
   */
  getStatus(): boolean {
    return this.isConnected;
  }
}

// 单例实例
export const redisCache = new RedisCache();
