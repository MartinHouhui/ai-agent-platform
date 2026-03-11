/**
 * 验证中间件单元测试
 */

import { describe, it, expect } from 'vitest';
import { validateSkill, validateAdapter } from '../../middleware/validation';

describe('Validation Middleware', () => {
  describe('validateSkill', () => {
    it('应该验证有效的 Skill 数据', () => {
      const validSkill = {
        name: '查询订单',
        type: 'code',
        description: '查询订单信息',
        code: 'async function execute() { return true; }',
      };

      const { error, value } = validateSkill(validSkill);

      expect(error).toBeUndefined();
      expect(value).toMatchObject(validSkill);
    });

    it('应该拒绝缺少必填字段的 Skill', () => {
      const invalidSkill = {
        name: '查询订单',
        // 缺少 type
      };

      const { error } = validateSkill(invalidSkill);

      expect(error).toBeDefined();
    });

    it('应该拒绝无效的 type', () => {
      const invalidSkill = {
        name: '查询订单',
        type: 'invalid-type',
        code: 'some code',
      };

      const { error } = validateSkill(invalidSkill);

      expect(error).toBeDefined();
    });

    it('应该拒绝空的 name', () => {
      const invalidSkill = {
        name: '',
        type: 'code',
        code: 'some code',
      };

      const { error } = validateSkill(invalidSkill);

      expect(error).toBeDefined();
    });

    it('应该拒绝过长的 name', () => {
      const invalidSkill = {
        name: 'a'.repeat(256), // 超过 255 字符
        type: 'code',
        code: 'some code',
      };

      const { error } = validateSkill(invalidSkill);

      expect(error).toBeDefined();
    });
  });

  describe('validateAdapter', () => {
    it('应该验证有效的 Adapter 数据', () => {
      const validAdapter = {
        name: 'natural-erp',
        type: 'ERP',
        apiUrl: 'https://erp.example.com/api',
        authType: 'api_key',
        apiKey: 'test-api-key',
      };

      const { error, value } = validateAdapter(validAdapter);

      expect(error).toBeUndefined();
      expect(value).toMatchObject(validAdapter);
    });

    it('应该拒绝缺少必填字段的 Adapter', () => {
      const invalidAdapter = {
        name: 'natural-erp',
        // 缺少 type 和 apiUrl
      };

      const { error } = validateAdapter(invalidAdapter);

      expect(error).toBeDefined();
    });

    it('应该拒绝无效的 URL', () => {
      const invalidAdapter = {
        name: 'natural-erp',
        type: 'ERP',
        apiUrl: 'not-a-valid-url',
      };

      const { error } = validateAdapter(invalidAdapter);

      expect(error).toBeDefined();
    });

    it('应该拒绝无效的 type', () => {
      const invalidAdapter = {
        name: 'natural-erp',
        type: 'INVALID',
        apiUrl: 'https://erp.example.com/api',
      };

      const { error } = validateAdapter(invalidAdapter);

      expect(error).toBeDefined();
    });

    it('应该允许有效的认证类型', () => {
      const authTypes = ['api_key', 'oauth', 'basic', 'none'];

      authTypes.forEach((authType) => {
        const adapter = {
          name: 'test-adapter',
          type: 'ERP',
          apiUrl: 'https://example.com/api',
          authType,
        };

        const { error } = validateAdapter(adapter);
        expect(error).toBeUndefined();
      });
    });
  });
});
