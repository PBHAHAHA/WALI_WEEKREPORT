import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, SendCodeDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 发送验证码
   * POST /auth/send-code
   */
  @Post('send-code')
  async sendCode(@Body() dto: SendCodeDto) {
    return this.authService.sendVerificationCode(dto);
  }

  /**
   * 用户注册
   * POST /auth/register
   */
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * 用户登录
   * POST /auth/login
   */
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * 获取当前用户信息
   * GET /auth/profile
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: { user: { userId: number } }) {
    return this.authService.getProfile(req.user.userId);
  }
}
