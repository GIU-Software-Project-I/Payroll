import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';

import { UpdateContactInfoDto } from '../dto/employee-profile/update-contact-info.dto';
import { UpdateBioDto } from '../dto/employee-profile/update-bio.dto';
import { CreateCorrectionRequestDto } from '../dto/employee-profile/create-correction-request.dto';
import { AdminUpdateProfileDto } from '../dto/employee-profile/admin-update-profile.dto';
import { AdminAssignRoleDto } from '../dto/employee-profile/admin-assign-role.dto';
import { ProfileChangeStatus, EmployeeStatus } from '../enums/employee-profile.enums';
import {EmployeeProfileService} from "../services/employee-profile.service";

// Mock AuthGuard - Replace with actual AuthGuard from your auth module
// import { AuthGuard } from '../guards/auth.guard';
// import { RolesGuard } from '../guards/roles.guard';
// import { Roles } from '../decorators/roles.decorator';

@Controller('employee-profile')
export class EmployeeProfileController {
    constructor(private readonly employeeProfileService: EmployeeProfileService) { }

    // --- Self-Service ---

    /**
     * US-E2-04: View full employee profile
     * GET /employee-profile/me
     */
    @Get('me')
    // @UseGuards(AuthGuard)
    async getMyProfile(@Req() req: any) {
        const userId = req.user?.userId || req.query.userId;
        return this.employeeProfileService.getProfile(userId);
    }

    /**
     * US-E2-05: Update contact information
     * PATCH /employee-profile/me/contact-info
     * BR 2g, 2n, 2o: Phone, Email, Address requirements
     */
    @Patch('me/contact-info')
    // @UseGuards(AuthGuard)
    async updateContactInfo(@Req() req: any, @Body() dto: UpdateContactInfoDto) {
        const userId = req.user?.userId || req.query.userId;
        return this.employeeProfileService.updateContactInfo(userId, dto);
    }

    /**
     * US-E2-12: Add biography and upload profile picture
     * PATCH /employee-profile/me/bio
     */
    @Patch('me/bio')
    // @UseGuards(AuthGuard)
    async updateBio(@Req() req: any, @Body() dto: UpdateBioDto) {
        const userId = req.user?.userId || req.query.userId;
        return this.employeeProfileService.updateBio(userId, dto);
    }

    /**
     * US-E6-02: Request corrections of data (job title, department)
     * US-E2-06: Submit requests to change legal name or marital status
     * POST /employee-profile/me/correction-request
     * BR 20a: Only authorized roles can create requests
     * BR 36: Changes must be made via workflow approval
     */
    @Post('me/correction-request')
    // @UseGuards(AuthGuard)
    async createCorrectionRequest(@Req() req: any, @Body() dto: CreateCorrectionRequestDto) {
        const userId = req.user?.userId || req.query.userId;
        return this.employeeProfileService.createCorrectionRequest(userId, dto);
    }

    // --- Manager View ---

    /**
     * US-E4-01: View team members' profiles (excluding sensitive info)
     * US-E4-02: See summary of team's job titles and departments
     * GET /employee-profile/team
     * BR 41b: Direct Managers see their team only
     * BR 18b: Privacy restrictions applied for managers
     */
    @Get('team')
    // @UseGuards(AuthGuard)
    async getTeamProfiles(@Req() req: any) {
        const managerId = req.user?.userId || req.query.userId;
        return this.employeeProfileService.getTeamProfiles(managerId);
    }

    // --- HR / Admin ---

    /**
     * US-E6-03: Search for employees data
     * GET /employee-profile/admin/search
     * Supports filtering by status, department, position
     */
    @Get('admin/search')
    // @UseGuards(AuthGuard, RolesGuard)
    // @Roles('HR_ADMIN', 'SYSTEM_ADMIN')
    async searchEmployees(
        @Query('query') query: string,
        @Query('status') status?: EmployeeStatus,
        @Query('departmentId') departmentId?: string,
        @Query('positionId') positionId?: string,
    ) {
        if (!query) {
            throw new Error('Search query is required');
        }
        return this.employeeProfileService.searchEmployees(query, {
            status,
            departmentId,
            positionId,
        });
    }

