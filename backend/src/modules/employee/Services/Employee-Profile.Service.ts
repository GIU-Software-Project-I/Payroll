import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EmployeeProfile, EmployeeProfileDocument } from '../models/Employee/employee-profile.schema';
import { EmployeeProfileChangeRequest, EmployeeProfileChangeRequestDocument } from '../models/Employee/ep-change-request.schema';
import { EmployeeSystemRole, EmployeeSystemRoleDocument } from '../models/Employee/employee-system-role.schema';
import { UpdateContactInfoDto } from '../dto/employee-profile/update-contact-info.dto';
import { UpdateBioDto } from '../dto/employee-profile/update-bio.dto';
import { CreateCorrectionRequestDto } from '../dto/employee-profile/create-correction-request.dto';
import { AdminUpdateProfileDto } from '../dto/employee-profile/admin-update-profile.dto';
import { AdminAssignRoleDto } from '../dto/employee-profile/admin-assign-role.dto';
import { EmployeeStatus, ProfileChangeStatus } from '../enums/employee-profile.enums';



@Injectable()
export class EmployeeProfileService {
    constructor(
        @InjectModel(EmployeeProfile.name)
        private employeeProfileModel: Model<EmployeeProfileDocument>,
        @InjectModel(EmployeeProfileChangeRequest.name)
        private changeRequestModel: Model<EmployeeProfileChangeRequestDocument>,
        @InjectModel(EmployeeSystemRole.name)
        private systemRoleModel: Model<EmployeeSystemRoleDocument>,
    ) { }


    async getProfile(userId: string): Promise<EmployeeProfile> {
        const profile = await this.employeeProfileModel.findById(userId)
            .populate('primaryPositionId')
            .populate('primaryDepartmentId')
            .populate('supervisorPositionId')
            .populate('lastAppraisalRecordId')
            .populate('lastAppraisalCycleId')
            .populate('lastAppraisalTemplateId')
            .populate('accessProfileId');

        if (!profile) {
            throw new NotFoundException('Employee profile not found');
        }
        return profile;
    }


    async updateContactInfo(userId: string, dto: UpdateContactInfoDto): Promise<EmployeeProfile> {
        const profile = await this.employeeProfileModel.findById(userId);
        if (!profile) {
            throw new NotFoundException('Employee profile not found');
        }

        if (dto.mobilePhone) profile.mobilePhone = dto.mobilePhone;
        if (dto.homePhone) profile.homePhone = dto.homePhone;
        if (dto.personalEmail) profile.personalEmail = dto.personalEmail;
        if (dto.address) {
            profile.address = { ...profile.address, ...dto.address };
        }

        // TODO: Trigger N-037 (Profile updated) notification

        return profile.save();
    }


    async updateBio(userId: string, dto: UpdateBioDto): Promise<EmployeeProfile> {
        const profile = await this.employeeProfileModel.findById(userId);
        if (!profile) {
            throw new NotFoundException('Employee profile not found');
        }

        if (dto.biography !== undefined) profile.biography = dto.biography;
        if (dto.profilePictureUrl !== undefined) profile.profilePictureUrl = dto.profilePictureUrl;

        // TODO: Trigger N-037 (Profile updated) notification

        return profile.save();
    }

    async createCorrectionRequest(userId: string, dto: CreateCorrectionRequestDto): Promise<EmployeeProfileChangeRequest> {
        const profile = await this.employeeProfileModel.findById(userId);
        if (!profile) {
            throw new NotFoundException('Employee profile not found');
        }

        const request = new this.changeRequestModel({
            requestId: `REQ-${Date.now()}`,
            employeeProfileId: new Types.ObjectId(userId),
            requestDescription: dto.requestDescription,
            reason: dto.reason,
            status: ProfileChangeStatus.PENDING,
            submittedAt: new Date(),
        });

        // TODO: Trigger N-040 (Profile change request submitted) notification to HR/Manager

        return request.save();
    }


    async getTeamProfiles(managerId: string): Promise<EmployeeProfile[]> {
        const managerProfile = await this.employeeProfileModel.findById(managerId);
        if (!managerProfile || !managerProfile.primaryPositionId) {
            return [];
        }

        const team = await this.employeeProfileModel.find({
            supervisorPositionId: managerProfile.primaryPositionId,
            status: EmployeeStatus.ACTIVE
        })
            // Exclude sensitive info per BR 18b: payGrade, homePhone, personalEmail, address
            .select('firstName lastName fullName primaryPositionId primaryDepartmentId workEmail mobilePhone status dateOfHire')
            .populate('primaryPositionId', 'title')
            .populate('primaryDepartmentId', 'name');

        return team;
    }


    async searchEmployees(
        query: string,
        filters?: {
            status?: EmployeeStatus;
            departmentId?: string;
            positionId?: string;
        }
    ): Promise<EmployeeProfile[]> {
        const searchFilter: any = {
            $or: [
                { firstName: { $regex: query, $options: 'i' } },
                { lastName: { $regex: query, $options: 'i' } },
                { fullName: { $regex: query, $options: 'i' } },
                { workEmail: { $regex: query, $options: 'i' } },
                { employeeNumber: { $regex: query, $options: 'i' } },
                { nationalId: { $regex: query, $options: 'i' } },
            ]
        };

        if (filters?.status) {
            searchFilter.status = filters.status;
        }
        if (filters?.departmentId) {
            searchFilter.primaryDepartmentId = new Types.ObjectId(filters.departmentId);
        }
        if (filters?.positionId) {
            searchFilter.primaryPositionId = new Types.ObjectId(filters.positionId);
        }

        return this.employeeProfileModel.find(searchFilter)
            .populate('primaryPositionId', 'title')
            .populate('primaryDepartmentId', 'name')
            .select('firstName lastName fullName employeeNumber workEmail primaryPositionId primaryDepartmentId status dateOfHire')
            .lean()
            .exec();
    }

