import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { ClassesService } from './classes.service';
import {
  CreateClassDto,
  AddRecordingDto,
  AddLiveClassDto,
} from './dto/create-class.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

const uploadsDir = join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const classThumbStorage = diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + extname(file.originalname));
  },
});

@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  // Public routes
  @Get()
  findAll() {
    return this.classesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classesService.findOne(id);
  }

  // Admin routes
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateClassDto) {
    return this.classesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: Partial<CreateClassDto>) {
    return this.classesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  delete(@Param('id') id: string) {
    return this.classesService.delete(id);
  }

  @Post(':id/thumbnail')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: classThumbStorage,
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = /\.(jpe?g|png|gif|webp)$/i;
        if (!allowed.test(file.originalname)) {
          return cb(
            new BadRequestException('Only image files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  uploadThumbnail(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file?.filename) {
      throw new BadRequestException('Thumbnail file is required');
    }
    return this.classesService.uploadThumbnail(id, file.filename);
  }

  @Post(':id/recordings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  addRecording(@Param('id') id: string, @Body() dto: AddRecordingDto) {
    return this.classesService.addRecording(id, dto);
  }

  @Delete(':id/recordings/:recordingId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  removeRecording(
    @Param('id') id: string,
    @Param('recordingId') recordingId: string,
  ) {
    return this.classesService.removeRecording(id, recordingId);
  }

  @Post(':id/live-classes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  addLiveClass(@Param('id') id: string, @Body() dto: AddLiveClassDto) {
    return this.classesService.addLiveClass(id, dto);
  }

  @Delete(':id/live-classes/:liveId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  removeLiveClass(
    @Param('id') id: string,
    @Param('liveId') liveId: string,
  ) {
    return this.classesService.removeLiveClass(id, liveId);
  }
}
