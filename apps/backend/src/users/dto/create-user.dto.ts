import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsNotEmpty({ message: 'NIC number is required' })
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().replace(/\s+/g, '') : value,
  )
  @Matches(/^(\d{9}[VXvx]|\d{12})$/, {
    message:
      'Invalid NIC. Use 9 digits + V or X (e.g. 123456789V), or a 12-digit NIC.',
  })
  nic: string;
}
