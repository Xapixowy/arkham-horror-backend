import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from '@Services/user/user.service';
import { PLAYER_OWNER_KEY } from '@Decorators/player-owner.decorator';
import { UserRole } from '@Enums/user/user-role.enum';

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

    const { user, player, params } = context.switchToHttp().getRequest();

    if (user?.role === UserRole.ADMIN) {
      return true;
    }

    if (
      !params?.gameSessionToken ||
      !params?.playerToken ||
      (!user && !player)
    ) {
      return false;
    }

    if (user) {
      const userPlayersInCurrentGameSession = user.players.filter(
        (player) => player.game_session.token === params.gameSessionToken,
      );

      return userPlayersInCurrentGameSession.some(
        (player) => player.token === params.playerToken,
      );
    }

    if (player) {
      const isUserPlayerInGameSession =
        player.game_session.token === params.gameSessionToken;

      return isUserPlayerInGameSession && player.token === params.playerToken;
    }

    return false;
  }
}
