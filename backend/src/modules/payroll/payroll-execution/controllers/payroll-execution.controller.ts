import { Controller, Post, Body, Param, UseGuards, HttpCode, HttpStatus, Get, Query } from '@nestjs/common';
import { PayrollExecutionService } from '../services/payroll-execution.service';
import { SigningBonusEditDto } from '../dto/signing-bonus-edit.dto';
import { PayrollInitiationDto } from '../dto/payroll-initiation.dto';
import { PayrollUnfreezeDto } from '../dto/unfreeze.dto';
import { GeneratePayslipsDto } from '../dto/generate-payslips.dto';
import { PayrollDraftResponseDto } from '../dto/payroll-draft-response.dto';
import { PayrollApproveDto } from '../dto/approve.dto';
import { employeeSigningBonusSchema } from '../models/EmployeeSigningBonus.schema';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, getSchemaPath, ApiBody, ApiParam, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { BonusStatus } from '../enums/payroll-execution-enum';
import { AuthenticationGuard } from '../../../auth/guards/authentication-guard';
import { AuthorizationGuard } from '../../../auth/guards/authorization-guard';
import { Roles } from '../../../auth/decorators/Roles-Decorator';
import { CurrentUser } from '../../../auth/decorators/Current-User';
import { SystemRole } from '../../../employee/enums/employee-profile.enums';
import type { JwtPayload } from '../../../auth/token/JWT-Payload';

@Controller('payroll-execution')
@ApiTags('Payroll Execution')
@ApiBearerAuth()
export class PayrollExecutionController {
	constructor(private readonly payrollService: PayrollExecutionService) {}
    @UseGuards(AuthenticationGuard, AuthorizationGuard)
    @Roles(SystemRole.PAYROLL_SPECIALIST)
    @Post('approve-signing-bonuses')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Approve all pending signing bonuses' })
    @ApiResponse({ status: 200, description: 'Signing bonuses approved' })
    async approveSigningBonuses(@CurrentUser() user: JwtPayload) {
       
        await this.payrollService.approveSigningBonuses(user?.sub);
        return { status: 'all_signing_bonuses_approved' };

    }

	@UseGuards(AuthenticationGuard, AuthorizationGuard)
	@Roles(SystemRole.PAYROLL_SPECIALIST)
	@Get('signing-bonuses')
	@ApiOperation({ summary: 'List signing bonuses (optional status filter)' })
	@ApiResponse({ status: 200, description: 'List of signing bonuses' })
	@ApiQuery({ name: 'status', required: false, enum: BonusStatus })
	async listSigningBonuses(@Query('status') statusParam: string | undefined) {
		//  ?status=pending
		const status = statusParam as any;
		const items = await this.payrollService.listSigningBonuses(status);
		return items;
	}

	@UseGuards(AuthenticationGuard, AuthorizationGuard)
	@Roles(SystemRole.PAYROLL_SPECIALIST)
	@Get('signing-bonuses/:id')
	@ApiOperation({ summary: 'Get a single signing bonus by id' })
	@ApiParam({ name: 'id', description: 'Signing bonus id', type: 'string' })
	async getSigningBonus(@Param('id') id: string) {
		const item = await this.payrollService.getSigningBonus(id);
		return item;
	}

	@UseGuards(AuthenticationGuard, AuthorizationGuard)
	@Roles(SystemRole.PAYROLL_SPECIALIST)
	@ApiOperation({ summary: 'Edit a signing bonus' })
	@Post('signing-bonuses/:id/edit')
	@ApiParam({ name: 'id', description: 'Signing bonus id', type: 'string' })
	@ApiBody({ type: SigningBonusEditDto })
	@ApiConsumes('application/json')
	async editSigningBonus(@Param('id') id: string, @Body() dto: SigningBonusEditDto, @CurrentUser() user: JwtPayload) {
		const updated = await this.payrollService.updateSigningBonus(id, dto, user?.sub);
		return updated;
	}

