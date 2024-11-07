import { UserRole } from '@Enums/user/user-role.enum';

export type JwtUser = {
  sub: number;
  email: string;
  username: string;
  role: UserRole;
};
