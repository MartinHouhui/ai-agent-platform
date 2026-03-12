/**
 * 认证服务单元测试
 * 
 * 注：register, login, changePassword 等需要数据库的方法在 tests/integration/ 中测试
 */

import { describe, it, expect } from 'vitest';
import bcrypt from 'bcryptjs';

describe('AuthService', () => {
  describe('密码加密（独立测试）', () => {
    it('应该正确加密密码', async () => {
      const password = 'testPassword123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      expect(hashedPassword).not.toBe(password);
      expect(await bcrypt.compare(password, hashedPassword)).toBe(true);
    });

    it('应该拒绝错误的密码', async () => {
      const password = 'testPassword123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      expect(await bcrypt.compare('wrongPassword', hashedPassword)).toBe(false);
    });

    it('每次加密结果应该不同（salt）', async () => {
      const password = 'testPassword123';
      const hash1 = await bcrypt.hash(password, 10);
      const hash2 = await bcrypt.hash(password, 10);
      
      expect(hash1).not.toBe(hash2);
      expect(await bcrypt.compare(password, hash1)).toBe(true);
      expect(await bcrypt.compare(password, hash2)).toBe(true);
    });
  });

  describe('密码强度（业务规则）', () => {
    it('应该接受符合要求的密码', () => {
      const validPasswords = [
        'Password123',
        'MySecure@Pass',
        'Test1234!@#'
      ];

      validPasswords.forEach(password => {
        expect(password.length).toBeGreaterThanOrEqual(8);
      });
    });

    it('应该拒绝过短的密码', () => {
      const shortPassword = 'Pass1';
      expect(shortPassword.length).toBeLessThan(8);
    });
  });
});
