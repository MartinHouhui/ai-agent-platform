/**
 * Agent 核心 - 负责意图理解、任务编排、工具选择、执行反馈
 */

import { v4 as uuidv4 } from 'uuid';
import { Intent, Task, Tool, Result, IntentType, TaskStatus } from './types';
import { ModelRouter } from '../models/ModelRouter';
import { SkillManager } from '../skills/SkillManager';
import { MCPManager } from '../mcp/MCPManager';
import { AdapterManager } from '../adapters/AdapterManager';
import { logger } from '../utils/logger';

export class Agent {
  private modelRouter: ModelRouter;
  private skillManager: SkillManager;
  private mcpManager: MCPManager;
  private adapterManager: AdapterManager;

  constructor() {
    this.modelRouter = new ModelRouter();
    this.skillManager = new SkillManager();
    this.mcpManager = new MCPManager();
    this.adapterManager = new AdapterManager();
  }

  /**
   * 主入口：处理用户消息
   */
  async process(userMessage: string, context?: any): Promise<Result> {
    const startTime = Date.now();

    try {
      // 1. 意图理解
      logger.info('理解意图中...', { message: userMessage });
      const intent = await this.understandIntent(userMessage);

      // 2. 任务编排
      logger.info('编排任务中...', { intent: intent.type });
      const tasks = await this.planTasks(intent);

      // 3. 工具选择
      logger.info('选择工具中...', { taskCount: tasks.length });
      const tools = await this.selectTools(tasks);

      // 4. 执行
      logger.info('执行任务中...');
      const result = await this.execute(tasks, tools);

      // 5. 反馈学习
      await this.learn(result);

      const duration = Date.now() - startTime;
      logger.info('处理完成', { duration, success: result.success });

      return result;

    } catch (error: any) {
      logger.error('处理失败', { error: error.message });
      return {
        success: false,
        error: error.message,
        metadata: {
          duration: Date.now() - startTime
        }
      };
    }
  }

  /**
   * 1. 意图理解
   */
  private async understandIntent(userMessage: string): Promise<Intent> {
    const model = await this.modelRouter.selectModel('intent-understanding');
    
    const prompt = `
分析以下用户消息的意图，返回 JSON 格式：
{
  "type": "query|create|update|delete|analyze|integrate|chat|unknown",
  "action": "具体动作描述",
  "entities": { 提取的实体 },
  "confidence": 0.0-1.0
}

用户消息：${userMessage}
`;

    const response = await this.modelRouter.call(model, prompt);
    
    try {
      const parsed = JSON.parse(response.content);
      return {
        id: uuidv4(),
        type: parsed.type as IntentType,
        action: parsed.action,
        entities: parsed.entities,
        confidence: parsed.confidence,
        rawText: userMessage
      };
    } catch (error) {
      // 降级处理
      return {
        id: uuidv4(),
        type: IntentType.UNKNOWN,
        action: 'unknown',
        entities: {},
        confidence: 0,
        rawText: userMessage
      };
    }
  }

  /**
   * 2. 任务编排
   */
  private async planTasks(intent: Intent): Promise<Task[]> {
    const tasks: Task[] = [];

    // 根据意图类型生成任务
    switch (intent.type) {
      case IntentType.QUERY:
        tasks.push({
          id: uuidv4(),
          type: 'data_query' as any,
          description: intent.action,
          params: intent.entities,
          status: TaskStatus.PENDING,
          createdAt: new Date()
        });
        break;

      case IntentType.INTEGRATE:
        tasks.push({
          id: uuidv4(),
          type: 'system_integrate' as any,
          description: intent.action,
          params: intent.entities,
          status: TaskStatus.PENDING,
          createdAt: new Date()
        });
        // 系统集成后需要学习
        tasks.push({
          id: uuidv4(),
          type: 'skill_learn' as any,
          description: '学习新系统对接经验',
          params: { integrationTaskId: tasks[0].id },
          status: TaskStatus.PENDING,
          createdAt: new Date()
        });
        break;

      case IntentType.ANALYZE:
        tasks.push({
          id: uuidv4(),
          type: 'data_analyze' as any,
          description: intent.action,
          params: intent.entities,
          status: TaskStatus.PENDING,
          createdAt: new Date()
        });
        break;

      default:
        tasks.push({
          id: uuidv4(),
          type: 'chat' as any,
          description: intent.action,
          params: { message: intent.rawText },
          status: TaskStatus.PENDING,
          createdAt: new Date()
        });
    }

    return tasks;
  }

