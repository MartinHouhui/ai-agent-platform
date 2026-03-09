/**
 * MCP (Model Context Protocol) 管理器
 */

import { Task, Tool } from '../core/types';
import { logger } from '../utils/logger';

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
  handler: (params: any) => Promise<any>;
}

export class MCPManager {
  private tools: Map<string, MCPTool> = new Map();

  constructor() {
    this.loadDefaultTools();
    logger.info('MCP 管理器初始化', { toolCount: this.tools.size });
  }

  /**
   * 加载默认工具
   */
  private loadDefaultTools(): void {
    // 示例：飞书消息发送
    this.registerTool({
      name: 'feishu_send_message',
      description: '发送消息到飞书群聊或个人',
      inputSchema: {
        type: 'object',
        properties: {
          chat_id: { type: 'string', description: '群聊 ID' },
          message: { type: 'string', description: '消息内容' }
        },
        required: ['chat_id', 'message']
      },
      handler: async (params) => {
        logger.info('飞书发送消息', params);
        // TODO: 实际调用飞书 API
        return { success: true, messageId: 'msg_123' };
      }
    });

    // 示例：钉钉消息发送
    this.registerTool({
      name: 'dingtalk_send_message',
      description: '发送消息到钉钉群聊或个人',
      inputSchema: {
        type: 'object',
        properties: {
          chat_id: { type: 'string', description: '群聊 ID' },
          message: { type: 'string', description: '消息内容' }
        },
        required: ['chat_id', 'message']
      },
      handler: async (params) => {
        logger.info('钉钉发送消息', params);
        // TODO: 实际调用钉钉 API
        return { success: true, messageId: 'msg_456' };
      }
    });

    // 示例：数据查询
    this.registerTool({
      name: 'query_database',
      description: '执行 SQL 查询',
      inputSchema: {
        type: 'object',
        properties: {
          sql: { type: 'string', description: 'SQL 查询语句' },
          database: { type: 'string', description: '数据库名' }
        },
        required: ['sql']
      },
      handler: async (params) => {
        logger.info('查询数据库', params);
        // TODO: 实际查询数据库
        return { rows: [], rowCount: 0 };
      }
    });
  }

  /**
   * 注册工具
   */
  registerTool(tool: MCPTool): void {
    this.tools.set(tool.name, tool);
    logger.info('注册 MCP 工具', { name: tool.name });
  }

  /**
   * 查找工具
   */
  async findTool(task: Task): Promise<Tool | null> {
    // 根据任务描述匹配工具
    for (const tool of this.tools.values()) {
      if (task.description.toLowerCase().includes(tool.name.split('_')[0])) {
        return {
          id: tool.name,
          name: tool.name,
          description: tool.description,
          type: 'mcp',
          inputSchema: tool.inputSchema,
          handler: tool.handler
        };
      }
    }
    return null;
  }

  /**
   * 调用工具
   */
  async callTool(toolName: string, params: any): Promise<any> {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`工具不存在: ${toolName}`);
    }

    logger.info('调用 MCP 工具', { toolName, params });

    try {
      const result = await tool.handler(params);
      return result;
    } catch (error: any) {
      logger.error('MCP 工具调用失败', { toolName, error: error.message });
      throw error;
    }
  }

  /**
   * 列出所有工具
   */
  listTools(): MCPTool[] {
    return Array.from(this.tools.values());
  }
}
