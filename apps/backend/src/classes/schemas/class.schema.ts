import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ClassDocument = Class & Document;

export enum ClassStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  UPCOMING = 'upcoming',
}

@Schema({ timestamps: true })
export class Class {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  instructor: string;

  @Prop({ required: true })
  price: number;

  @Prop()
  thumbnail: string;

  @Prop({ default: ClassStatus.ACTIVE, enum: ClassStatus })
  status: ClassStatus;

  @Prop()
  duration: string;

  @Prop()
  level: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({
    type: [
      {
        title: String,
        url: String,
        date: Date,
        description: String,
      },
    ],
    default: [],
  })
  recordings: {
    title: string;
    url: string;
    date: Date;
    description: string;
  }[];

  @Prop({
    type: [
      {
        title: String,
        url: String,
        scheduledAt: Date,
        description: String,
        isActive: { type: Boolean, default: true },
      },
    ],
    default: [],
  })
  liveClasses: {
    title: string;
    url: string;
    scheduledAt: Date;
    description: string;
    isActive: boolean;
  }[];

  @Prop({ default: 0 })
  enrolledCount: number;
}

export const ClassSchema = SchemaFactory.createForClass(Class);
