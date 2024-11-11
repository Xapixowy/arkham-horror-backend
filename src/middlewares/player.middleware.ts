import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { PlayerService } from '@Services/player/player.service';
import { ConfigService } from '@nestjs/config';
import { RegexConfig } from '@Configs/regex.config';

@Injectable()
export class PlayerMiddleware implements NestMiddleware {
  constructor(
    private readonly playerService: PlayerService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const regexConfig = this.configService.get<RegexConfig>('regex');

    const token = req.headers['player-token'] as string | undefined;

    req['player'] =
      token && regexConfig.uuid.test(token)
        ? await this.playerService.getPlayerByToken(token)
        : null;

    next();
  }
}
