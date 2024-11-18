import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@Enums/user/user-role.enum';
import { USER_OWNER_KEY } from '@Decorators/user-owner.decorator';

@Injectable()
export class UserOwnerGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const userOwner = this.reflector.getAllAndOverride<boolean>(
      USER_OWNER_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!userOwner) {
      return true;
    }

    const { user, params } = context.switchToHttp().getRequest();

    if (!params?.userId) {
      return false;
    }

    if (user?.role === UserRole.ADMIN) {
      return true;
    }

    return user?.id === parseInt(params.userId);
  }
}
