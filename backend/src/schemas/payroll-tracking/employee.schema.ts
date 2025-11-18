// employee.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EmployeeDocument = Employee & Document;

@Schema({ collection: 'employees', timestamps: true })
export class Employee {
  @Prop({ required: true, unique: true })
  employeeNumber: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  departmentId: Types.ObjectId;

  @Prop({ required: true })
  hireDate: Date;

  @Prop({ default: 'active' })
  status: string;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
