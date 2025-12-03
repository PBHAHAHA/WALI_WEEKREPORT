import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('weekly_reports')
export class WeeklyReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string; // 周报标题，如 "2025年第49周周报"

  @Column({ type: 'text' })
  content: string; // 周报内容

  @Column({ type: 'text', nullable: true })
  summary: string; // 周报摘要

  @Column()
  year: number; // 年份

  @Column()
  weekNumber: number; // 第几周

  @Column({ type: 'date' })
  startDate: string; // 周开始日期

  @Column({ type: 'date' })
  endDate: string; // 周结束日期

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
