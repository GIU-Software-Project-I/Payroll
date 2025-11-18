import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ShiftAssignment } from '../models/shiftAssignment';

@Injectable()
export class ShiftAssignmentService {
    constructor(
        @InjectModel(ShiftAssignment.name) private readonly shiftAssignmentModel: Model<ShiftAssignment>
    ) {}

    async create(assignmentData: any) {
        const assignment = new this.shiftAssignmentModel(assignmentData);
        return await assignment.save();
    }

    async findAll() {
        return await this.shiftAssignmentModel.find().exec();
    }

    async findOne(id: string) {
        return await this.shiftAssignmentModel.findById(id).exec();
    }

    async findByEmployee(employeeId: string) {
        return await this.shiftAssignmentModel.find({ employeeId }).exec();
    }

    async update(id: string, assignmentData: any) {
        return await this.shiftAssignmentModel.findByIdAndUpdate(id, assignmentData, { new: true }).exec();
    }

    async delete(id: string) {
        return await this.shiftAssignmentModel.findByIdAndDelete(id).exec();
    }
}