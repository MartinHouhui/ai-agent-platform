/**
 * Agent 引擎 - 核心编排逻辑
 */

import { v4 as uuidv4 } from 'uuid';
import { Intent, Task, Tool, Result, IntentType, TaskStatus, TaskType } from './types';
import { ModelRouter } from '../models/ModelRouter';
import { SkillManager } from '../skills/SkillManager';
import { MCPManager } from '../mcp/MCPManager';
import { AdapterManager } from '../adapters/AdapterManager';
import { logger } from '../utils/logger';

export class AgentEngine {
  private modelRouter: ModelRouter;
  private skillManager: SkillManager;
  private mcpManager: MCPManager;
  private adapterManager: AdapterManager;
  private conversationHistory: Map<string, any[]> = new Map();

  constructor() {
    this.modelRouter = new ModelRouter();
    this.skillManager = new SkillManager();
    this.mcpManager = new MCPManager();
    this.adapterManager = new AdapterManager();
  }

  /**
   * 主入口：处理用户消息
   */
  async process(
    userMessage: string,
    sessionId?: string,
    context?: any
  ): Promise<Result> {
    const startTime = Date.now();
    const traceId = uuidv4();

    try {
      logger.info('[AgentEngine] 开始处理', { traceId, message: userMessage });

      // 1. 意图理解
      const intent = await this.understandIntent(userMessage, sessionId);

      // 2. 任务编排
      const tasks = await this.planTasks(intent, context);

      // 3. 工具选择
      const tools = await this.selectTools(tasks);

      // 4. 执行
      const result = await this.execute(tasks, tools);

      // 5. 反馈学习
      await this.learn(result, intent, tasks);

      const duration = Date.now() - startTime;
      logger.info('[AgentEngine] 处理完成', {
        traceId,
        duration,
        success: result.success
      });

      return {
        ...result,
        metadata: {
          ...result.metadata,
          duration,
          traceId
        }
      };

    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error('[AgentEngine] 处理失败', {
        traceId,
        error: error.message,
        stack: error.stack
      });

      return {
        success: false,
        error: error.message,
        metadata: {
          duration,
          traceId
        }
      };
    }
  }

  /**
   * 1. 意图理解 - 使用 LLM 分析用户意图
   */
  private async understandIntent(
    userMessage: string,
    sessionId?: string
  ): Promise<Intent> {
    try {
      // 获取对话历史
      const history = sessionId ? this.conversationHistory.get(sessionId) || [] : [];

      const prompt = `
你是一个意图识别专家。分析以下用户消息的意图，返回严格的 JSON 格式（不要包含任何其他文字）：

{
  "type": "query|create|update|delete|analyze|integrate|chat|unknown",
  "action": "具体动作描述（简洁明了）",
  "entities": {
    "system": "系统名称（如 ERP、CRM）",
    "operation": "操作类型",
    "target": "目标对象"
  },
  "confidence": 0.0-1.0
}

用户消息：${userMessage}

${history.length > 0 ? `对话历史：\n${history.slice(-3).map(h => `${h.role}: ${h.content}`).join('\n')}` : ''}
`;

      const model = await this.modelRouter.selectModel('intent-understanding');
      const response = await this.modelRouter.call(model, prompt);

      // 解析 JSON
      let parsed;
      try {
        // 提取 JSON（可能包含 markdown 代码块）
        const jsonMatch = response.content.match(/```json\s*([\s\S]*?)\s*```/) ||
                         response.content.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : response.content;
        parsed = JSON.parse(jsonStr);
      } catch (parseError) {
        logger.warn('[AgentEngine] JSON 解析失败，使用降级策略', {
          content: response.content
        });
        // 降级：根据关键词判断
        parsed = this.fallbackIntentDetection(userMessage);
      }

      const intent: Intent = {
        id: uuidv4(),
        type: this.validateIntentType(parsed.type),
        action: parsed.action || userMessage,
        entities: parsed.entities || {},
        confidence: parsed.confidence || 0.5,
        rawText: userMessage
      };

      // 更新对话历史
      if (sessionId) {
        const history = this.conversationHistory.get(sessionId) || [];
        history.push({ role: 'user', content: userMessage });
        this.conversationHistory.set(sessionId, history.slice(-10)); // 保留最近 10 条
      }

      logger.info('[AgentEngine] 意图识别完成', { intent });

      return intent;

    } catch (error: any) {
      logger.error('[AgentEngine] 意图理解失败', { error: error.message });
      return {
        id: uuidv4(),
        type: IntentType.UNKNOWN,
        action: userMessage,
        entities: {},
        confidence: 0,
        rawText: userMessage
      };
    }
  }

