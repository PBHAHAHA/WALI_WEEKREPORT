import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { VerificationCodeType } from '../entities/verification-code.entity';

export class SendCodeDto {
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;

  @IsOptional()
  @IsEnum(VerificationCodeType, { message: '无效的验证码类型' })
  type?: VerificationCodeType = VerificationCodeType.REGISTER;
}
