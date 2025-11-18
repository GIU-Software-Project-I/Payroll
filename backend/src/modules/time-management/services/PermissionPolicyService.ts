import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PermissionPolicy } from '../models/PermissionPolicy';

@Injectable()
export class PermissionPolicyService {
    constructor(
        @InjectModel(PermissionPolicy.name) private readonly permissionPolicyModel: Model<PermissionPolicy>
    ) {}

    async create(policyData: any) {
        const policy = new this.permissionPolicyModel(policyData);
        return await policy.save();
    }

    async findAll() {
        return await this.permissionPolicyModel.find().exec();
    }

    async findOne(id: string) {
        return await this.permissionPolicyModel.findById(id).exec();
    }

    async update(id: string, policyData: any) {
        return await this.permissionPolicyModel.findByIdAndUpdate(id, policyData, { new: true }).exec();
    }

    async delete(id: string) {
        return await this.permissionPolicyModel.findByIdAndDelete(id).exec();
    }
}