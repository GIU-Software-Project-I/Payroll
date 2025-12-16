import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { EmployeeProfile, EmployeeProfileDocument } from '../../employee/models/employee/employee-profile.schema';
import { EmployeeSystemRole, EmployeeSystemRoleDocument } from '../../employee/models/employee/employee-system-role.schema';
import { Candidate, CandidateDocument } from '../../employee/models/employee/Candidate.Schema';

import { SystemRole } from '../../employee/enums/employee-profile.enums';
import {RegisterEmployeeDto} from "../dto/register-employee-dto";
import {RegisterCandidateDto} from "../dto/register-candidate-dto";

@Injectable()
export class EmployeeAuthService {
  constructor(
    @InjectModel(EmployeeProfile.name) private readonly employeeModel: Model<EmployeeProfileDocument>,
    @InjectModel(EmployeeSystemRole.name) private readonly employeeSystemRoleModel: Model<EmployeeSystemRoleDocument>,
    @InjectModel(Candidate.name) private readonly candidateModel: Model<CandidateDocument>,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  private async generateCandidateNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.candidateModel.countDocuments();
    return `CND-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  async findEmployeeByWorkEmail(workEmail: string): Promise<EmployeeProfileDocument | null> {
    // Normalize email: trim whitespace
    const normalizedEmail = workEmail.trim();
    // Escape special regex characters and use case-insensitive match
    const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.employeeModel.findOne({ 
      workEmail: { $regex: new RegExp(`^${escapedEmail}$`, 'i') }
    }).select('+password').exec();
  }

  async findEmployeeById(id: string): Promise<EmployeeProfileDocument | null> {
    return this.employeeModel.findById(id).exec();
  }

  async findCandidateByPersonalEmail(personalEmail: string): Promise<CandidateDocument | null> {
    // Normalize email: trim whitespace
    const normalizedEmail = personalEmail.trim();
    // Escape special regex characters and use case-insensitive match
    const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.candidateModel.findOne({ 
      personalEmail: { $regex: new RegExp(`^${escapedEmail}$`, 'i') }
    }).select('+password').exec();
  }

  async findCandidateById(id: string): Promise<CandidateDocument | null> {
    return this.candidateModel.findById(id).exec();
  }

  async createEmployee(dto: RegisterEmployeeDto): Promise<EmployeeProfileDocument> {
    // Check if employee already exists
    const existingByEmail = await this.employeeModel.findOne({ workEmail: dto.workEmail }).exec();
    if (existingByEmail) {
      throw new BadRequestException('Work email already in use');
    }

    const existingByEmpNumber = await this.employeeModel.findOne({ employeeNumber: dto.employeeNumber }).exec();
    if (existingByEmpNumber) {
      throw new BadRequestException('employee number already in use');
    }

    const existingByNationalId = await this.employeeModel.findOne({ nationalId: dto.nationalId }).exec();
    if (existingByNationalId) {
      throw new BadRequestException('National ID already in use');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(dto.password);

    // Create full name
    const fullName = dto.middleName
      ? `${dto.firstName} ${dto.middleName} ${dto.lastName}`
      : `${dto.firstName} ${dto.lastName}`;

    // Create employee profile
    const employeeProfile = await this.employeeModel.create({
      firstName: dto.firstName,
      middleName: dto.middleName,
      lastName: dto.lastName,
      fullName,
      nationalId: dto.nationalId,
      workEmail: dto.workEmail,
      personalEmail: dto.personalEmail,
      mobilePhone: dto.mobilePhone,
      password: hashedPassword,
      employeeNumber: dto.employeeNumber,
      dateOfHire: new Date(dto.dateOfHire),
    });

    // Create employee system roles
    await this.employeeSystemRoleModel.create({
      employeeProfileId: employeeProfile._id,
      roles: dto.roles || [SystemRole.DEPARTMENT_EMPLOYEE],
      permissions: [],
      isActive: true,
    });

    return employeeProfile;
  }

  async createCandidate(dto: RegisterCandidateDto): Promise<CandidateDocument> {
    // Check if candidate already exists
    const existingByEmail = await this.candidateModel.findOne({ personalEmail: dto.personalEmail }).exec();
    if (existingByEmail) {
      throw new BadRequestException('Email already in use');
    }

    const existingByNationalId = await this.candidateModel.findOne({ nationalId: dto.nationalId }).exec();
    if (existingByNationalId) {
      throw new BadRequestException('National ID already in use');
    }

    // Auto-generate candidate number
    const candidateNumber = await this.generateCandidateNumber();

    // Hash password
    const hashedPassword = await this.hashPassword(dto.password);

    // Create full name
    const fullName = dto.middleName
      ? `${dto.firstName} ${dto.middleName} ${dto.lastName}`
      : `${dto.firstName} ${dto.lastName}`;

    // Create candidate
    return await this.candidateModel.create({
      firstName: dto.firstName,
      middleName: dto.middleName,
      lastName: dto.lastName,
      fullName,
      nationalId: dto.nationalId,
      personalEmail: dto.personalEmail,
      mobilePhone: dto.mobilePhone,
      password: hashedPassword,
      candidateNumber,
      applicationDate: new Date(),
    });
  }

  async validateEmployeeCredentials(workEmail: string, plainPassword: string): Promise<{ employee: EmployeeProfileDocument; roles: SystemRole[] }> {
    // Normalize email input (trim whitespace)
    const normalizedEmail = workEmail.trim();
    const employee = await this.findEmployeeByWorkEmail(normalizedEmail);

    if (!employee) {
      console.log(`[Auth] Employee not found for email: ${normalizedEmail}`);
      throw new BadRequestException('Invalid credentials');
    }

    if (!employee.password) {
      console.log(`[Auth] Employee found but no password set for: ${normalizedEmail}`);
      throw new BadRequestException('Invalid credentials');
    }

    // Check if password is a bcrypt hash (starts with $2)
    if (!employee.password.startsWith('$2')) {
      console.log(`[Auth] Password for ${normalizedEmail} is not a bcrypt hash! Password value: ${employee.password.substring(0, 20)}...`);
      throw new BadRequestException('Invalid credentials - Password not properly hashed');
    }

    const isPasswordValid = await bcrypt.compare(plainPassword, employee.password);
    if (!isPasswordValid) {
      console.log(`[Auth] Password mismatch for: ${normalizedEmail}`);
      throw new BadRequestException('Invalid credentials');
    }

    console.log(`[Auth] Successful login for: ${normalizedEmail}, Employee ID: ${employee._id}`);

    // Get employee roles
    const systemRole = await this.employeeSystemRoleModel.findOne({ employeeProfileId: employee._id, isActive: true }).exec();
    const roles = systemRole?.roles || [SystemRole.DEPARTMENT_EMPLOYEE];
    
    console.log(`[Auth] Returning employee with _id: ${employee._id}, roles: ${roles}`);

    return { employee, roles };
  }

  async validateCandidateCredentials(personalEmail: string, plainPassword: string): Promise<CandidateDocument> {
    // Normalize email input (trim whitespace)
    const normalizedEmail = personalEmail.trim();
    const candidate = await this.findCandidateByPersonalEmail(normalizedEmail);

    if (!candidate) {
      throw new BadRequestException('Invalid credentials');
    }

    if (!candidate.password) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(plainPassword, candidate.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    return candidate;
  }


  async getEmployeeRoles(employeeId: string): Promise<SystemRole[]> {
    const systemRole = await this.employeeSystemRoleModel.findOne({
      employeeProfileId: employeeId,
      isActive: true
    }).exec();

    return systemRole?.roles || [SystemRole.DEPARTMENT_EMPLOYEE];
  }

}

