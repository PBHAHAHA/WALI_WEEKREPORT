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
import { WeeklyReportService } from './weekly-report.service';
import { CreateWeeklyReportDto } from './dto/create-weekly-report.dto';
import { UpdateWeeklyReportDto } from './dto/update-weekly-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('weekly-reports')
@UseGuards(JwtAuthGuard)
export class WeeklyReportController {
  constructor(private readonly weeklyReportService: WeeklyReportService) {}

  /**
   * 创建周报
   * POST /api/weekly-reports
   */
  @Post()
  async create(
    @Request() req: { user: { userId: number } },
    @Body() dto: CreateWeeklyReportDto,
  ) {
    return this.weeklyReportService.create(req.user.userId, dto);
  }

  /**
   * 获取周报列表（分页）
   * GET /api/weekly-reports?page=1&limit=10
   */
  @Get()
  async findAll(
    @Request() req: { user: { userId: number } },
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.weeklyReportService.findAll(req.user.userId, +page, +limit);
  }

  /**
   * 获取最近的周报
   * GET /api/weekly-reports/recent?limit=4
   */
  @Get('recent')
  async findRecent(
    @Request() req: { user: { userId: number } },
    @Query('limit') limit = '4',
  ) {
    return this.weeklyReportService.findRecent(req.user.userId, +limit);
  }

  /**
   * 获取单个周报
   * GET /api/weekly-reports/:id
   */
  @Get(':id')
  async findOne(
    @Request() req: { user: { userId: number } },
    @Param('id') id: string,
  ) {
    return this.weeklyReportService.findOne(req.user.userId, +id);
  }

  /**
   * 更新周报
   * PUT /api/weekly-reports/:id
   */
  @Put(':id')
  async update(
    @Request() req: { user: { userId: number } },
    @Param('id') id: string,
    @Body() dto: UpdateWeeklyReportDto,
  ) {
    return this.weeklyReportService.update(req.user.userId, +id, dto);
  }

  /**
   * 删除周报
   * DELETE /api/weekly-reports/:id
   */
  @Delete(':id')
  async remove(
    @Request() req: { user: { userId: number } },
    @Param('id') id: string,
  ) {
    await this.weeklyReportService.remove(req.user.userId, +id);
    return { message: '删除成功' };
  }
}