	@UseGuards(AuthenticationGuard, AuthorizationGuard)
	@Roles(SystemRole.PAYROLL_SPECIALIST)
	@Post('signing-bonuses/:id/approve')
	@ApiOperation({ summary: 'Approve a single signing bonus' })
	@ApiParam({ name: 'id', description: 'Signing bonus id', type: 'string' })
	async approveSingleSigningBonus(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
		const updated = await this.payrollService.approveSigningBonus(id, user?.sub);
		return updated;
	}

	@UseGuards(AuthenticationGuard, AuthorizationGuard)
	@Roles(SystemRole.PAYROLL_SPECIALIST)
	@Post('initiate')
	@HttpCode(HttpStatus.ACCEPTED)
	@ApiOperation({ summary: 'Initiate payroll run (draft generation)' })
	@ApiResponse({ status: 202, description: 'Payroll initiation accepted' })
	@ApiBody({ type: PayrollInitiationDto })
	@ApiConsumes('application/json')
	async initiatePayroll(@Body() dto: PayrollInitiationDto, @CurrentUser() user: JwtPayload) {
		// return job/acknowledgement
		const job = await this.payrollService.initiatePayroll(dto, user?.sub);
		return { jobId: job?.id ?? null, status: 'queued' };
	}

	@UseGuards(AuthenticationGuard, AuthorizationGuard)
	@Roles(SystemRole.PAYROLL_SPECIALIST, SystemRole.HR_MANAGER)
	@Get('draft/:id')
	@ApiOperation({ summary: 'Fetch payroll draft by id' })
	@ApiResponse({ status: 200, description: 'Payroll draft', type: PayrollDraftResponseDto })
	@ApiParam({ name: 'id', description: 'Draft id', type: 'string' })
	async getDraft(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
		const draft = await this.payrollService.getDraft(id, user?.sub);
		return draft;
	}

	@UseGuards(AuthenticationGuard, AuthorizationGuard)
	@Roles(SystemRole.HR_MANAGER)
	@Post(':id/approve')
	@ApiParam({ name: 'id', description: 'Payroll run id', type: 'string' })
	async approvePayroll(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
		await this.payrollService.approvePayroll(id, user?.sub);
		return { id, status: 'approved' };
	}

	@UseGuards(AuthenticationGuard, AuthorizationGuard)
	@Roles(SystemRole.HR_MANAGER)
	@Post(':id/freeze')
	@ApiParam({ name: 'id', description: 'Payroll run id', type: 'string' })
	async freezePayroll(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
		await this.payrollService.freezePayroll(id, user?.sub);
		return { id, status: 'frozen' };
	}

	@UseGuards(AuthenticationGuard, AuthorizationGuard)
	@Roles(SystemRole.HR_MANAGER)
	@Post(':id/unfreeze')
	@ApiOperation({ summary: 'Unfreeze payroll (requires reason)' })
	@ApiParam({ name: 'id', description: 'Payroll run id', type: 'string' })
	@ApiBody({ type: PayrollUnfreezeDto })
	@ApiConsumes('application/json')
	async unfreezePayroll(@Param('id') id: string, @Body() body: PayrollUnfreezeDto, @CurrentUser() user: JwtPayload) {
		await this.payrollService.unfreezePayroll(id, user?.sub, body?.reason);
		return { id, status: 'unfrozen' };
	}

	@UseGuards(AuthenticationGuard, AuthorizationGuard)
	@Roles(SystemRole.FINANCE_STAFF)
	@Post(':id/generate-payslips')
	@ApiOperation({ summary: 'Generate and distribute payslips for payroll run' })
	@ApiParam({ name: 'id', description: 'Payroll run id', type: 'string' })
	@ApiBody({ type: GeneratePayslipsDto })
	@ApiConsumes('application/json')
	async generatePayslips(@Param('id') id: string, @Body() body: GeneratePayslipsDto, @CurrentUser() user: JwtPayload) {
		await this.payrollService.generatePayslips(id, user?.sub);
		return { id, status: 'payslips_generated' };
	}
}
