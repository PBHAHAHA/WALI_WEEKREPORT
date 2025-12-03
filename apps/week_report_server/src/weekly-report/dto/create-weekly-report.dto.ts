import { IsString, IsNumber, IsDateString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateWeeklyReportDto {
  @IsString({ message: '标题必须是字符串' })
  @IsNotEmpty({ message: '标题不能为空' })
  title: string;

  @IsString({ message: '内容必须是字符串' })
  @IsNotEmpty({ message: '内容不能为空' })
  content: string;

  @IsOptional()
  @IsString({ message: '摘要必须是字符串' })
  summary?: string;

  @IsNumber({}, { message: '年份必须是数字' })
  year: number;

  @IsNumber({}, { message: '周数必须是数字' })
  weekNumber: number;

  @IsDateString({}, { message: '开始日期格式不正确' })
  startDate: string;

  @IsDateString({}, { message: '结束日期格式不正确' })
  endDate: string;
}
