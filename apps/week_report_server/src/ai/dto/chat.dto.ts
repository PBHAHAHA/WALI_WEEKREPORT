import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ChatMessageDto {
  @IsString()
  role: 'system' | 'user' | 'assistant';

  @IsString()
  @IsNotEmpty()
  content: string;
}

export class ChatDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[];
}

export class AskDto {
  @IsString()
  @IsNotEmpty({ message: '问题不能为空' })
  question: string;

  @IsOptional()
  @IsString()
  systemPrompt?: string;
}

export class GenerateWeeklyReportDto {
  @IsArray()
  dailyLogs: Array<{ date: string; content: string }>;
}

export class ImproveDailyLogDto {
  @IsString()
  @IsNotEmpty({ message: '内容不能为空' })
  content: string;
}
