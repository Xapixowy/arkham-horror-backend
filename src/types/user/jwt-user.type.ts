import { UserRole } from '@enums/user/user-role.enum';

export type JwtUser = {
  sub: number;
  email: string;
  username: string;
  role: UserRole;
};
