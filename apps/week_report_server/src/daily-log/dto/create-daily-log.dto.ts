import { IsString, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateDailyLogDto {
  @IsDateString({}, { message: '日期格式不正确' })
  date: string;

  @IsString({ message: '内容必须是字符串' })
  @IsNotEmpty({ message: '内容不能为空' })
  content: string;
}
