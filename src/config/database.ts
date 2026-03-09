/**
 * 数据库配置
 */

import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'ai_agent_platform',
  synchronize: process.env.NODE_ENV === 'development', // 开发环境自动同步
  logging: process.env.NODE_ENV === 'development',
  entities: ['src/entities/**/*.ts'],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: [],
});

// 初始化连接
export async function initDatabase() {
  try {
    await AppDataSource.initialize();
    console.log('✅ 数据库连接成功');
    return AppDataSource;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    throw error;
  }
}
