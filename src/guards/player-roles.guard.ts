import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@Decorators/player-roles.decorator';
import { PlayerRole } from '@Enums/player/player-role.enum';
import { UserService } from '@Services/user/user.service';
import { UserRole } from '@Enums/user/user-role.enum';

@Injectable()
export class PlayerRolesGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<PlayerRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user, params } = context.switchToHttp().getRequest();

    if (!params?.gameSessionToken) {
      return false;
    }

    if (!user) {
      return false;
    }

    if (user.role === UserRole.ADMIN) {
      return true;
    }

    const userPlayersInCurrentGameSession = (
      await this.userService.getUser(user.id, [
        'players',
        'players.game_session',
      ])
    ).players.filter(
      (player) => player.game_session.token === params.gameSessionToken,
    );

    const userPlayersRolesInCurrentGameSession =
      userPlayersInCurrentGameSession.map((player) => player.role);

    if (userPlayersRolesInCurrentGameSession.includes(PlayerRole.HOST)) {
      return true;
    }

    return requiredRoles.some((role) =>
      userPlayersRolesInCurrentGameSession.includes(role),
    );
  }
}
