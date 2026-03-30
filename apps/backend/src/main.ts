import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { UsersService } from './users/users.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const isProd = process.env.NODE_ENV === 'production';
  const corsOrigins =
    process.env.CORS_ORIGINS?.split(',')
      .map((o) => o.trim())
      .filter(Boolean) ?? [];
  const prodAllowlist =
    corsOrigins.length > 0
      ? corsOrigins
      : [process.env.FRONTEND_URL || 'http://localhost:3000'].filter(Boolean);

  app.enableCors({
    // Non-prod: reflect request Origin (localhost, 127.0.0.1, ::1, any port).
    origin: isProd ? prodAllowlist : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  // Serve uploaded files statically
  const uploadsPath = join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadsPath, { prefix: '/uploads' });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Backend running on: http://localhost:${port}/api`);

  // Seed admin account
  try {
    const usersService = app.get(UsersService);
    await usersService.seedAdmin();
  } catch (err) {
    console.error('Failed to seed admin:', err);
  }
}

bootstrap();
