// department.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DepartmentDocument = Department & Document;

@Schema({ collection: 'departments', timestamps: true })
export class Department {
  @Prop({ required: true })
  name: string;

  @Prop({ unique: true, sparse: true })
  code?: string;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);
