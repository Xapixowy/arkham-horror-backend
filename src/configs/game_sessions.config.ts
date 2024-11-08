import { registerAs } from '@nestjs/config';

export type GameSessionsConfig = {
  gameSessionTokenLength: number;
  maxPlayers: number;
  activeGameSessionDurationInHours: number;
};

export const gameSessionsConfig = registerAs(
  'gameSessions',
  (): GameSessionsConfig => ({
    gameSessionTokenLength: 6,
    maxPlayers: 6,
    activeGameSessionDurationInHours: 24,
  }),
);