  /**
   * 降级意图检测 - 基于关键词
   */
  private fallbackIntentDetection(message: string): any {
    const lowerMsg = message.toLowerCase();

    if (/查询|搜索|获取|找|显示|列出|有多少/.test(lowerMsg)) {
      return { type: 'query', confidence: 0.6 };
    }
    if (/创建|新增|添加|建立|生成/.test(lowerMsg)) {
      return { type: 'create', confidence: 0.6 };
    }
    if (/更新|修改|编辑|变更/.test(lowerMsg)) {
      return { type: 'update', confidence: 0.6 };
    }
    if (/删除|移除|清除/.test(lowerMsg)) {
      return { type: 'delete', confidence: 0.6 };
    }
    if (/分析|统计|报表|趋势|对比/.test(lowerMsg)) {
      return { type: 'analyze', confidence: 0.6 };
    }
    if (/对接|集成|连接|接入/.test(lowerMsg)) {
      return { type: 'integrate', confidence: 0.6 };
    }

    return { type: 'chat', confidence: 0.5 };
  }

  /**
   * 验证意图类型
   */
  private validateIntentType(type: string): IntentType {
    const validTypes = Object.values(IntentType);
    return validTypes.includes(type as IntentType) ? type as IntentType : IntentType.UNKNOWN;
  }

  /**
   * 2. 任务编排 - 根据意图生成任务列表
   */
  private async planTasks(intent: Intent, context?: any): Promise<Task[]> {
    const tasks: Task[] = [];

    switch (intent.type) {
      case IntentType.QUERY:
        tasks.push(this.createTask(TaskType.DATA_QUERY, intent.action, intent.entities));
        break;

      case IntentType.CREATE:
        tasks.push(this.createTask(TaskType.API_CALL, intent.action, intent.entities));
        break;

      case IntentType.UPDATE:
        tasks.push(this.createTask(TaskType.API_CALL, intent.action, intent.entities));
        break;

      case IntentType.DELETE:
        tasks.push(this.createTask(TaskType.API_CALL, intent.action, intent.entities));
        break;

      case IntentType.ANALYZE:
        tasks.push(this.createTask(TaskType.DATA_ANALYZE, intent.action, intent.entities));
        break;

      case IntentType.INTEGRATE:
        // 系统集成是复杂任务，需要多个步骤
        tasks.push(
          this.createTask(TaskType.SYSTEM_INTEGRATE, '发现 API', {
            ...intent.entities,
            step: 'discover'
          })
        );
        tasks.push(
          this.createTask(TaskType.SYSTEM_INTEGRATE, '配置适配器', {
            ...intent.entities,
            step: 'configure'
          })
        );
        tasks.push(
          this.createTask(TaskType.SKILL_LEARN, '学习对接经验', {
            ...intent.entities,
            step: 'learn'
          })
        );
        break;

      case IntentType.CHAT:
        tasks.push(this.createTask(TaskType.CHAT, intent.action, {
          message: intent.rawText,
          ...intent.entities
        }));
        break;

      default:
        tasks.push(this.createTask(TaskType.UNKNOWN, intent.action, intent.entities));
    }

    logger.info('[AgentEngine] 任务编排完成', { taskCount: tasks.length });
    return tasks;
  }

  /**
   * 创建任务
   */
  private createTask(
    type: TaskType,
    description: string,
    params: Record<string, any>
  ): Task {
    return {
      id: uuidv4(),
      type,
      description,
      params,
      status: TaskStatus.PENDING,
      createdAt: new Date()
    };
  }

