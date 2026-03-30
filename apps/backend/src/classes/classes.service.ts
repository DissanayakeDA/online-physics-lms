import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Class, ClassDocument } from './schemas/class.schema';
import {
  CreateClassDto,
  AddRecordingDto,
  AddLiveClassDto,
} from './dto/create-class.dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectModel(Class.name) private classModel: Model<ClassDocument>,
  ) {}

  async create(dto: CreateClassDto): Promise<ClassDocument> {
    return new this.classModel(dto).save();
  }

  async findAll(): Promise<ClassDocument[]> {
    return this.classModel.find().sort({ createdAt: -1 });
  }

  async findOne(id: string): Promise<ClassDocument> {
    const cls = await this.classModel.findById(id);
    if (!cls) throw new NotFoundException('Class not found');
    return cls;
  }

  async update(id: string, dto: Partial<CreateClassDto>): Promise<ClassDocument> {
    const cls = await this.classModel.findByIdAndUpdate(id, dto, { new: true });
    if (!cls) throw new NotFoundException('Class not found');
    return cls;
  }

  async delete(id: string): Promise<void> {
    await this.classModel.findByIdAndDelete(id);
  }

  async addRecording(id: string, dto: AddRecordingDto): Promise<ClassDocument> {
    const cls = await this.classModel.findById(id);
    if (!cls) throw new NotFoundException('Class not found');
    cls.recordings.push({ ...dto, date: dto.date || new Date() });
    return cls.save();
  }

  async removeRecording(classId: string, recordingId: string): Promise<ClassDocument> {
    const cls = await this.classModel.findById(classId);
    if (!cls) throw new NotFoundException('Class not found');
    cls.recordings = cls.recordings.filter(
      (r: any) => r._id.toString() !== recordingId,
    );
    return cls.save();
  }

  async addLiveClass(id: string, dto: AddLiveClassDto): Promise<ClassDocument> {
    const cls = await this.classModel.findById(id);
    if (!cls) throw new NotFoundException('Class not found');
    cls.liveClasses.push({ ...dto, scheduledAt: dto.scheduledAt || new Date(), isActive: true });
    return cls.save();
  }

  async removeLiveClass(classId: string, liveId: string): Promise<ClassDocument> {
    const cls = await this.classModel.findById(classId);
    if (!cls) throw new NotFoundException('Class not found');
    cls.liveClasses = cls.liveClasses.filter(
      (l: any) => l._id.toString() !== liveId,
    );
    return cls.save();
  }

  async incrementEnrolled(id: string): Promise<void> {
    await this.classModel.findByIdAndUpdate(id, { $inc: { enrolledCount: 1 } });
  }

  async uploadThumbnail(id: string, filename: string): Promise<ClassDocument> {
    const cls = await this.classModel.findByIdAndUpdate(
      id,
      { thumbnail: filename },
      { new: true },
    );
    if (!cls) throw new NotFoundException('Class not found');
    return cls;
  }
}
