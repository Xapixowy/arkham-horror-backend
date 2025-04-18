import { User } from '@Entities/user.entity';
import { GameSession } from '@Entities/game-session.entity';
import { Character } from '@Entities/character.entity';
import { Status } from '@Types/player/status.type';
import { Equipment } from '@Types/player/equipment.type';
import { Attributes } from '@Types/player/attributes.type';
import { PlayerRole } from '@Enums/player/player-role.enum';

export type PlayerObject = {
  token: string;
  user: User | null;
  game_session: GameSession;
  character: Character;
  status: Status;
  equipment: Equipment;
  attributes: Attributes;
  role: PlayerRole;
};