    /**
     * Get all pending change requests for HR approval
     * GET /employee-profile/admin/change-requests
     * BR 36: All changes must be via workflow approval
     */
    @Get('admin/change-requests')
    // @UseGuards(AuthGuard, RolesGuard)
    // @Roles('HR_ADMIN', 'SYSTEM_ADMIN')
    async getChangeRequests(@Query('status') status?: ProfileChangeStatus) {
        return this.employeeProfileService.getChangeRequests(status);
    }

    /**
     * US-E2-03: Review and approve employee-submitted profile changes
     * PATCH /employee-profile/admin/change-requests/:requestId/process
     * BR 36: All changes must be made via workflow approval
     * BR 22: Trace all editing with timestamps
     */
    @Patch('admin/change-requests/:requestId/process')
    // @UseGuards(AuthGuard, RolesGuard)
    // @Roles('HR_ADMIN', 'SYSTEM_ADMIN')
    async processChangeRequest(
        @Param('requestId') requestId: string,
        @Body('status') status: ProfileChangeStatus.APPROVED | ProfileChangeStatus.REJECTED,
        @Req() req: any
    ) {
        const userId = req.user?.userId;
        return this.employeeProfileService.processChangeRequest(requestId, status, userId);
    }

    /**
     * Get single employee profile (Admin view)
     * GET /employee-profile/:id
     * BR 20a: Only authorized roles can view complete profile
     */
    @Get(':id')
    // @UseGuards(AuthGuard, RolesGuard)
    // @Roles('HR_ADMIN', 'SYSTEM_ADMIN')
    async getProfile(@Param('id') id: string) {
        return this.employeeProfileService.adminGetProfile(id);
    }

    /**
     * US-EP-04: Edit any part of employee profile
     * PATCH /employee-profile/:id
     * BR 20a: Only authorized roles can modify data
     * BR 22: Trace all editing with timestamps and user IDs
     */
    @Patch(':id')
    // @UseGuards(AuthGuard, RolesGuard)
    // @Roles('HR_ADMIN', 'SYSTEM_ADMIN')
    async updateProfile(
        @Param('id') id: string,
        @Body() dto: AdminUpdateProfileDto,
        @Req() req: any
    ) {
        const userId = req.user?.userId;
        return this.employeeProfileService.adminUpdateProfile(id, dto, userId);
    }

    /**
     * US-EP-05: Deactivate employee profile upon termination/resignation
     * PATCH /employee-profile/:id/deactivate
     * BR 3j: Employee status controls system access
     * BR 20: Automatic synchronization to Payroll (block payment) and Time Management
     */
    @Patch(':id/deactivate')
    // @UseGuards(AuthGuard, RolesGuard)
    // @Roles('HR_ADMIN', 'SYSTEM_ADMIN')
    async deactivateEmployee(
        @Param('id') id: string,
        @Req() req: any
    ) {
        const userId = req.user?.userId;
        return this.employeeProfileService.adminDeactivateEmployee(id, userId);
    }

    /**
     * US-E7-05: Assign roles and access permissions to employees
     * PATCH /employee-profile/:id/role
     * BR 20a: Only authorized roles can assign permissions
     * BR 22: Trace role assignments with timestamps
     */
    @Patch(':id/role')
    // @UseGuards(AuthGuard, RolesGuard)
    // @Roles('HR_ADMIN', 'SYSTEM_ADMIN')
    async assignRole(
        @Param('id') id: string,
        @Body() dto: AdminAssignRoleDto,
        @Req() req: any
    ) {
        const userId = req.user?.userId;
        return this.employeeProfileService.adminAssignRole(id, dto, userId);
    }
}

