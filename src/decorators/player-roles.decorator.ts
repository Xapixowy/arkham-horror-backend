import { SetMetadata } from '@nestjs/common';
import { PlayerRole } from '@Enums/player/player-role.enum';

export const ROLES_KEY = 'player-roles';
export const PlayerRoles = (...roles: PlayerRole[]) =>
  SetMetadata(ROLES_KEY, roles);
