import { IsString, IsOptional } from 'class-validator';

export class UpdateDailyLogDto {
  @IsOptional()
  @IsString({ message: '内容必须是字符串' })
  content?: string;
}
