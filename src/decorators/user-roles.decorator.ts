import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@Enums/user/user-role.enum';

export const ROLES_KEY = 'userRoles';
export const UserRoles = (...roles: UserRole[]) =>
  SetMetadata(ROLES_KEY, roles);
