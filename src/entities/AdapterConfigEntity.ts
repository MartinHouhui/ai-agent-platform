/**
 * 适配器配置实体 - 存储业务系统的对接配置
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('adapter_configs')
export class AdapterConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ length: 100, unique: true })
  name: string;

  @Column({ length: 50 })
  type: string; // erp, crm, oa, im, custom

  @Column({ length: 255, nullable: true })
  baseUrl: string;

  @Column({ type: 'text', nullable: true })
  apiKey: string;

  @Column({ type: 'text', nullable: true })
  credentials: string; // JSON

  @Column({ type: 'text', nullable: true })
  apiSchema: string; // OpenAPI/Swagger JSON

  @Column({ type: 'text', nullable: true })
  customConfig: string; // JSON

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 30000 })
  timeout: number; // ms

  @Column({ type: 'int', default: 3 })
  retryCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
