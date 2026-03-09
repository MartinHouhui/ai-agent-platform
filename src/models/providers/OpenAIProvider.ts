/**
 * OpenAI 模型提供商
 */

import axios from 'axios';
import { logger } from '../../utils/logger';

export class OpenAIProvider {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    this.baseUrl = baseUrl || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  }

  /**
   * 调用 GPT 模型
   */
  async call(
    model: string,
    prompt: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    }
  ): Promise<{ content: string; usage: any }> {
    if (!this.apiKey) {
      logger.warn('OpenAI API Key 未配置，使用模拟响应');
      return {
        content: `[模拟 OpenAI ${model}] ${prompt.substring(0, 100)}...`,
        usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 }
      };
    }

    try {
      const messages: any[] = [];
      
      if (options?.systemPrompt) {
        messages.push({ role: 'system', content: options.systemPrompt });
      }
      
      messages.push({ role: 'user', content: prompt });

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model,
          messages,
          temperature: options?.temperature || 0.7,
          max_tokens: options?.maxTokens || 2000,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const data = response.data;
      return {
        content: data.choices[0].message.content,
        usage: data.usage,
      };
    } catch (error: any) {
      logger.error('OpenAI 调用失败', {
        model,
        error: error.response?.data || error.message
      });
      throw new Error(`OpenAI 调用失败: ${error.message}`);
    }
  }

  /**
   * 获取 embedding
   */
  async getEmbedding(text: string, model: string = 'text-embedding-ada-002'): Promise<number[]> {
    if (!this.apiKey) {
      logger.warn('OpenAI API Key 未配置，返回空 embedding');
      return new Array(1536).fill(0);
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/embeddings`,
        {
          model,
          input: text,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      return response.data.data[0].embedding;
    } catch (error: any) {
      logger.error('OpenAI Embedding 失败', { error: error.message });
      throw error;
    }
  }
}
