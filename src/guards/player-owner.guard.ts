import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from '@Services/user/user.service';
import { PLAYER_OWNER_KEY } from '@Decorators/player-owner.decorator';

@Injectable()
export class PlayerOwnerGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const playerOwner = this.reflector.getAllAndOverride<boolean>(
      PLAYER_OWNER_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!playerOwner) {
      return true;
    }

    const { user, params } = context.switchToHttp().getRequest();

    if (!params?.gameSessionToken || !params?.playerToken || !user) {
      return false;
    }

    const userPlayersInCurrentGameSession = (
      await this.userService.getUser(user.id, [
        'players',
        'players.game_session',
      ])
    ).players;

    return userPlayersInCurrentGameSession
      .filter((player) => player.game_session.token === params.gameSessionToken)
      .some((player) => player.token === params.playerToken);
  }
}
