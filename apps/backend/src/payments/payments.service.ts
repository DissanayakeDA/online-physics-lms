import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Payment, PaymentDocument, PaymentStatus } from './schemas/payment.schema';
import { ClassesService } from '../classes/classes.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private classesService: ClassesService,
  ) {}

  async submitPayment(
    studentId: string,
    classId: string,
    slipFilename: string,
  ): Promise<PaymentDocument> {
    // Check if already paid/pending
    const existing = await this.paymentModel.findOne({
      studentId: new Types.ObjectId(studentId),
      classId: new Types.ObjectId(classId),
      status: { $in: [PaymentStatus.PENDING, PaymentStatus.VERIFIED] },
    });
    if (existing) {
      throw new BadRequestException('Payment already submitted or verified for this class');
    }

    // Verify class exists
    await this.classesService.findOne(classId);

    const payment = new this.paymentModel({
      studentId: new Types.ObjectId(studentId),
      classId: new Types.ObjectId(classId),
      slipImage: slipFilename,
      status: PaymentStatus.PENDING,
    });

    return payment.save();
  }

  async toggleVerification(paymentId: string): Promise<PaymentDocument> {
    const payment = await this.paymentModel.findById(paymentId);
    if (!payment) throw new NotFoundException('Payment not found');

    if (payment.isVerified) {
      // Unverify
      payment.isVerified = false;
      payment.status = PaymentStatus.PENDING;
      payment.isEnrolled = false;
      payment.verifiedAt = undefined;
      payment.verificationExpiresAt = undefined;
    } else {
      // Verify — set expiry to 5 weeks from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 35); // 5 weeks = 35 days

      payment.isVerified = true;
      payment.status = PaymentStatus.VERIFIED;
      payment.isEnrolled = true;
      payment.verifiedAt = new Date();
      payment.verificationExpiresAt = expiresAt;

      await this.classesService.incrementEnrolled(payment.classId.toString());
    }

    return payment.save();
  }

  async getPaymentsByStudent(studentId: string): Promise<PaymentDocument[]> {
    return this.paymentModel
      .find({ studentId: new Types.ObjectId(studentId) })
      .populate('classId', 'title thumbnail subject instructor price')
      .sort({ createdAt: -1 });
  }

  async getAllPayments(): Promise<PaymentDocument[]> {
    return this.paymentModel
      .find()
      .populate('studentId', 'fullName email phone')
      .populate('classId', 'title subject price')
      .sort({ createdAt: -1 });
  }

  async getPaymentsByClass(classId: string): Promise<PaymentDocument[]> {
    return this.paymentModel
      .find({ classId: new Types.ObjectId(classId) })
      .populate('studentId', 'fullName email phone')
      .sort({ createdAt: -1 });
  }

  async isEnrolled(studentId: string, classId: string): Promise<boolean> {
    const payment = await this.paymentModel.findOne({
      studentId: new Types.ObjectId(studentId),
      classId: new Types.ObjectId(classId),
      isEnrolled: true,
      isVerified: true,
    });
    return !!payment;
  }

  async rejectPayment(paymentId: string, note?: string): Promise<PaymentDocument> {
    const payment = await this.paymentModel.findById(paymentId);
    if (!payment) throw new NotFoundException('Payment not found');
    payment.status = PaymentStatus.REJECTED;
    payment.isVerified = false;
    payment.isEnrolled = false;
    if (note) payment.adminNote = note;
    return payment.save();
  }

  // Runs every day at midnight to expire verifications older than 5 weeks
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expireOldVerifications(): Promise<void> {
    const now = new Date();
    const result = await this.paymentModel.updateMany(
      {
        isVerified: true,
        verificationExpiresAt: { $lt: now },
      },
      {
        $set: {
          isVerified: false,
          isEnrolled: false,
          status: PaymentStatus.EXPIRED,
        },
      },
    );
    if (result.modifiedCount > 0) {
      console.log(`⏰ Expired ${result.modifiedCount} payment verifications`);
    }
  }
}
