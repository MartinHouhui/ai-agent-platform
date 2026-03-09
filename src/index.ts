/**
 * AI Agent Platform - 入口文件
 */

import dotenv from 'dotenv';
dotenv.config();

import 'reflect-metadata';
import { Agent } from './core/Agent';
import { initDatabase } from './config/database';
import { startServer } from './api/server';
import { logger } from './utils/logger';
import { SkillManager } from './skills/SkillManager';
import { QueryOrderSkill } from './skills/examples/QueryOrderSkill';
import { RESTAdapter } from './adapters/RESTAdapter';
import { AdapterManager } from './adapters/AdapterManager';

/**
 * 主函数
 */
async function main() {
  logger.info('🤖 AI Agent Platform 启动中...');
  logger.info(`运行环境: ${process.env.NODE_ENV || 'development'}`);

  try {
    // 1. 初始化数据库
    logger.info('📦 初始化数据库...');
    await initDatabase();

    // 2. 创建 Agent
    logger.info('🧠 初始化 Agent...');
    const agent = new Agent();

    // 3. 注册示例 Skills
    logger.info('📚 注册 Skills...');
    const skillManager = new SkillManager();
    skillManager.registerSkill(QueryOrderSkill);

    // 4. 注册示例 Adapter（可以对接自然或其他系统）
    logger.info('🔌 注册 Adapters...');
    const adapterManager = new AdapterManager();
    
    // 示例：注册一个通用的业务系统适配器
    const businessAdapter = new RESTAdapter('business-system');
    await adapterManager.registerAdapter(businessAdapter);

    // 5. 启动 API 服务器
    const port = parseInt(process.env.PORT || '3000');
    logger.info(`🌐 启动 API 服务器 (端口: ${port})...`);
    startServer(agent, port);

    logger.info('✅ AI Agent Platform 启动完成！');
    logger.info('');
    logger.info('📖 使用方法:');
    logger.info('  POST http://localhost:3000/api/chat');
    logger.info('  Body: { "message": "帮我查询今天的订单" }');
    logger.info('');
    logger.info('💡 测试命令:');
    logger.info('  curl -X POST http://localhost:3000/api/chat \\');
    logger.info('    -H "Content-Type: application/json" \\');
    logger.info('    -d \'{"message":"帮我查询今天的订单"}\'');

  } catch (error: any) {
    logger.error('❌ 启动失败', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

// 运行
if (require.main === module) {
  main().catch(error => {
    logger.error('启动失败', { error: error.message });
    process.exit(1);
  });
}

export { Agent, SkillManager, AdapterManager };
