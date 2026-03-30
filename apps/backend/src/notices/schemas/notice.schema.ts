import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NoticeDocument = Notice & Document;

@Schema({ timestamps: true })
export class Notice {
  @Prop({ type: Types.ObjectId, ref: 'Class', required: true })
  classId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 'info', enum: ['info', 'warning', 'success', 'urgent'] })
  type: string;
}

export const NoticeSchema = SchemaFactory.createForClass(Notice);
