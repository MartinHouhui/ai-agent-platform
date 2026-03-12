/**
 * 通义千问客户端（通过 Anthropic 兼容 API）
 */

import Anthropic from '@anthropic-ai/sdk';
import { logger } from '../utils/logger';

export interface QwenMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface QwenResponse {
  content: string;
  model: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class QwenClient {
  private client: Anthropic;
  private model: string;
  private smallFastModel: string;

  constructor() {
    const authToken = process.env.ANTHROPIC_AUTH_TOKEN;
    const baseUrl = process.env.ANTHROPIC_BASE_URL || 'https://coding.dashscope.aliyuncs.com/apps/anthropic';
    this.model = process.env.ANTHROPIC_MODEL || 'qwen3.5-plus';
    this.smallFastModel = process.env.ANTHROPIC_SMALL_FAST_MODEL || 'qwen3.5-plus';

    if (!authToken) {
      logger.warn('ANTHROPIC_AUTH_TOKEN 未配置，将使用降级模式');
    }

    this.client = new Anthropic({
      apiKey: authToken || 'dummy-key',
      baseURL: baseUrl,
    });

    logger.info('通义千问客户端初始化', {
      model: this.model,
      smallFastModel: this.smallFastModel,
      baseUrl
    });
  }

  /**
   * 发送消息
   */
  async chat(
    messages: QwenMessage[],
    options?: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
      system?: string;
    }
  ): Promise<QwenResponse> {
    const model = options?.model || this.model;
    const maxTokens = options?.maxTokens || 4096;
    const temperature = options?.temperature || 0.7;

    try {
      logger.debug('调用通义千问', { model, messageCount: messages.length });

      const response = await this.client.messages.create({
        model,
        max_tokens: maxTokens,
        temperature,
        system: options?.system,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      });

      const content = response.content
        .filter(block => block.type === 'text')
        .map(block => (block as any).text)
        .join('');

      return {
        content,
        model: response.model,
        usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens
        }
      };

    } catch (error: any) {
      logger.error('通义千问调用失败', {
        error: error.message,
        model
      });
      throw error;
    }
  }

  /**
   * 快速响应（使用小模型）
   */
  async fastChat(
    messages: QwenMessage[],
    options?: {
      maxTokens?: number;
      temperature?: number;
      system?: string;
    }
  ): Promise<QwenResponse> {
    return this.chat(messages, {
      ...options,
      model: this.smallFastModel
    });
  }

  /**
   * 意图识别
   */
  async recognizeIntent(userMessage: string): Promise<any> {
    const systemPrompt = `你是一个意图识别专家。分析用户消息的意图，返回严格的 JSON 格式（不要包含任何其他文字）：

{
  "type": "query|create|update|delete|analyze|integrate|chat|unknown",
  "action": "具体动作描述（简洁明了）",
  "entities": {
    "system": "系统名称（如 ERP、CRM）",
    "operation": "操作类型",
    "target": "目标对象"
  },
  "confidence": 0.0-1.0
}`;

    const response = await this.fastChat(
      [{ role: 'user', content: userMessage }],
      {
        system: systemPrompt,
        temperature: 0.3,
        maxTokens: 500
      }
    );

    try {
      return JSON.parse(response.content);
    } catch (error) {
      logger.warn('意图识别 JSON 解析失败', { content: response.content });
      return {
        type: 'chat',
        action: userMessage,
        confidence: 0.5
      };
    }
  }

  /**
   * 生成任务列表
   */
  async planTasks(intent: any): Promise<any[]> {
    const systemPrompt = `你是一个任务规划专家。根据用户意图，生成详细的任务列表，返回严格的 JSON 格式：

[
  {
    "type": "data_query|api_call|computation|notification",
    "description": "任务描述",
    "parameters": {},
    "dependencies": []
  }
]`;

    const response = await this.fastChat(
      [{ role: 'user', content: `用户意图：${JSON.stringify(intent)}` }],
      {
        system: systemPrompt,
        temperature: 0.5,
        maxTokens: 1000
      }
    );

    try {
      return JSON.parse(response.content);
    } catch (error) {
      logger.warn('任务规划 JSON 解析失败', { content: response.content });
      return [{
        type: 'data_query',
        description: intent.action,
        parameters: {},
        dependencies: []
      }];
    }
  }

  /**
   * 生成回复
   */
  async generateResponse(
    userMessage: string,
    context?: string,
    history?: QwenMessage[]
  ): Promise<string> {
    const messages: QwenMessage[] = history || [];
    
    if (context) {
      messages.push({
        role: 'user',
        content: `背景信息：\n${context}\n\n用户问题：${userMessage}`
      });
    } else {
      messages.push({ role: 'user', content: userMessage });
    }

    const response = await this.chat(messages, {
      temperature: 0.7,
      maxTokens: 2000
    });

    return response.content;
  }
}

// 单例实例
export const qwenClient = new QwenClient();
