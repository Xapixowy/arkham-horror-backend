import { registerAs } from '@nestjs/config';

export type RegexConfig = {
  uuid: RegExp;
  gameSessionToken: RegExp;
};

export const regexConfig = registerAs(
  'regex',
  (): RegexConfig => ({
    uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    gameSessionToken: /^[a-zA-Z0-9!@#$%^&*_\-+=]+$/,
  }),
);
