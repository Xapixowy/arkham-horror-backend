import { User } from '@Entities/user.entity';
import { UserRole } from '@Enums/User/user-role.enum';

export class UserDto {
  constructor(
    public id: number,
    public name: string,
    public email: string,
    public role: UserRole,
    public created_at: Date,
    public access_token?: string,
  ) {}

  static fromEntity(user: User): UserDto {
    return new UserDto(
      user.id,
      user.name,
      user.email,
      user.role,
      user.created_at,
    );
  }
}
