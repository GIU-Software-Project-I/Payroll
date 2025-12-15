import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { Public } from '../decorators/public-decorator';
import { EmployeeAuthService } from '../services/employee-auth.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('debug')
@ApiTags('Debug')
export class DebugController {
  constructor(private readonly employeeAuth: EmployeeAuthService) {}

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
      };
    }

    return result;
  }
}
