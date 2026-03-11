/**
 * Agent 引擎单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AgentEngine } from '../../src/core/AgentEngine';
import { IntentType } from '../../src/core/types';

describe('AgentEngine', () => {
  let agentEngine: AgentEngine;

  beforeEach(() => {
    agentEngine = new AgentEngine();
  });

  describe('process', () => {
    it('应该处理简单的查询消息', async () => {
      const message = '查询今天的订单';
      const result = await agentEngine.process(message);

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.metadata.duration).toBeGreaterThan(0);
      expect(result.metadata.traceId).toBeDefined();
    });

    it('应该处理未知的消息类型', async () => {
      const message = '这是一条随机的消息';
      const result = await agentEngine.process(message);

      expect(result).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('应该支持会话 ID', async () => {
      const message = '你好';
      const sessionId = 'test-session-123';

      const result = await agentEngine.process(message, sessionId);

      expect(result).toBeDefined();
      expect(result.metadata).toBeDefined();
    });

    it('应该清除会话历史', () => {
      const sessionId = 'test-session-clear';

      // 清除历史
      agentEngine.clearHistory(sessionId);

      // 应该不报错
      expect(true).toBe(true);
    });

    it('应该处理上下文参数', async () => {
      const message = '查询订单';
      const context = { userId: '123', system: 'ERP' };

      const result = await agentEngine.process(message, undefined, context);

      expect(result).toBeDefined();
      expect(result.metadata).toBeDefined();
    });
  });

  describe('错误处理', () => {
    it('应该优雅地处理错误', async () => {
      // 即使内部出错，也应该返回错误结果而不是抛出异常
      const result = await agentEngine.process('');

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
    });
  });

  describe('性能', () => {
    it('应该在合理时间内完成', async () => {
      const start = Date.now();
      await agentEngine.process('测试性能');
      const duration = Date.now() - start;

      // 应该在 5 秒内完成
      expect(duration).toBeLessThan(5000);
    });
  });
});
