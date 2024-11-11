import { registerAs } from '@nestjs/config';
import { GameSessionPhase } from '@Enums/game-session/game-session-phase.enum';

export type GameSessionsConfig = {
  gameSessionTokenLength: number;
  maxPlayers: number;
  activeGameSessionDurationInHours: number;
  defaultPhase: GameSessionPhase;
};

export const gameSessionsConfig = registerAs(
  'gameSessions',
  (): GameSessionsConfig => ({
    gameSessionTokenLength: 6,
    maxPlayers: 6,
    activeGameSessionDurationInHours: 24,
    defaultPhase: GameSessionPhase.MYTHOS,
  }),
);
