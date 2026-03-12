/**
 * 验证中间件单元测试
 */

import { describe, it, expect } from 'vitest';
import { validateSkillData, validateAdapterData } from '../../middleware/validation';

describe('Validation Middleware', () => {
  describe('validateSkill', () => {
    it('应该验证有效的 Skill 数据', () => {
      const validSkill = {
        name: '查询订单',
        system_type: 'ERP',
        domain: '订单管理',
        description: '查询订单信息'
      };

      const { error, value } = validateSkillData(validSkill);

      expect(error).toBeUndefined();
      expect(value.name).toBe('查询订单');
      expect(value.system_type).toBe('ERP');
      expect(value.domain).toBe('订单管理');
    });

    it('应该拒绝缺少必填字段的 Skill', () => {
      const invalidSkill = {
        name: '查询订单',
        // 缺少 system_type 和 domain
      };

      const { error } = validateSkillData(invalidSkill);

      expect(error).toBeDefined();
    });

    it('应该拒绝空的 name', () => {
      const invalidSkill = {
        name: '',
        system_type: 'ERP',
        domain: '订单管理'
      };

      const { error } = validateSkillData(invalidSkill);

      expect(error).toBeDefined();
    });

    it('应该拒绝过长的 name', () => {
      const invalidSkill = {
        name: 'a'.repeat(256), // 超过 255 字符
        system_type: 'ERP',
        domain: '订单管理'
      };

      const { error } = validateSkillData(invalidSkill);

      expect(error).toBeDefined();
    });

    it('应该允许可选字段', () => {
      const skill = {
        name: '测试技能',
        system_type: 'ERP',
        domain: '测试'
      };

      const { error, value } = validateSkillData(skill);

      expect(error).toBeUndefined();
      expect(value.name).toBe('测试技能');
    });
  });

  describe('validateAdapter', () => {
    it('应该验证有效的 Adapter 数据', () => {
      const validAdapter = {
        name: 'natural-erp',
        type: 'ERP',
        baseUrl: 'https://erp.example.com/api'
      };

      const { error, value } = validateAdapterData(validAdapter);

      expect(error).toBeUndefined();
      expect(value.name).toBe('natural-erp');
      expect(value.type).toBe('ERP');
      expect(value.baseUrl).toBe('https://erp.example.com/api');
    });

    it('应该拒绝缺少必填字段的 Adapter', () => {
      const invalidAdapter = {
        name: 'natural-erp',
        // 缺少 type 和 baseUrl
      };

      const { error } = validateAdapterData(invalidAdapter);

      expect(error).toBeDefined();
    });

    it('应该拒绝无效的 URL', () => {
      const invalidAdapter = {
        name: 'natural-erp',
        type: 'ERP',
        baseUrl: 'not-a-valid-url'
      };

      const { error } = validateAdapterData(invalidAdapter);

      expect(error).toBeDefined();
    });

    it('应该拒绝空的 name', () => {
      const invalidAdapter = {
        name: '',
        type: 'ERP',
        baseUrl: 'https://erp.example.com/api'
      };

      const { error } = validateAdapterData(invalidAdapter);

      expect(error).toBeDefined();
    });

    it('应该允许可选的 config 字段', () => {
      const adapter = {
        name: 'test-adapter',
        type: 'ERP',
        baseUrl: 'https://example.com/api',
        config: { apiKey: 'test' }
      };

      const { error, value } = validateAdapterData(adapter);

      expect(error).toBeUndefined();
      expect(value.config).toEqual({ apiKey: 'test' });
    });
  });
});
