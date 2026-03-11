/**
 * 认证服务单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import { AuthService } from '../../src/services/AuthService';
import { User } from '../../src/entities/UserEntity';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('register', () => {
    it('应该成功注册新用户', async () => {
      const username = 'testuser';
      const email = 'test@example.com';
      const password = 'password123';

      const { user, token } = await authService.register(username, email, password);

      expect(user).toBeDefined();
      expect(user.username).toBe(username);
      expect(user.email).toBe(email);
      expect(user.role).toBe('user');
      expect(user.password).not.toBe(password); // 密码应该被加密
      expect(token).toBeDefined();
    });

    it('应该拒绝重复的用户名', async () => {
      const username = 'duplicate';
      const email1 = 'email1@example.com';
      const email2 = 'email2@example.com';
      const password = 'password123';

      // 第一次注册
      await authService.register(username, email1, password);

      // 第二次注册（相同用户名）
      await expect(
        authService.register(username, email2, password)
      ).rejects.toThrow('用户名或邮箱已存在');
    });

    it('应该拒绝重复的邮箱', async () => {
      const username1 = 'user1';
      const username2 = 'user2';
      const email = 'same@example.com';
      const password = 'password123';

      // 第一次注册
      await authService.register(username1, email, password);

      // 第二次注册（相同邮箱）
      await expect(
        authService.register(username2, email, password)
      ).rejects.toThrow('用户名或邮箱已存在');
    });

    it('应该正确加密密码', async () => {
      const username = 'testuser';
      const email = 'test@example.com';
      const password = 'password123';

      const { user } = await authService.register(username, email, password);

      const isValid = await bcrypt.compare(password, user.password);
      expect(isValid).toBe(true);
    });
  });

  describe('login', () => {
    it('应该成功登录（使用用户名）', async () => {
      const username = 'loginuser';
      const email = 'login@example.com';
      const password = 'password123';

      // 先注册
      await authService.register(username, email, password);

      // 登录
      const { user, token } = await authService.login(username, password);

      expect(user).toBeDefined();
      expect(user.username).toBe(username);
      expect(token).toBeDefined();
    });

    it('应该成功登录（使用邮箱）', async () => {
      const username = 'loginuser2';
      const email = 'login2@example.com';
      const password = 'password123';

      // 先注册
      await authService.register(username, email, password);

      // 使用邮箱登录
      const { user, token } = await authService.login(email, password);

      expect(user).toBeDefined();
      expect(user.email).toBe(email);
      expect(token).toBeDefined();
    });

    it('应该拒绝错误的密码', async () => {
      const username = 'wrongpass';
      const email = 'wrong@example.com';
      const password = 'password123';
      const wrongPassword = 'wrongpassword';

      // 先注册
      await authService.register(username, email, password);

      // 使用错误密码登录
      await expect(
        authService.login(username, wrongPassword)
      ).rejects.toThrow('用户名或密码错误');
    });

    it('应该拒绝不存在的用户', async () => {
      await expect(
        authService.login('nonexistent', 'password')
      ).rejects.toThrow('用户名或密码错误');
    });
  });

  describe('changePassword', () => {
    it('应该成功修改密码', async () => {
      const username = 'changepass';
      const email = 'change@example.com';
      const oldPassword = 'oldpassword';
      const newPassword = 'newpassword123';

      // 先注册
      const { user } = await authService.register(username, email, oldPassword);

      // 修改密码
      await authService.changePassword(user.id, oldPassword, newPassword);

      // 使用新密码登录
      const loginResult = await authService.login(username, newPassword);
      expect(loginResult.user).toBeDefined();
    });

    it('应该拒绝错误的旧密码', async () => {
      const username = 'changepass2';
      const email = 'change2@example.com';
      const password = 'password123';
      const wrongOldPassword = 'wrongold';
      const newPassword = 'newpassword123';

      // 先注册
      const { user } = await authService.register(username, email, password);

      // 使用错误的旧密码修改
      await expect(
        authService.changePassword(user.id, wrongOldPassword, newPassword)
      ).rejects.toThrow('原密码错误');
    });
  });

  describe('createAdminUser', () => {
    it('应该创建管理员账户', async () => {
      await authService.createAdminUser();

      // 验证可以登录
      const { user } = await authService.login('admin', 'admin123456');
      expect(user.role).toBe('admin');
    });

    it('应该跳过已存在的管理员账户', async () => {
      // 第一次创建
      await authService.createAdminUser();

      // 第二次创建（应该跳过）
      await authService.createAdminUser();

      // 验证仍然可以登录
      const { user } = await authService.login('admin', 'admin123456');
      expect(user).toBeDefined();
    });
  });
});
