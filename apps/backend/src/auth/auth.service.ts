import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as nodemailer from 'nodemailer';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private transporter: nodemailer.Transporter;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    });
  }

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        nic: user.nic,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(loginDto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (!user.isActive) throw new ForbiddenException('Account is disabled');

    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        nic: user.nic,
      },
    };
  }

  async forgotPassword(email: string) {
    /** Same message whether or not the account exists — avoids email enumeration. */
    const message =
      'If an account exists for this email, a 6-digit code was sent. It expires in 10 minutes.';

    const user = await this.usersService.findByEmail(email);
    if (!user || !user.isActive) {
      return { message };
    }

    const smtpConfigured = Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
    if (!smtpConfigured) {
      console.warn(
        '[forgot-password] SMTP_USER and SMTP_PASS are not both set; OTP email was not sent.',
      );
      return { message };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await this.usersService.setResetOtp(email, otp, expiry);

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@onlinephysics.com',
        to: user.email,
        subject: 'OnlinePHYSICS - Password Reset OTP',
        html: `
          <div style="font-family: 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fff; border-radius: 16px; border: 1px solid #e2e8f0;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #1e3a8a; font-size: 24px; margin: 0;">Online<span style="color: #2563eb;">PHYSICS</span></h1>
              <p style="color: #64748b; font-size: 14px;">Password Reset Request</p>
            </div>
            <p style="color: #334155; font-size: 14px;">Hello <strong>${user.fullName}</strong>,</p>
            <p style="color: #334155; font-size: 14px;">Use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.</p>
            <div style="text-align: center; margin: 24px 0;">
              <div style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #1e3a8a, #2563eb); color: white; font-size: 32px; font-weight: 800; letter-spacing: 8px; border-radius: 12px;">${otp}</div>
            </div>
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">If you did not request this, please ignore this email.</p>
          </div>
        `,
      });
    } catch (err) {
      console.error('Email send error:', err);
      await this.usersService.clearResetOtp(email);
    }

    return { message };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('User not found');
    if (!user.resetOtp || user.resetOtp !== otp)
      throw new BadRequestException('Invalid OTP');
    if (!user.resetOtpExpiry || user.resetOtpExpiry < new Date())
      throw new BadRequestException('OTP has expired');
    return { message: 'OTP verified', valid: true };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    await this.usersService.verifyOtpAndResetPassword(email, otp, newPassword);
    return { message: 'Password reset successfully' };
  }
}
