import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { join } from 'path';
import * as fs from 'fs';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ClassesModule } from '../classes/classes.module';
import { PaymentsModule } from '../payments/payments.module';
import { NoticesModule } from '../notices/notices.module';

// Ensure uploads directory exists
const uploadsDir = join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        'apps/backend/.env', // When running from workspace root (nx serve)
        '.env', // When running from apps/backend
      ],
      override: true,              // Last matching file wins
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/lms',
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      }),
    }),
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, uploadsDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
    AuthModule,
    UsersModule,
    ClassesModule,
    PaymentsModule,
    NoticesModule,
  ],
})
export class AppModule {}
