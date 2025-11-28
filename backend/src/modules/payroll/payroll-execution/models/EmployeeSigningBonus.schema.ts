import { Prop, Schema, SchemaFactory, } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
// import schemas from payroll-configuration subsyetm
import { signingBonus } from '../../payroll-configuration/models/signingBonus.schema';
// import schemas from employee subsyetm
import {  EmployeeProfile as Employee} from '../../../employee/models/Employee/employee-profile.schema';
// import enums
import { BonusStatus } from '../enums/payroll-execution-enum';

export type employeeSigningBonusDocument = HydratedDocument<employeeSigningBonus>


@Schema({timestamps: true})
export class employeeSigningBonus {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Employee.name, required: true })
    employeeId: mongoose.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: signingBonus.name, required: true })
    signingBonusId: mongoose.Types.ObjectId;

    @Prop({ type: Date })
    paymentDate?: Date;

    @Prop({ default: BonusStatus.PENDING ,type: String, enum: BonusStatus })
    status: BonusStatus; // pending, paid, approved ,rejected
}

export const employeeSigningBonusSchema = SchemaFactory.createForClass(employeeSigningBonus);
