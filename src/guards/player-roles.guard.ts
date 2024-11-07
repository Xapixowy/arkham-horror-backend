import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@Decorators/user-roles.decorator';
import { PlayerRole } from '@Enums/player/player-role.enum';

@Injectable()
export class PlayerRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<PlayerRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();

    if (user.role === PlayerRole.HOST) {
      return true;
    }

    return requiredRoles.some((role) => user.role === role);
  }
}
