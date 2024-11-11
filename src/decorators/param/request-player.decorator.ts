import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Player } from '@Entities/player.entity';

export const RequestPlayer = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Player | null => {
    const request = ctx.switchToHttp().getRequest();
    return request.player;
  },
);
