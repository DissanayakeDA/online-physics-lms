import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  STUDENT = 'student',
  ADMIN = 'admin',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ trim: true })
  phone: string;

  @Prop({ trim: true })
  address: string;

  /**
   * National Identity Card — at most one user account per NIC (DB unique index).
   * Sparse so seeded admin and legacy users may omit NIC.
   */
  @Prop({ trim: true, unique: true, sparse: true })
  nic?: string;

  @Prop({ enum: UserRole, default: UserRole.STUDENT })
  role: UserRole;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  profileImage: string;

  @Prop()
  resetOtp: string;

  @Prop()
  resetOtpExpiry: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
