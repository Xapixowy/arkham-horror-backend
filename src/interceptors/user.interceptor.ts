import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { RequestHelper } from '@helpers/request.helper';
import { UserService } from '@services/user.service';

@Injectable()
export class UserInterceptor implements NestInterceptor {
  constructor(private readonly userService: UserService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const request = context.switchToHttp().getRequest();
    const token = RequestHelper.extractTokenFromHeaders(request.headers);

    request['user'] = token
      ? await this.userService.getUserByToken(token)
      : null;

    return next.handle();
  }
}