    async adminGetProfile(id: string): Promise<EmployeeProfile> {
        const profile = await this.employeeProfileModel.findById(id)
            .populate('primaryPositionId')
            .populate('primaryDepartmentId')
            .populate('supervisorPositionId')
            .populate('lastAppraisalRecordId')
            .populate('lastAppraisalCycleId')
            .populate('lastAppraisalTemplateId')
            .populate('accessProfileId');

        if (!profile) {
            throw new NotFoundException('Employee profile not found');
        }
        return profile;
    }

    async adminUpdateProfile(id: string, dto: AdminUpdateProfileDto, userId?: string): Promise<EmployeeProfile> {
        const profile = await this.employeeProfileModel.findById(id);
        if (!profile) {
            throw new NotFoundException('Employee profile not found');
        }

        // Update Position
        if (dto.primaryPositionId && dto.primaryPositionId !== profile.primaryPositionId?.toString()) {
            profile.primaryPositionId = new Types.ObjectId(dto.primaryPositionId);
        }

        // Update Department
        if (dto.primaryDepartmentId && dto.primaryDepartmentId !== profile.primaryDepartmentId?.toString()) {
            profile.primaryDepartmentId = new Types.ObjectId(dto.primaryDepartmentId);
        }

        // Update Supervisor Position
        if (dto.supervisorPositionId && dto.supervisorPositionId !== profile.supervisorPositionId?.toString()) {
            profile.supervisorPositionId = new Types.ObjectId(dto.supervisorPositionId);
        }

        // Update Status (BR 3j: Employee status definition for system access control)
        if (dto.status && dto.status !== profile.status) {
            profile.status = dto.status;
            profile.statusEffectiveFrom = new Date();
        }

        // Update Contract Type (BR 3f, 3g)
        if (dto.contractType && dto.contractType !== profile.contractType) {
            profile.contractType = dto.contractType;
        }

        // Update Work Type
        if (dto.workType && dto.workType !== profile.workType) {
            profile.workType = dto.workType;
        }

        // Update Date of Hire (BR 3b)
        if (dto.dateOfHire) {
            const newDate = new Date(dto.dateOfHire);
            if (newDate.getTime() !== profile.dateOfHire?.getTime()) {
                profile.dateOfHire = newDate;
            }
        }

        // Update Contract Start Date
        if (dto.contractStartDate) {
            const newDate = new Date(dto.contractStartDate);
            if (newDate.getTime() !== profile.contractStartDate?.getTime()) {
                profile.contractStartDate = newDate;
            }
        }

        // Update Contract End Date
        if (dto.contractEndDate) {
            const newDate = new Date(dto.contractEndDate);
            if (newDate.getTime() !== profile.contractEndDate?.getTime()) {
                profile.contractEndDate = newDate;
            }
        }

        // Update Work Email
        if (dto.workEmail && dto.workEmail !== profile.workEmail) {
            profile.workEmail = dto.workEmail;
        }

        // TODO: Trigger N-037 (Profile updated) notification
        // TODO: If position/department changed, trigger Org Structure Module update

        return profile.save();
    }


    async adminDeactivateEmployee(id: string, userId?: string): Promise<EmployeeProfile> {
        const profile = await this.employeeProfileModel.findById(id);
        if (!profile) {
            throw new NotFoundException('Employee profile not found');
        }

        profile.status = EmployeeStatus.TERMINATED;
        profile.statusEffectiveFrom = new Date();

        // TODO: BR 20, BR 17 - Trigger notifications to:
        //   - Payroll Module: Block payment
        //   - Time Management Module: Sync status update
        //   - Analytics Module: Update compliance reports

        return profile.save();
    }

    async adminAssignRole(id: string, dto: AdminAssignRoleDto, userId?: string): Promise<EmployeeProfile> {
        const profile = await this.employeeProfileModel.findById(id);
        if (!profile) {
            throw new NotFoundException('Employee profile not found');
        }

        const role = await this.systemRoleModel.findById(dto.accessProfileId);
        if (!role) {
            throw new NotFoundException('System role not found');
        }

        profile.accessProfileId = new Types.ObjectId(dto.accessProfileId);


        return profile.save();
    }

    async getChangeRequests(status?: ProfileChangeStatus): Promise<EmployeeProfileChangeRequest[]> {
        const filter = status ? { status } : {};
        return this.changeRequestModel.find(filter)
            .populate('employeeProfileId', 'firstName lastName fullName employeeNumber')
            .sort({ submittedAt: -1 });
    }


    async processChangeRequest(
        requestId: string,
        status: ProfileChangeStatus.APPROVED | ProfileChangeStatus.REJECTED,
        userId?: string
    ): Promise<EmployeeProfileChangeRequest> {
        const request = await this.changeRequestModel.findOne({ requestId })
            .populate('employeeProfileId');

        if (!request) {
            throw new NotFoundException('Change request not found');
        }

        if (request.status !== ProfileChangeStatus.PENDING) {
            throw new BadRequestException('Request is not pending');
        }

        request.status = status;
        request.processedAt = new Date();

        if (status === ProfileChangeStatus.APPROVED) {
            // TODO: Apply changes to profile if data fields are tracked in change request
            // TODO: Trigger notification N-037 (Profile updated) to employee & HR
            // TODO: If change affects Position/Department, trigger Org Structure Module update
        } else {
            // TODO: Trigger notification N-037 (Profile rejected) to employee
        }


        return request.save();
    }
}

