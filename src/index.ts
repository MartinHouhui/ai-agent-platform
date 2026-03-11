/**
 * AI Agent Platform - 入口文件
 */

import dotenv from 'dotenv';
dotenv.config();

import 'reflect-metadata';
import { Agent } from './core/Agent';
import { AgentEngine } from './core/AgentEngine';
import { initDatabase } from './config/database';
import { startServer } from './api/server';
import { createWizardRoutes } from './api/wizardRoutes';
import { logger } from './utils/logger';
import { SkillManager } from './skills/SkillManager';
import { QueryOrderSkill } from './skills/examples/QueryOrderSkill';
import { RESTAdapter } from './adapters/RESTAdapter';
import { AdapterManager } from './adapters/AdapterManager';
import { AdapterWizardService } from './services/AdapterWizardService';
import { AuthService } from './services/AuthService';

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

    // 2. 创建 Agent（旧版）
    logger.info('🧠 初始化 Agent...');
    const agent = new Agent();

    // 3. 创建 Agent 引擎（新版）
    logger.info('⚙️  初始化 Agent 引擎...');
    const agentEngine = new AgentEngine();

    // 4. 注册示例 Skills
    logger.info('📚 注册 Skills...');
    const skillManager = new SkillManager();
    skillManager.registerSkill(QueryOrderSkill);

    // 5. 注册示例 Adapter（可以对接自然或其他系统）
    logger.info('🔌 注册 Adapters...');
    const adapterManager = new AdapterManager();

    // 示例：注册一个通用的业务系统适配器
    const businessAdapter = new RESTAdapter('business-system');
    await adapterManager.registerAdapter(businessAdapter);

    // 6. 初始化向导服务
    logger.info('🧙 初始化向导服务...');
    const wizardService = new AdapterWizardService();

    // 7. 初始化管理员账户（仅当数据库可用时）
    if (process.env.DB_TYPE !== 'none') {
      try {
        logger.info('👤 初始化认证系统...');
        const authService = new AuthService();
        await authService.createAdminUser();
      } catch (error: any) {
        logger.warn('认证系统初始化失败（数据库可能未连接）', { error: error.message });
      }
    } else {
      logger.info('👤 跳过认证系统初始化（无数据库模式）');
    }

    // 8. 启动 API 服务器
    const port = parseInt(process.env.PORT || '3000');
    logger.info(`🌐 启动 API 服务器 (端口: ${port})...`);
    startServer(agent, skillManager, adapterManager, wizardService, port, agentEngine);

    logger.info('✅ AI Agent Platform 启动完成！');
    logger.info('');
    logger.info('📖 API 端点:');
    logger.info('  健康检查: GET  http://localhost:3000/health');
    logger.info('  认证:     POST http://localhost:3000/api/auth/login');
    logger.info('  聊天:     POST http://localhost:3000/api/chat');
    logger.info('  Agent 引擎: POST http://localhost:3000/api/agent/chat');
    logger.info('  向导:     POST http://localhost:3000/api/wizard/start');
    logger.info('  Skills:   GET  http://localhost:3000/api/skills');
    logger.info('  Adapters: GET  http://localhost:3000/api/adapters');
    logger.info('');
    logger.info('💡 默认管理员账户（如果数据库可用）:');
    logger.info('  用户名: admin');
    logger.info('  密码: admin123456');
    logger.info('');
    logger.info('💡 测试命令:');
    logger.info('  curl http://localhost:3000/health');
    logger.info('  curl -X POST http://localhost:3000/api/agent/chat \\');
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

export { Agent, AgentEngine, SkillManager, AdapterManager };
