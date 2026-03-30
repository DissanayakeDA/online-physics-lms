import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: CreateUserDto) {
    if (!createUserDto.email || !createUserDto.password || !createUserDto.fullName) {
      throw new BadRequestException('fullName, email and password are required');
    }
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: { email: string }) {
    if (!body.email) throw new BadRequestException('Email is required');
    return this.authService.forgotPassword(body.email);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(@Body() body: { email: string; otp: string }) {
    if (!body.email || !body.otp) throw new BadRequestException('Email and OTP are required');
    return this.authService.verifyOtp(body.email, body.otp);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() body: { email: string; otp: string; newPassword: string }) {
    if (!body.email || !body.otp || !body.newPassword)
      throw new BadRequestException('Email, OTP and new password are required');
    if (body.newPassword.length < 6)
      throw new BadRequestException('Password must be at least 6 characters');
    return this.authService.resetPassword(body.email, body.otp, body.newPassword);
  }
}
