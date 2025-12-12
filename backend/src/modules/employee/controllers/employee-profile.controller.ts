import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { UpdateContactInfoDto } from '../dto/employee-profile/update-contact-info.dto';
import { UpdateBioDto } from '../dto/employee-profile/update-bio.dto';
import { CreateCorrectionRequestDto } from '../dto/employee-profile/create-correction-request.dto';
import { AdminUpdateProfileDto } from '../dto/employee-profile/admin-update-profile.dto';
import { AdminAssignRoleDto } from '../dto/employee-profile/admin-assign-role.dto';
import { SearchEmployeesDto, PaginationQueryDto } from '../dto/employee-profile/search-employees.dto';
import { ProcessChangeRequestDto } from '../dto/employee-profile/process-change-request.dto';
import { ProfileChangeStatus } from '../enums/employee-profile.enums';
import { EmployeeProfileService } from '../services/employee-profile.service';

@Controller('employee-profile')
export class EmployeeProfileController {
    constructor(private readonly employeeProfileService: EmployeeProfileService) {}

    @Get('me')
    async getMyProfile(@Query('userId') userId: string) {
        return this.employeeProfileService.getProfile(userId);
    }

    @Patch('me/contact-info')
    async updateContactInfo(@Query('userId') userId: string, @Body() dto: UpdateContactInfoDto) {
        return this.employeeProfileService.updateContactInfo(userId, dto);
    }

    @Patch('me/bio')
    async updateBio(@Query('userId') userId: string, @Body() dto: UpdateBioDto) {
        return this.employeeProfileService.updateBio(userId, dto);
    }

    @Post('me/correction-request')
    async createCorrectionRequest(@Query('userId') userId: string, @Body() dto: CreateCorrectionRequestDto) {
        return this.employeeProfileService.createCorrectionRequest(userId, dto);
    }

    @Get('me/correction-requests')
    async getMyChangeRequests(@Query('userId') userId: string, @Query() queryDto: PaginationQueryDto) {
        return this.employeeProfileService.getMyChangeRequests(userId, queryDto);
    }

    @Patch('me/correction-requests/:requestId/cancel')
    async cancelMyChangeRequest(@Query('userId') userId: string, @Param('requestId') requestId: string) {
        return this.employeeProfileService.cancelMyChangeRequest(userId, requestId);
    }

    @Get('team')
    async getTeamProfiles(@Query('userId') managerId: string) {
        return this.employeeProfileService.getTeamProfiles(managerId);
    }

    @Get('team/paginated')
    async getTeamProfilesPaginated(@Query('userId') managerId: string, @Query() queryDto: PaginationQueryDto) {
        return this.employeeProfileService.getTeamProfilesPaginated(managerId, queryDto);
    }

    @Get('admin/employees')
    async getAllEmployees(@Query() queryDto: SearchEmployeesDto) {
        return this.employeeProfileService.getAllEmployees(queryDto);
    }

    @Get('admin/search')
    async searchEmployees(@Query() queryDto: SearchEmployeesDto) {
        return this.employeeProfileService.searchEmployees(queryDto);
    }

    @Get('admin/change-requests')
    async getChangeRequests(
        @Query('status') status?: ProfileChangeStatus,
        @Query('page') page?: number,
        @Query('limit') limit?: number
    ) {
        return this.employeeProfileService.getChangeRequests(status, page || 1, limit || 20);
    }

    @Get('admin/change-requests/count/pending')
    async getPendingChangeRequestsCount() {
        const count = await this.employeeProfileService.getPendingChangeRequestsCount();
        return { count };
    }

    @Get('admin/change-requests/:requestId')
    async getChangeRequestById(@Param('requestId') requestId: string) {
        return this.employeeProfileService.getChangeRequestById(requestId);
    }

    @Patch('admin/change-requests/:requestId/process')
    async processChangeRequest(
        @Param('requestId') requestId: string,
        @Body() dto: ProcessChangeRequestDto
    ) {
        return this.employeeProfileService.processChangeRequest(requestId, dto.status, undefined, dto.rejectionReason);
    }

    @Get('admin/stats/by-status')
    async getEmployeeCountByStatus() {
        return this.employeeProfileService.getEmployeeCountByStatus();
    }

    @Get('admin/stats/by-department')
    async getEmployeeCountByDepartment() {
        return this.employeeProfileService.getEmployeeCountByDepartment();
    }

    @Get(':id')
    async getProfile(@Param('id') id: string) {
        return this.employeeProfileService.adminGetProfile(id);
    }

    @Patch(':id')
    async updateProfile(@Param('id') id: string, @Body() dto: AdminUpdateProfileDto) {
        return this.employeeProfileService.adminUpdateProfile(id, dto);
    }

    @Patch(':id/deactivate')
    async deactivateEmployee(@Param('id') id: string) {
        return this.employeeProfileService.adminDeactivateEmployee(id);
    }

    @Patch(':id/role')
    async assignRole(@Param('id') id: string, @Body() dto: AdminAssignRoleDto) {
        return this.employeeProfileService.adminAssignRole(id, dto);
    }
}

