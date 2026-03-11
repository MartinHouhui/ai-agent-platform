/**
 * Skill 实体 - 存储学习到的技能
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('skills')
export class SkillEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  version: string;

  @Column({ type: 'text' })
  description: string;

  @Index()
  @Column({ type: 'varchar', length: 50, nullable: true })
  system: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  domain: string;

  @Column({ type: 'text', nullable: true })
  intentPattern: string;

  @Column({ type: 'enum', enum: ['code', 'prompt', 'hybrid'] })
  executorType: 'code' | 'prompt' | 'hybrid';

  @Column({ type: 'text', nullable: true })
  executorCode: string;

  @Column({ type: 'text', nullable: true })
  executorPrompt: string;

  @Column({ type: 'text' })
  learnedFrom: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 1.0 })
  successRate: number;

  @Column({ type: 'int', default: 0 })
  usageCount: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
