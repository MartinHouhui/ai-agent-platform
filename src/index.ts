/**
 * AI Agent Platform - 入口文件
 */

import dotenv from 'dotenv';
import { Agent } from './core/Agent';
import { logger } from './utils/logger';

// 加载环境变量
dotenv.config();

// 创建 Agent 实例
const agent = new Agent();

/**
 * 主函数
 */
async function main() {
  logger.info('AI Agent Platform 启动');
  logger.info(`Node 环境: ${process.env.NODE_ENV || 'development'}`);

  // 示例：测试 Agent
  try {
    const result = await agent.process('帮我查询今天的订单数据');
    logger.info('处理结果', { result });
  } catch (error: any) {
    logger.error('处理失败', { error: error.message });
  }

  // TODO: 启动 HTTP 服务器
  // TODO: 启动消息队列监听
  // TODO: 启动定时任务
}

// 运行
if (require.main === module) {
  main().catch(error => {
    logger.error('启动失败', { error: error.message });
    process.exit(1);
  });
}

export { agent, Agent };
