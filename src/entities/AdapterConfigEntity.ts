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

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  type: string; // erp, crm, oa, im, custom

  @Column({ type: 'varchar', length: 255, nullable: true })
  baseUrl: string;

  @Column({ type: 'text', nullable: true })
  apiKey: string;

  @Column({ type: 'text', nullable: true })
  credentials: string; // JSON

  @Column({ type: 'text', nullable: true })
  apiSchema: string; // OpenAPI/Swagger JSON

  @Column({ type: 'text', nullable: true })
  customConfig: string; // JSON

  @Column({ type: 'boolean', default: true })
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
