/**
 * 用户认证服务
 */

import bcrypt from 'bcryptjs';
import { getRepository } from 'typeorm';
import { User } from '../entities/UserEntity';
import { generateToken } from '../middleware/auth';
import { logger } from '../utils/logger';

export class AuthService {
  private userRepository = getRepository(User);

  /**
   * 用户注册
   */
  async register(username: string, email: string, password: string): Promise<{ user: User; token: string }> {
    // 检查用户名是否已存在
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      throw new Error('用户名或邮箱已存在');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      role: 'user',
      isActive: true,
    });

    await this.userRepository.save(user);

    // 生成 token
    const token = generateToken(user);

    logger.info('用户注册成功', { userId: user.id, username: user.username });

    return { user, token };
  }

  /**
   * 用户登录
   */
  async login(username: string, password: string): Promise<{ user: User; token: string }> {
    // 查找用户
    const user = await this.userRepository.findOne({
      where: [{ username }, { email: username }], // 支持用户名或邮箱登录
    });

    if (!user) {
      throw new Error('用户名或密码错误');
    }

    if (!user.isActive) {
      throw new Error('账户已被禁用');
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('用户名或密码错误');
    }

    // 更新最后登录时间
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // 生成 token
    const token = generateToken(user);

    logger.info('用户登录成功', { userId: user.id, username: user.username });

    return { user, token };
  }

  /**
   * 获取用户信息
   */
  async getUserById(userId: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    return user;
  }

  /**
   * 更新用户信息
   */
  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('用户不存在');
    }

    // 不允许直接更新密码
    delete updates.password;
    delete updates.id;

    Object.assign(user, updates);
    await this.userRepository.save(user);

    logger.info('用户信息更新', { userId, updates: Object.keys(updates) });

    return user;
  }

  /**
   * 修改密码
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('用户不存在');
    }

    // 验证旧密码
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      throw new Error('原密码错误');
    }

    // 加密新密码
    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    logger.info('密码修改成功', { userId });
  }

  /**
   * 创建管理员账户（仅用于初始化）
   */
  async createAdminUser(): Promise<void> {
    const existingAdmin = await this.userRepository.findOne({
      where: { username: 'admin' },
    });

    if (existingAdmin) {
      logger.info('管理员账户已存在，跳过创建');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123456', 10);
    const admin = this.userRepository.create({
      username: 'admin',
      email: 'admin@ai-agent-platform.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
    });

    await this.userRepository.save(admin);
    logger.info('管理员账户创建成功', { username: 'admin' });
  }
}
