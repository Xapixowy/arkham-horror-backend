import { registerAs } from '@nestjs/config';

export type BcryptConfig = {
  saltRounds: number;
};

export const bcryptConfig = registerAs(
  'bcrypt',
  (): BcryptConfig => ({
    saltRounds: 10,
  }),
);
