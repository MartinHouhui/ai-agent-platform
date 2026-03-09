/**
 * 学习案例实体 - 记录每次对接的经验
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('learning_cases')
export class LearningCaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  taskDescription: string;

  @Index()
  @Column({ length: 100 })
  systemName: string;

  @Column({ length: 50 })
  systemType: string;

  @Column({ type: 'text' })
  userRequest: string;

  @Column({ type: 'text', nullable: true })
  apiDocsUrl: string;

  @Column({ type: 'text', nullable: true })
  apiDocsContent: string;

  @Column({ type: 'simple-json' })
  attempts: Array<{
    approach: string;
    timestamp: Date;
    result: string;
  }>;

  @Column()
  success: boolean;

  @Column({ type: 'text' })
  finalSolution: string;

  @Column({ type: 'uuid', nullable: true })
  generatedSkillId: string;

  @Column({ type: 'text', nullable: true })
  lessonsLearned: string;

  @Column({ type: 'int' })
  timeSpent: number; // 秒

  @CreateDateColumn()
  createdAt: Date;
}
