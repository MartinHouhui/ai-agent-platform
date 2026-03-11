/**
 * 认证服务单元测试（简化版）
 */

import { describe, it, expect } from 'vitest';
import bcrypt from 'bcryptjs';
import { generateToken, verifyToken } from '../../src/middleware/auth';

describe('Auth Utilities', () => {
  describe('generateToken', () => {
    it('应该生成有效的 JWT Token', () => {
      const user = {
        id: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
      };

      const token = generateToken(user);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT 有 3 部分
    });
  });

  describe('verifyToken', () => {
    it('应该验证有效的 Token', () => {
      const user = {
        id: 'test-user-id',
        username: 'testuser',
        email: 'test@example.com',
        role: 'user',
      };

      const token = generateToken(user);
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(user.id);
      expect(decoded.username).toBe(user.username);
      expect(decoded.email).toBe(user.email);
      expect(decoded.role).toBe(user.role);
    });

    it('应该拒绝无效的 Token', () => {
      const invalidToken = 'invalid-token-string';
      const decoded = verifyToken(invalidToken);

      expect(decoded).toBeNull();
    });
  });

  describe('bcrypt', () => {
    it('应该正确加密密码', async () => {
      const password = 'testpassword123';
      const hashedPassword = await bcrypt.hash(password, 10);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
    });

    it('应该正确验证密码', async () => {
      const password = 'testpassword123';
      const hashedPassword = await bcrypt.hash(password, 10);

      const isValid = await bcrypt.compare(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('应该拒绝错误的密码', async () => {
      const password = 'testpassword123';
      const wrongPassword = 'wrongpassword';
      const hashedPassword = await bcrypt.hash(password, 10);

      const isValid = await bcrypt.compare(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });
  });
});
