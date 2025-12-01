import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || [];

    if (!requiredRoles.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as { roles?: string[] } | undefined;

    if (!user?.roles?.some((role) => requiredRoles.includes(role))) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}


