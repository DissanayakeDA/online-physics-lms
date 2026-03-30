import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsArray,
} from 'class-validator';
import { ClassStatus } from '../schemas/class.schema';
import { Type } from 'class-transformer';

export class CreateClassDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  subject: string;

  @IsNotEmpty()
  @IsString()
  instructor: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsEnum(ClassStatus)
  status?: ClassStatus;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];
}

export class AddRecordingDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  date?: Date;
}

export class AddLiveClassDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  scheduledAt?: Date;
}
