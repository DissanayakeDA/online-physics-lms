import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existing = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashed = await bcrypt.hash(createUserDto.password, 12);
    const user = new this.userModel({ ...createUserDto, password: hashed });
    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).select('-password');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find({ role: UserRole.STUDENT }).select('-password');
  }

  async toggleActive(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    user.isActive = !user.isActive;
    return user.save();
  }

  async updateProfile(
    id: string,
    updates: Partial<User>,
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, updates, { new: true })
      .select('-password');
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async delete(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id);
  }

  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('User not found');
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid)
      throw new BadRequestException('Current password is incorrect');
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
  }

  async setResetOtp(email: string, otp: string, expiry: Date): Promise<UserDocument | null> {
    return this.userModel.findOneAndUpdate(
      { email: email.toLowerCase() },
      { resetOtp: otp, resetOtpExpiry: expiry },
      { new: true },
    );
  }

  async verifyOtpAndResetPassword(
    email: string,
    otp: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) throw new NotFoundException('User not found');
    if (!user.resetOtp || user.resetOtp !== otp)
      throw new BadRequestException('Invalid OTP');
    if (!user.resetOtpExpiry || user.resetOtpExpiry < new Date())
      throw new BadRequestException('OTP has expired');
    user.password = await bcrypt.hash(newPassword, 12);
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();
  }

  async seedAdmin(): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@lms.com';
    const existing = await this.userModel.findOne({ email: adminEmail });
    if (!existing) {
      const hashed = await bcrypt.hash(
        process.env.ADMIN_PASSWORD || 'Admin@123',
        12,
      );
      await this.userModel.create({
        fullName: 'Admin',
        email: adminEmail,
        password: hashed,
        role: UserRole.ADMIN,
      });
      console.log(`✅ Admin seeded: ${adminEmail}`);
    }
  }
}
