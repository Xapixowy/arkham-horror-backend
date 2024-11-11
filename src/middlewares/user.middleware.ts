import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { RequestHelper } from '@Helpers/request/request.helper';
import { UserService } from '@Services/user/user.service';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(private readonly userService: UserService) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const token = RequestHelper.extractTokenFromHeaders(
      req.headers as Record<string, string>,
    );

    req['user'] = token
      ? await this.userService.getUserByJwtToken(token, [
          'players',
          'players.game_session',
        ])
      : null;

    next();
  }
}
