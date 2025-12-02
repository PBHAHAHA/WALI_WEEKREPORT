import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable } from 'rxjs';
import { WeeklyReport } from './entities/weekly-report.entity';
import { CreateWeeklyReportDto } from './dto/create-weekly-report.dto';
import { UpdateWeeklyReportDto } from './dto/update-weekly-report.dto';
import { GenerateWithTemplateDto } from './dto/generate-with-template.dto';
import { AiService } from '../ai/ai.service';
import { TemplateService } from '../template/template.service';

@Injectable()
export class WeeklyReportService {
  constructor(
    @InjectRepository(WeeklyReport)
    private readonly weeklyReportRepository: Repository<WeeklyReport>,
    private readonly aiService: AiService,
    private readonly templateService: TemplateService,
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

  // 使用模板生成周报
  async generateWithTemplate(
    userId: number,
    dto: GenerateWithTemplateDto,
  ): Promise<WeeklyReport> {
    let templateContent = '';
    const title = `第${dto.weekNumber}周工作周报`;

    // 如果提供了模板ID，获取模板内容
    if (dto.templateId) {
      const template = await this.templateService.findOne(dto.templateId, userId);
      templateContent = template.content;
      
      // 增加模板使用次数
      await this.templateService.use(dto.templateId, userId);
    }

    // 构建 AI 提示词
    const dailyContent = dto.dailyLogs
      .map(log => `【${log.date}】\n${log.content}`)
      .join('\n\n');

    let systemPrompt = `你是一个专业的周报撰写助手。请根据用户提供的本周日报内容，生成一份结构清晰、内容完整的周报。`;

    if (templateContent) {
      systemPrompt += `\n\n请参考以下模板格式生成周报：\n${templateContent}`;
    } else {
      systemPrompt += `\n\n周报应包含以下部分：
## 本周工作总结
## 主要完成的工作
## 遇到的问题及解决方案
## 下周工作计划`;
    }

    systemPrompt += `\n\n请使用 Markdown 格式输出，保持专业、简洁。`;

    const userMessage = `以下是我本周的日报内容，请帮我生成周报：\n\n${dailyContent}`;

    // 调用 AI 生成周报内容
    const content = await this.aiService.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ]);

    // 生成摘要（去除 Markdown 标记，取前200字）
    const summary = content
      .replace(/#{1,6}\s/g, '') // 去除标题标记
      .replace(/[*_`~]/g, '') // 去除加粗、斜体、代码标记
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 去除链接，保留文本
      .replace(/\n+/g, ' ') // 换行替换为空格
      .trim()
      .substring(0, 200);

    // 检查是否已存在该周的周报
    const existingReport = await this.findByYearAndWeek(
      userId,
      dto.year,
      dto.weekNumber,
    );

    if (existingReport) {
      // 覆盖现有周报
      existingReport.title = title;
      existingReport.content = content;
      existingReport.summary = summary;
      if (dto.startDate) existingReport.startDate = dto.startDate;
      if (dto.endDate) existingReport.endDate = dto.endDate;
      return this.weeklyReportRepository.save(existingReport);
    } else {
      // 创建新周报
      const weeklyReport = this.weeklyReportRepository.create({
        title,
        content,
        summary,
        year: dto.year,
        weekNumber: dto.weekNumber,
        startDate: dto.startDate || new Date().toISOString(),
        endDate: dto.endDate || new Date().toISOString(),
        userId,
      });
      return this.weeklyReportRepository.save(weeklyReport);
    }
  }

  // 使用模板生成周报（流式）
  generateWithTemplateStream(
    userId: number,
    dto: GenerateWithTemplateDto,
  ): Observable<string> {
    return new Observable((observer) => {
      (async () => {
        try {
          let templateContent = '';

          // 如果提供了模板ID，获取模板内容
          if (dto.templateId) {
            const template = await this.templateService.findOne(dto.templateId, userId);
            templateContent = template.content;
            
            // 增加模板使用次数
            await this.templateService.use(dto.templateId, userId);
          }

          // 构建 AI 提示词
          const dailyContent = dto.dailyLogs
            .map(log => `【${log.date}】\n${log.content}`)
            .join('\n\n');

          let systemPrompt = `你是一个专业的周报撰写助手。请根据用户提供的本周日报内容，生成一份结构清晰、内容完整的周报。`;

          if (templateContent) {
            systemPrompt += `\n\n请参考以下模板格式生成周报：\n${templateContent}`;
          } else {
            systemPrompt += `\n\n周报应包含以下部分：
## 本周工作总结
## 主要完成的工作
## 遇到的问题及解决方案
## 下周工作计划`;
          }

          systemPrompt += `\n\n请使用 Markdown 格式输出，保持专业、简洁。`;

          const userMessage = `以下是我本周的日报内容，请帮我生成周报：\n\n${dailyContent}`;

          // 调用 AI 流式生成
          const stream = this.aiService.askStream(userMessage, systemPrompt);
          
          stream.subscribe({
            next: (chunk) => observer.next(chunk),
            error: (err) => observer.error(err),
            complete: () => observer.complete(),
          });
        } catch (error) {
          observer.error(error);
        }
      })();
    });
  }
}
