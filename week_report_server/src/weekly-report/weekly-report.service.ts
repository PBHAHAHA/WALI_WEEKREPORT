import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WeeklyReport } from './entities/weekly-report.entity';
import { CreateWeeklyReportDto } from './dto/create-weekly-report.dto';
import { UpdateWeeklyReportDto } from './dto/update-weekly-report.dto';

@Injectable()
export class WeeklyReportService {
  constructor(
    @InjectRepository(WeeklyReport)
    private readonly weeklyReportRepository: Repository<WeeklyReport>,
  ) {}

  // 创建周报
  async create(userId: number, dto: CreateWeeklyReportDto): Promise<WeeklyReport> {
    const weeklyReport = this.weeklyReportRepository.create({
      ...dto,
      userId,
    });
    return this.weeklyReportRepository.save(weeklyReport);
  }

  // 获取用户所有周报（分页）
  async findAll(
    userId: number,
    page = 1,
    limit = 10,
  ): Promise<{ data: WeeklyReport[]; total: number }> {
    const [data, total] = await this.weeklyReportRepository.findAndCount({
      where: { userId },
      order: { year: 'DESC', weekNumber: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  // 获取最近的周报
  async findRecent(userId: number, limit = 4): Promise<WeeklyReport[]> {
    return this.weeklyReportRepository.find({
      where: { userId },
      order: { year: 'DESC', weekNumber: 'DESC' },
      take: limit,
    });
  }

  // 获取单个周报
  async findOne(userId: number, id: number): Promise<WeeklyReport> {
    const report = await this.weeklyReportRepository.findOne({
      where: { id, userId },
    });

    if (!report) {
      throw new NotFoundException('周报不存在');
    }

    return report;
  }

  // 根据年份和周数获取周报
  async findByYearAndWeek(
    userId: number,
    year: number,
    weekNumber: number,
  ): Promise<WeeklyReport | null> {
    return this.weeklyReportRepository.findOne({
      where: { userId, year, weekNumber },
    });
  }

  // 更新周报
  async update(
    userId: number,
    id: number,
    dto: UpdateWeeklyReportDto,
  ): Promise<WeeklyReport> {
    const report = await this.findOne(userId, id);
    Object.assign(report, dto);
    return this.weeklyReportRepository.save(report);
  }

  // 删除周报
  async remove(userId: number, id: number): Promise<void> {
    const report = await this.findOne(userId, id);
    await this.weeklyReportRepository.remove(report);
  }
}
