import { Controller, Post, Body, HttpCode, HttpStatus, Get, Param } from '@nestjs/common';
import { Public } from '../decorators/public-decorator';
import { EmployeeAuthService } from '../services/employee-auth.service';
import { ApiTags } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmployeeProfile, EmployeeProfileDocument } from '../../employee/models/employee/employee-profile.schema';

@Controller('debug')
@ApiTags('Debug')
export class DebugController {
  constructor(
    private readonly employeeAuth: EmployeeAuthService,
    @InjectModel(EmployeeProfile.name) private readonly employeeModel: Model<EmployeeProfileDocument>,
  ) {}

  @Public()
  @Post('check-user')
  @HttpCode(HttpStatus.OK)
  async checkUser(@Body() body: { email: string }) {
    const { email } = body;

    const employee = await this.employeeAuth.findEmployeeByWorkEmail(email);
    const candidate = await this.employeeAuth.findCandidateByPersonalEmail(email);

    const result: any = {
      email,
      employeeExists: !!employee,
      candidateExists: !!candidate,
    };

    if (employee) {
      result.employee = {
        _id: employee._id,
        workEmail: employee.workEmail,
        personalEmail: employee.personalEmail,
        employeeNumber: employee.employeeNumber,
        firstName: employee.firstName,
        lastName: employee.lastName,
        hasPassword: !!employee.password,
        passwordHashLength: employee.password?.length,
        passwordStartsWithDollar: employee.password?.startsWith('$2'),
      };
    }

    if (candidate) {
      result.candidate = {
        _id: candidate._id,
        personalEmail: candidate.personalEmail,
        candidateNumber: candidate.candidateNumber,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        hasPassword: !!candidate.password,
        passwordHashLength: candidate.password?.length,
        passwordStartsWithDollar: candidate.password?.startsWith('$2'),
      };
    }

    return result;
  }

  @Public()
  @Post('test-password')
  @HttpCode(HttpStatus.OK)
  async testPassword(@Body() body: { email: string; password: string }) {
    const { email, password } = body;

    const employee = await this.employeeAuth.findEmployeeByWorkEmail(email);
    const candidate = await this.employeeAuth.findCandidateByPersonalEmail(email);

    const result: any = {
      email,
      passwordProvided: !!password,
      passwordLength: password?.length,
    };

    if (employee) {
      result.employee = {
        found: true,
        workEmail: employee.workEmail,
        hasPassword: !!employee.password,
        passwordHashLength: employee.password?.length,
        isBcryptHash: employee.password?.startsWith('$2'),
      };

      if (employee.password) {
        try {
          const isValid = await bcrypt.compare(password, employee.password);
          result.employee.passwordMatch = isValid;
        } catch (error: any) {
          result.employee.passwordMatchError = error.message;
        }
      }
    } else {
      result.employee = { found: false };
    }

    if (candidate) {
      result.candidate = {
        found: true,
        personalEmail: candidate.personalEmail,
        hasPassword: !!candidate.password,
        passwordHashLength: candidate.password?.length,
        isBcryptHash: candidate.password?.startsWith('$2'),
      };

      if (candidate.password) {
        try {
          const isValid = await bcrypt.compare(password, candidate.password);
          result.candidate.passwordMatch = isValid;
        } catch (error: any) {
          result.candidate.passwordMatchError = error.message;
        }
      }
    } else {
      result.candidate = { found: false };
    }

    return result;
  }

  @Public()
  @Post('set-password')
  @HttpCode(HttpStatus.OK)
  async setPassword(@Body() body: { email: string; password: string }) {
    const { email, password } = body;

    if (!password || password.length < 6) {
      return { error: 'Password must be at least 6 characters long' };
    }

    const employee = await this.employeeAuth.findEmployeeByWorkEmail(email);
    if (!employee) {
      return { error: 'Employee not found', email };
    }

    const hashedPassword = await this.employeeAuth.hashPassword(password);
    await this.employeeModel.updateOne(
      { _id: employee._id },
      { $set: { password: hashedPassword } }
    ).exec();

    return {
      success: true,
      message: 'Password set successfully',
      email: employee.workEmail,
      employeeId: employee._id.toString(),
    };
  }

  @Public()
  @Post('set-password-for-all')
  @HttpCode(HttpStatus.OK)
  async setPasswordForAll(@Body() body: { password: string }) {
    const { password } = body;
    const defaultPassword = password || 'RoleUser@1234';

    if (!defaultPassword || defaultPassword.length < 6) {
      return { error: 'Password must be at least 6 characters long' };
    }

    const hashedPassword = await this.employeeAuth.hashPassword(defaultPassword);

    // Find all employees without passwords
    const employeesWithoutPasswords = await this.employeeModel.find({
      $or: [
        { password: { $exists: false } },
        { password: null },
        { password: '' },
      ],
      workEmail: { $exists: true, $ne: null },
    }).exec();

    const results: Array<{ employeeId: string; workEmail?: string; employeeNumber?: string }> = [];
    for (const emp of employeesWithoutPasswords) {
      await this.employeeModel.updateOne(
        { _id: emp._id },
        { $set: { password: hashedPassword } }
      ).exec();
      results.push({
        employeeId: emp._id.toString(),
        workEmail: emp.workEmail,
        employeeNumber: emp.employeeNumber,
      });
    }

    return {
      success: true,
      message: `Password set for ${results.length} employees`,
      defaultPassword,
      employeesUpdated: results,
    };
  }
}
