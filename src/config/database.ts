/**
 * 数据库配置
 * 支持多种数据库类型：sqlite（默认）、mysql、postgres
 */

import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { SkillEntity } from '../entities/SkillEntity';
import { AdapterConfigEntity } from '../entities/AdapterConfigEntity';
import { LearningCaseEntity } from '../entities/LearningCaseEntity';

dotenv.config();

// 获取数据库类型，默认使用 SQLite
const dbType = (process.env.DB_TYPE || 'sqlite').toLowerCase();

// 根据数据库类型创建配置
function createDatabaseConfig(): DataSourceOptions {
  const entities = [SkillEntity, AdapterConfigEntity, LearningCaseEntity];
  const isProduction = process.env.NODE_ENV === 'production';

  switch (dbType) {
    case 'mysql':
      return {
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || 'ai_agent_platform',
        synchronize: !isProduction,
        logging: !isProduction,
        entities,
      };

    case 'postgres':
    case 'postgresql':
      return {
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || 'ai_agent_platform',
        synchronize: !isProduction,
        logging: !isProduction,
        entities,
      };

    case 'sqlite':
    default:
      return {
        type: 'sqljs',
        location: process.env.DB_DATABASE || 'data/ai_agent_platform.db',
        autoSave: true,
        synchronize: true,
        logging: !isProduction,
        entities,
      };
  }
}

export const AppDataSource = new DataSource(createDatabaseConfig());

// 数据库是否已初始化
let isInitialized = false;

// 初始化连接
export async function initDatabase(): Promise<DataSource | null> {
  // 如果数据库类型为 'none'，跳过数据库初始化
  if (dbType === 'none') {
    console.log('📦 数据库已禁用，使用内存存储模式');
    return null;
  }

  try {
    if (isInitialized) {
      return AppDataSource;
    }

    await AppDataSource.initialize();
    isInitialized = true;
    console.log(`✅ 数据库连接成功 (${dbType})`);
    return AppDataSource;
  } catch (error: any) {
    console.error('❌ 数据库连接失败:', error.message);

    // 如果是 SQLite，尝试创建数据目录
    if (dbType === 'sqlite' && error.code === 'SQLITE_CANTOPEN') {
      console.log('💡 提示：请确保 data 目录存在，或手动创建: mkdir -p data');
    }

    // 开发环境下，允许无数据库运行
    if (process.env.NODE_ENV !== 'production') {
      console.log('⚠️  以无数据库模式继续运行...');
      return null;
    }

    throw error;
  }
}

// 获取数据库状态
export function isDatabaseReady(): boolean {
  return isInitialized && AppDataSource.isInitialized;
}

