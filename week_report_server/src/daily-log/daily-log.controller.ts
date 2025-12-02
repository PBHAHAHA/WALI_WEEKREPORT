import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DailyLogService } from './daily-log.service';
import { CreateDailyLogDto } from './dto/create-daily-log.dto';
import { UpdateDailyLogDto } from './dto/update-daily-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('daily-logs')
@UseGuards(JwtAuthGuard)
export class DailyLogController {
  constructor(private readonly dailyLogService: DailyLogService) {}

  /**
   * 创建或更新日报
   * POST /api/daily-logs
   */
  @Post()
  async createOrUpdate(
    @Request() req: { user: { userId: number } },
    @Body() dto: CreateDailyLogDto,
  ) {
    return this.dailyLogService.createOrUpdate(req.user.userId, dto);
  }

  /**
   * 获取本周日报
   * GET /api/daily-logs/current-week
   */
  @Get('current-week')
  async getCurrentWeek(@Request() req: { user: { userId: number } }) {
    return this.dailyLogService.findCurrentWeek(req.user.userId);
  }

  /**
   * 获取指定日期的日报
   * GET /api/daily-logs/by-date?date=2025-12-02
   */
  @Get('by-date')
  async getByDate(
    @Request() req: { user: { userId: number } },
    @Query('date') date: string,
  ) {
    return this.dailyLogService.findByDate(req.user.userId, date);
  }

  /**
   * 获取日期范围内的日报
   * GET /api/daily-logs/range?startDate=2025-12-01&endDate=2025-12-05
   */
  @Get('range')
  async getByRange(
    @Request() req: { user: { userId: number } },
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.dailyLogService.findByDateRange(
      req.user.userId,
      startDate,
      endDate,
    );
  }

  /**
   * 更新日报
   * PUT /api/daily-logs/:id
   */
  @Put(':id')
  async update(
    @Request() req: { user: { userId: number } },
    @Param('id') id: string,
    @Body() dto: UpdateDailyLogDto,
  ) {
    return this.dailyLogService.update(req.user.userId, +id, dto);
  }

  /**
   * 删除日报
   * DELETE /api/daily-logs/:id
   */
  @Delete(':id')
  async remove(
    @Request() req: { user: { userId: number } },
    @Param('id') id: string,
  ) {
    await this.dailyLogService.remove(req.user.userId, +id);
    return { message: '删除成功' };
  }
}