  /**
   * 3. 工具选择 - 为每个任务匹配合适的工具
   */
  private async selectTools(tasks: Task[]): Promise<Tool[]> {
    const tools: Tool[] = [];

    for (const task of tasks) {
      let selectedTool: Tool | null = null;

      // 优先级：Skill > MCP > Adapter > Model

      // 1. 查找匹配的 Skill
      if (task.type !== TaskType.CHAT && task.type !== TaskType.UNKNOWN) {
        const skill = await this.skillManager.findMatchingSkill(task);
        if (skill) {
          selectedTool = {
            id: skill.id,
            name: skill.name,
            description: skill.description,
            type: 'skill',
            inputSchema: {},
            handler: skill.executor.code || skill.executor.prompt || ''
          };
          logger.info('[AgentEngine] 匹配到 Skill', { skill: skill.name });
        }
      }

      // 2. 查找 MCP 工具
      if (!selectedTool) {
        const mcpTool = await this.mcpManager.findTool(task);
        if (mcpTool) {
          selectedTool = mcpTool;
          logger.info('[AgentEngine] 匹配到 MCP 工具', { tool: mcpTool.name });
        }
      }

      // 3. 查找 Adapter
      if (!selectedTool && task.params.system) {
        const adapter = await this.adapterManager.findAdapter(task);
        if (adapter) {
          selectedTool = {
            id: adapter.name,
            name: adapter.name,
            description: `${adapter.name} 适配器`,
            type: 'adapter',
            inputSchema: {},
            handler: adapter.name
          };
          logger.info('[AgentEngine] 匹配到 Adapter', { adapter: adapter.name });
        }
      }

      if (selectedTool) {
        tools.push(selectedTool);
      } else {
        // 没有工具，将使用模型直接处理
        tools.push({
          id: `model-${task.id}`,
          name: 'Model',
          description: '使用 LLM 处理',
          type: 'skill',
          inputSchema: {},
          handler: 'model'
        });
      }
    }

    logger.info('[AgentEngine] 工具选择完成', { toolCount: tools.length });
    return tools;
  }

  /**
   * 4. 执行任务
   */
  private async execute(tasks: Task[], tools: Tool[]): Promise<Result> {
    const results: any[] = [];
    const usedTools: string[] = [];

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const tool = tools[i];

      task.status = TaskStatus.RUNNING;
      logger.info('[AgentEngine] 开始执行任务', { taskId: task.id, type: task.type });

      try {
        let result: any;

        if (tool.handler === 'model') {
          // 直接使用模型处理
          result = await this.executeWithModel(task);
        } else {
          // 使用工具执行
          result = await this.executeWithTool(task, tool);
          usedTools.push(tool.id);
        }

        task.status = TaskStatus.SUCCESS;
        task.result = result;
        task.completedAt = new Date();
        results.push(result);

        logger.info('[AgentEngine] 任务执行成功', { taskId: task.id });

      } catch (error: any) {
        task.status = TaskStatus.FAILED;
        task.error = error.message;
        task.completedAt = new Date();

        logger.error('[AgentEngine] 任务执行失败', {
          taskId: task.id,
          error: error.message
        });

        // 单个任务失败不中断整个流程，继续执行后续任务
        results.push({ error: error.message });
      }
    }

    const success = tasks.every(t => t.status === TaskStatus.SUCCESS);

    return {
      success,
      data: results.length === 1 ? results[0] : results,
      metadata: {
        duration: 0,
        tools: usedTools,
        tasks: tasks.map(t => ({
          id: t.id,
          type: t.type,
          status: t.status
        }))
      }
    };
  }

  /**
   * 使用模型直接处理任务
   */
  private async executeWithModel(task: Task): Promise<any> {
    const model = await this.modelRouter.selectModel('general');
    const response = await this.modelRouter.call(model, task.description);
    return response.content;
  }

  /**
   * 使用工具执行任务
   */
  private async executeWithTool(task: Task, tool: Tool): Promise<any> {
    switch (tool.type) {
      case 'skill':
        if (tool.handler === 'model') {
          return await this.executeWithModel(task);
        }
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
   * 5. 反馈学习 - 从成功/失败中学习
   */
  private async learn(result: Result, intent: Intent, tasks: Task[]): Promise<void> {
    try {
      if (result.success) {
        logger.info('[AgentEngine] 学习成功案例', { intent: intent.type });

        // 更新使用的 Skill 的成功率
        if (result.metadata.tools && result.metadata.tools.length > 0) {
          for (const toolId of result.metadata.tools) {
            await this.skillManager.updateStats(toolId, true);
          }
        }
      } else {
        logger.info('[AgentEngine] 记录失败案例', {
          intent: intent.type,
          error: result.error
        });

        // 记录失败案例供后续学习
        // TODO: 写入学习案例库
      }
    } catch (error: any) {
      logger.error('[AgentEngine] 学习过程失败', { error: error.message });
    }
  }

  /**
   * 清除对话历史
   */
  clearHistory(sessionId?: string): void {
    if (sessionId) {
      this.conversationHistory.delete(sessionId);
    } else {
      this.conversationHistory.clear();
    }
  }
}
