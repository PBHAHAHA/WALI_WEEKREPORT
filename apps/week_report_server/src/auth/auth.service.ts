import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';
import {
  VerificationCode,
  VerificationCodeType,
} from './entities/verification-code.entity';
import { RegisterDto, LoginDto, SendCodeDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    @InjectRepository(VerificationCode)
    private readonly verificationCodeRepository: Repository<VerificationCode>,
  ) {}

  /**
   * 生成6位随机验证码
   */
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * 发送验证码
   */
  async sendVerificationCode(dto: SendCodeDto): Promise<{ message: string }> {
    const { email, type = VerificationCodeType.REGISTER } = dto;

    // 如果是注册类型，检查邮箱是否已被注册
    if (type === VerificationCodeType.REGISTER) {
      const existingUser = await this.userService.findByEmail(email);
      if (existingUser) {
        throw new BadRequestException('该邮箱已被注册');
      }
    }

    // 检查是否在1分钟内已发送过验证码
    const recentCode = await this.verificationCodeRepository.findOne({
      where: {
        email,
        type,
        createdAt: MoreThan(new Date(Date.now() - 60 * 1000)),
      },
      order: { createdAt: 'DESC' },
    });

    if (recentCode) {
      throw new BadRequestException('请勿频繁发送验证码，请1分钟后再试');
    }

    // 生成验证码
    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10分钟后过期

    // 保存验证码
    const verificationCode = this.verificationCodeRepository.create({
      email,
      code,
      type,
      expiresAt,
    });
    await this.verificationCodeRepository.save(verificationCode);

    // 发送邮件
    await this.mailService.sendVerificationCode(email, code);

    return { message: '验证码已发送，请查收邮件' };
  }

  /**
   * 验证验证码
   */
  private async verifyCode(
    email: string,
    code: string,
    type: VerificationCodeType,
  ): Promise<boolean> {
    const verificationCode = await this.verificationCodeRepository.findOne({
      where: {
        email,
        code,
        type,
        isUsed: false,
        expiresAt: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
    });

    if (!verificationCode) {
      return false;
    }

    // 标记验证码已使用
    verificationCode.isUsed = true;
    await this.verificationCodeRepository.save(verificationCode);

    return true;
  }

  /**
   * 用户注册
   */
  async register(dto: RegisterDto): Promise<{ message: string }> {
    const { email, password, code, nickname } = dto;

    // 检查邮箱是否已被注册
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('该邮箱已被注册');
    }

    // 验证验证码
    const isCodeValid = await this.verifyCode(
      email,
      code,
      VerificationCodeType.REGISTER,
    );
    if (!isCodeValid) {
      throw new BadRequestException('验证码无效或已过期');
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    await this.userService.create({
      email,
      password: hashedPassword,
      nickname,
      isEmailVerified: true,
    });

    return { message: '注册成功' };
  }

  /**
   * 用户登录
   */
  async login(
    dto: LoginDto,
  ): Promise<{ accessToken: string; user: { id: number; email: string } }> {
    const { email, password } = dto;

    // 查找用户
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 生成 JWT
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  /**
   * 获取当前用户信息
   */
  async getProfile(userId: number) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    };
  }
}
