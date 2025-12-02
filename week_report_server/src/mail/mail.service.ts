import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;
  private fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.resend = new Resend(this.configService.get<string>('RESEND_API_KEY'));
    this.fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL') || 'noreply@example.com';
  }

  async sendVerificationCode(email: string, code: string): Promise<void> {
    await this.resend.emails.send({
      from: this.fromEmail,
      to: email,
      subject: '【周报系统】邮箱验证码',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">邮箱验证码</h2>
          <p style="color: #666; font-size: 16px;">您好，您的验证码是：</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">${code}</span>
          </div>
          <p style="color: #999; font-size: 14px;">验证码有效期为10分钟，请尽快使用。</p>
          <p style="color: #999; font-size: 14px;">如果这不是您的操作，请忽略此邮件。</p>
        </div>
      `,
    });
  }
}
