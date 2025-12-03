import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;

  @IsOptional()
  @IsString({ message: '用户名必须是字符串' })
  @MinLength(2, { message: '用户名长度不能少于2位' })
  @MaxLength(20, { message: '用户名长度不能超过20位' })
  nickname?: string;

  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码长度不能少于6位' })
  @MaxLength(50, { message: '密码长度不能超过50位' })
  password: string;

  @IsString({ message: '验证码必须是字符串' })
  @MinLength(6, { message: '验证码长度必须为6位' })
  @MaxLength(6, { message: '验证码长度必须为6位' })
  code: string;
}
