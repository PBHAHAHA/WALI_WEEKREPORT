import { IsString, IsOptional } from 'class-validator';

export class UpdateWeeklyReportDto {
  @IsOptional()
  @IsString({ message: '标题必须是字符串' })
  title?: string;

  @IsOptional()
  @IsString({ message: '内容必须是字符串' })
  content?: string;

  @IsOptional()
  @IsString({ message: '摘要必须是字符串' })
  summary?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}
