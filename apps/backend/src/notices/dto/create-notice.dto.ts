import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateNoticeDto {
  @IsNotEmpty()
  @IsString()
  classId: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsEnum(['info', 'warning', 'success', 'urgent'])
  type?: string;
}
