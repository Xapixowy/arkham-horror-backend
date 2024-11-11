import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@Decorators/player-roles.decorator';
import { PlayerRole } from '@Enums/player/player-role.enum';
import { UserRole } from '@Enums/user/user-role.enum';

@Injectable()
export class PlayerRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<PlayerRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user, player, params } = context.switchToHttp().getRequest();

    if (!user && !player) {
      return false;
    }

    if (!params?.gameSessionToken) {
      return false;
    }

    if (user?.role === UserRole.ADMIN) {
      return true;
    }

    if (user) {
      const userPlayersInGameSession = user.players.filter(
        (player) => player.game_session.token === params.gameSessionToken,
      );

      return requiredRoles.some((role) =>
        userPlayersInGameSession.some((player) => player.role === role),
      );
    }

    if (player) {
      const isPlayerInGameSession =
        player.game_session.token === params.gameSessionToken;

      if (isPlayerInGameSession && player.role === PlayerRole.HOST) {
        return true;
      }

      const hasPlayerRequestedRole = requiredRoles.some(
        (role) => player.role === role,
      );

      return isPlayerInGameSession && hasPlayerRequestedRole;
    }

    return false;
  }
}
