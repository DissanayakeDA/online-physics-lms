import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

// Ensure uploads directory exists
const uploadsDir = join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const multerStorage = diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + extname(file.originalname));
  },
});

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('submit/:classId')
  @UseInterceptors(
    FileInterceptor('slip', {
      storage: multerStorage,
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
      fileFilter: (_req, file, cb) => {
        const allowed = /\.(jpg|jpeg|png|gif|webp|pdf)$/i;
        if (!allowed.test(file.originalname)) {
          return cb(new BadRequestException('Only image and PDF files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async submitPayment(
    @Param('classId') classId: string,
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body('nic') nic?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Payment slip image is required');
    }
    return this.paymentsService.submitPayment(req.user.id, classId, file.filename, nic ?? '');
  }

  @Get('my-payments')
  getMyPayments(@Request() req) {
    return this.paymentsService.getPaymentsByStudent(req.user.id);
  }

  @Get('check/:classId')
  checkEnrollment(@Request() req, @Param('classId') classId: string) {
    return this.paymentsService.isEnrolled(req.user.id, classId).then((enrolled) => ({
      enrolled,
    }));
  }

  // Admin routes
  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getAllPayments() {
    return this.paymentsService.getAllPayments();
  }

  @Get('class/:classId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  getPaymentsByClass(@Param('classId') classId: string) {
    return this.paymentsService.getPaymentsByClass(classId);
  }

  @Patch(':id/toggle-verify')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  toggleVerification(@Param('id') id: string) {
    return this.paymentsService.toggleVerification(id);
  }

  @Patch(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  rejectPayment(@Param('id') id: string, @Body('note') note?: string) {
    return this.paymentsService.rejectPayment(id, note);
  }
}
