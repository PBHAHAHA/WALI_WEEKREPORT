import { IsNumber, IsOptional, IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class DailyLogDto {
  @IsString()
  date: string;

  @IsString()
  content: string;
}

export class GenerateWithTemplateDto {
  @IsNumber()
  @IsOptional()
  templateId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DailyLogDto)
  dailyLogs: DailyLogDto[];

  @IsNumber()
  year: number;

  @IsNumber()
  weekNumber: number;

  @IsOptional()
  startDate?: string;

  @IsOptional()
  endDate?: string;
}
