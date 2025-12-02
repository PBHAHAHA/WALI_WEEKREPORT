import {
  Controller,
  Post,
  Body,
  UseGuards,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { Observable, map, catchError, of } from 'rxjs';
import { AiService } from './ai.service';
import { AskDto, GenerateWeeklyReportDto, ImproveDailyLogDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * AI 问答（流式）
   * POST /api/ai/ask/stream
   */
  @Post('ask/stream')
  @Sse()
  askStream(@Body() dto: AskDto): Observable<MessageEvent> {
    return this.aiService.askStream(dto.question, dto.systemPrompt).pipe(
      map((content) => ({ data: { content } })),
      catchError((error) => of({ data: { error: error.message } })),
    );
  }

  /**
   * AI 问答（非流式）
   * POST /api/ai/ask
   */
  @Post('ask')
  async ask(@Body() dto: AskDto) {
    const answer = await this.aiService.ask(dto.question, dto.systemPrompt);
    return { answer };
  }

  /**
   * 根据日报生成周报（流式）
   * POST /api/ai/generate-weekly-report/stream
   */
  @Post('generate-weekly-report/stream')
  @Sse()
  generateWeeklyReportStream(@Body() dto: GenerateWeeklyReportDto): Observable<MessageEvent> {
    return this.aiService.generateWeeklyReportStream(dto.dailyLogs).pipe(
      map((content) => ({ data: { content } })),
      catchError((error) => of({ data: { error: error.message } })),
    );
  }

  /**
   * 根据日报生成周报（非流式）
   * POST /api/ai/generate-weekly-report
   */
  @Post('generate-weekly-report')
  async generateWeeklyReport(@Body() dto: GenerateWeeklyReportDto) {
    const content = await this.aiService.generateWeeklyReport(dto.dailyLogs);
    return { content };
  }

  /**
   * 优化日报内容
   * POST /api/ai/improve-daily-log
   */
  @Post('improve-daily-log')
  async improveDailyLog(@Body() dto: ImproveDailyLogDto) {
    const content = await this.aiService.improveDailyLog(dto.content);
    return { content };
  }
}