  /**
   * 3. 工具选择
   */
  private async selectTools(tasks: Task[]): Promise<Tool[]> {
    const tools: Tool[] = [];

    for (const task of tasks) {
      // 1. 查找 Skill
      const skill = await this.skillManager.findMatchingSkill(task);
      if (skill) {
        tools.push({
          id: skill.id,
          name: skill.name,
          description: skill.description,
          type: 'skill',
          inputSchema: {},
          handler: skill.executor.code || skill.executor.prompt || ''
        });
        continue;
      }

      // 2. 查找 MCP 工具
      const mcpTool = await this.mcpManager.findTool(task);
      if (mcpTool) {
        tools.push(mcpTool);
        continue;
      }

      // 3. 查找 Adapter
      const adapter = await this.adapterManager.findAdapter(task);
      if (adapter) {
        tools.push({
          id: adapter.name,
          name: adapter.name,
          description: `${adapter.name} 适配器`,
          type: 'adapter',
          inputSchema: {},
          handler: adapter.name
        });
      }
    }

    return tools;
  }

  /**
   * 4. 执行任务
   */
  private async execute(tasks: Task[], tools: Tool[]): Promise<Result> {
    const results: any[] = [];
    const usedTools: string[] = [];

    for (const task of tasks) {
      task.status = TaskStatus.RUNNING;

      try {
        const tool = tools.find(t => t.id === task.id || t.name.includes(task.type));
        
        if (!tool) {
          // 没有找到工具，直接用模型处理
          const model = await this.modelRouter.selectModel('general');
          const response = await this.modelRouter.call(model, task.description);
          task.result = response.content;
        } else {
          // 使用工具执行
          const result = await this.executeWithTool(task, tool);
          task.result = result;
          usedTools.push(tool.id);
        }

        task.status = TaskStatus.SUCCESS;
        task.completedAt = new Date();
        results.push(task.result);

      } catch (error: any) {
        task.status = TaskStatus.FAILED;
        task.error = error.message;
        logger.error(`任务执行失败: ${task.id}`, { error: error.message });
      }
    }

    const success = tasks.every(t => t.status === TaskStatus.SUCCESS);

    return {
      success,
      data: results.length === 1 ? results[0] : results,
      metadata: {
        duration: 0, // 由外层计算
        tools: usedTools
      }
    };
  }

  /**
   * 使用工具执行任务
   */
  private async executeWithTool(task: Task, tool: Tool): Promise<any> {
    switch (tool.type) {
      case 'skill':
        return await this.skillManager.executeSkill(tool.id, task.params);
      
      case 'mcp':
        return await this.mcpManager.callTool(tool.name, task.params);
      
      case 'adapter':
        const handlerName = typeof tool.handler === 'string' ? tool.handler : tool.id;
        return await this.adapterManager.call(handlerName, task.params);
      
      default:
        throw new Error(`未知工具类型: ${tool.type}`);
    }
  }

  /**
   * 5. 反馈学习
   */
  private async learn(result: Result): Promise<void> {
    if (!result.success) {
      // 失败案例也要记录
      logger.info('记录失败案例以供学习', { error: result.error });
      // TODO: 写入学习案例库
    } else {
      // 成功案例，更新 Skill 统计
      logger.info('任务成功，更新统计');
      // TODO: 更新 Skill 成功率
    }
  }
}
