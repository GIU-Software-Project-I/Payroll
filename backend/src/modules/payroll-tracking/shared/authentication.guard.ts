import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  canActivate(_context: ExecutionContext): boolean {
    // Stub: assume authentication has already run in a global guard/middleware
    return true;
  }
}


