/**
 * 通义千问（阿里云）模型提供商
 */

import axios from 'axios';
import { logger } from '../../utils/logger';

export class QwenProvider {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ALIBABA_API_KEY || '';
    this.baseUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
  }

  /**
   * 调用通义千问模型
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
      logger.warn('通义千问 API Key 未配置，使用模拟响应');
      return {
        content: `[模拟通义千问 ${model}] ${prompt.substring(0, 100)}...`,
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
        this.baseUrl,
        {
          model,
          input: { messages },
          parameters: {
            temperature: options?.temperature || 0.7,
            max_tokens: options?.maxTokens || 2000,
          },
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
        content: data.output.text || data.output.choices[0].message.content,
        usage: data.usage,
      };
    } catch (error: any) {
      logger.error('通义千问调用失败', {
        model,
        error: error.response?.data || error.message
      });
      throw new Error(`通义千问调用失败: ${error.message}`);
    }
  }

  /**
   * 获取 embedding
   */
  async getEmbedding(text: string): Promise<number[]> {
    if (!this.apiKey) {
      logger.warn('通义千问 API Key 未配置，返回空 embedding');
      return new Array(1536).fill(0);
    }

    try {
      const response = await axios.post(
        'https://dashscope.aliyuncs.com/api/v1/services/embeddings/text-embedding/text-embedding',
        {
          model: 'text-embedding-v1',
          input: { texts: [text] },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      return response.data.output.embeddings[0].embedding;
    } catch (error: any) {
      logger.error('通义千问 Embedding 失败', { error: error.message });
      throw error;
    }
  }
}
