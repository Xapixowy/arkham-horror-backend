import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@Decorators/public.decorator';
import { RequestHelper } from '@Helpers/request/request.helper';
import { UserService } from '@Services/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = RequestHelper.extractTokenFromHeaders(request.headers);

    if (!token) {
      throw new UnauthorizedException();
    }

    const isUserExist = await this.userService.isUserExist({
      token,
    });

    if (!isUserExist) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
