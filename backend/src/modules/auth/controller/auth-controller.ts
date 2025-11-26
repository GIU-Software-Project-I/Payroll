import {Controller, Post, Body, HttpCode, HttpStatus, Req, Res, UseGuards, InternalServerErrorException, Patch, Param,} from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../decorators/Public-Decorator';
import { Roles } from '../decorators/Roles-Decorator';
import { AuthService } from '../services/authentication-service';

import { AuthenticationGuard} from '../guards/authentication-guard';
import { AuthorizationGuard } from '../guards/authorization-guard';
import { SystemRole } from '../../employee/enums/employee-profile.enums';
import {RegisterEmployeeDto} from "../dto/RegisterEmployee.dto";
import {RegisterCandidateDto} from "../dto/RegisterCandidate.dto";
import {LoginDto} from "../dto/Login";


@Controller('auth')
export class AuthController {
    constructor(private readonly auth: AuthService) {}

    @UseGuards(AuthenticationGuard, AuthorizationGuard)
    @Roles(SystemRole.HR_ADMIN, SystemRole.SYSTEM_ADMIN)
    @Post('register-employee')
    async registerEmployee(@Body() dto: RegisterEmployeeDto) {
        try {
            return await this.auth.registerEmployee(dto);
        } catch (e) {
            throw new InternalServerErrorException('Something went wrong during employee registration.');
        }
    }

    @Public()
    @Post('register-candidate')
    async registerCandidate(@Body() dto: RegisterCandidateDto) {
        try {
            return await this.auth.registerCandidate(dto);
        } catch (e) {
            throw new InternalServerErrorException('Something went wrong during candidate registration.');
        }
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const result = await this.auth.login(dto.email, dto.password);
        const cookie = await this.auth.getCookieWithJwtToken(result.access_token);
        res.setHeader('Set-Cookie', cookie);
        return {
            message: 'Login successful',
            user: result.user,
            userType: result.userType,
            expiresIn: '7d'
        };
    }

    @UseGuards(AuthenticationGuard)
    @HttpCode(HttpStatus.OK)
    @Post('logout')
    async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
        const token = req.cookies?.access_token;
        if (token) {
            await this.auth.logout(token);
        }
        const cookie = await this.auth.getCookieForLogout();
        res.setHeader('Set-Cookie', cookie);
        return { message: 'Logout successful' };
    }


}

