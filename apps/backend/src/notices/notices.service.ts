import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notice, NoticeDocument } from './schemas/notice.schema';
import { CreateNoticeDto } from './dto/create-notice.dto';

@Injectable()
export class NoticesService {
  constructor(
    @InjectModel(Notice.name) private noticeModel: Model<NoticeDocument>,
  ) {}

  async create(dto: CreateNoticeDto): Promise<NoticeDocument> {
    const notice = new this.noticeModel({
      ...dto,
      classId: new Types.ObjectId(dto.classId),
    });
    return notice.save();
  }

  async findByClass(classId: string): Promise<NoticeDocument[]> {
    return this.noticeModel
      .find({ classId: new Types.ObjectId(classId), isActive: true })
      .sort({ createdAt: -1 });
  }

  async findAll(): Promise<NoticeDocument[]> {
    return this.noticeModel
      .find()
      .populate('classId', 'title')
      .sort({ createdAt: -1 });
  }

  async update(id: string, dto: Partial<CreateNoticeDto>): Promise<NoticeDocument> {
    const notice = await this.noticeModel.findByIdAndUpdate(id, dto, { new: true });
    if (!notice) throw new NotFoundException('Notice not found');
    return notice;
  }

  async delete(id: string): Promise<void> {
    await this.noticeModel.findByIdAndDelete(id);
  }
}
