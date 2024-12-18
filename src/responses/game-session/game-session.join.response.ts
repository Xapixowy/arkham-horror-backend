import { GameSessionDto } from '@Dtos/game-session.dto';
import { PlayerDto } from '@Dtos/player.dto';

export type GameSessionJoinResponse = {
  game_session: GameSessionDto;
  player: PlayerDto;
};
