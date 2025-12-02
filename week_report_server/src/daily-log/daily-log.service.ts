import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { DailyLog } from './entities/daily-log.entity';
import { CreateDailyLogDto } from './dto/create-daily-log.dto';
import { UpdateDailyLogDto } from './dto/update-daily-log.dto';

@Injectable()
export class DailyLogService {
  constructor(
    @InjectRepository(DailyLog)
    private readonly dailyLogRepository: Repository<DailyLog>,
  ) {}

  // 创建或更新日报（同一天只能有一条）
  async createOrUpdate(
    userId: number,
    dto: CreateDailyLogDto,
  ): Promise<DailyLog> {
    const existing = await this.dailyLogRepository.findOne({
      where: { userId, date: dto.date },
    });

    if (existing) {
      existing.content = dto.content;
      return this.dailyLogRepository.save(existing);
    }

    const dailyLog = this.dailyLogRepository.create({
      ...dto,
      userId,
    });
    return this.dailyLogRepository.save(dailyLog);
  }

  // 获取指定日期的日报
  async findByDate(userId: number, date: string): Promise<DailyLog | null> {
    return this.dailyLogRepository.findOne({
      where: { userId, date },
    });
  }

  // 获取日期范围内的日报
  async findByDateRange(
    userId: number,
    startDate: string,
    endDate: string,
  ): Promise<DailyLog[]> {
    return this.dailyLogRepository.find({
      where: {
        userId,
        date: Between(startDate, endDate),
      },
      order: { date: 'ASC' },
    });
  }

  // 获取本周日报
  async findCurrentWeek(userId: number): Promise<DailyLog[]> {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);

    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);

    const startDate = monday.toISOString().split('T')[0];
    const endDate = friday.toISOString().split('T')[0];

    return this.findByDateRange(userId, startDate, endDate);
  }

  // 更新日报
  async update(
    userId: number,
    id: number,
    dto: UpdateDailyLogDto,
  ): Promise<DailyLog> {
    const dailyLog = await this.dailyLogRepository.findOne({
      where: { id, userId },
    });

    if (!dailyLog) {
      throw new NotFoundException('日报不存在');
    }

    Object.assign(dailyLog, dto);
    return this.dailyLogRepository.save(dailyLog);
  }

  // 删除日报
  async remove(userId: number, id: number): Promise<void> {
    const dailyLog = await this.dailyLogRepository.findOne({
      where: { id, userId },
    });

    if (!dailyLog) {
      throw new NotFoundException('日报不存在');
    }

    await this.dailyLogRepository.remove(dailyLog);
  }
}
