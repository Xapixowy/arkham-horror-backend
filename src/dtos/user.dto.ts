import { User } from '@Entities/user.entity';
import { UserRole } from '@Enums/user/user-role.enum';
import { PlayerDto } from '@Dtos/player.dto';
import { DTOTypeMapping } from '@Types/dto/dto-type-mapping.type';
import { Player } from '@Entities/player.entity';
import { DtoHelper } from '@Helpers/dto/dto.helper';

export class UserDto {
  static readonly typeMapping: DTOTypeMapping = {
    players: (players: Player[]) =>
      players.map((player) => PlayerDto.fromEntity(player)),
  };

  constructor(
    public id: number,
    public name: string,
    public email: string,
    public role: UserRole,
    public verified_at: Date | null,
    public created_at: Date,
    public updated_at: Date,
    public access_token?: string,
    public players?: PlayerDto[],
  ) {}

  static fromEntity(user: User, properties?: { players?: true }): UserDto {
    return DtoHelper.populateDtoWithOptionalProperties(
      new UserDto(
        user.id,
        user.name,
        user.email,
        user.role,
        user.verified_at,
        user.created_at,
        user.updated_at,
      ),
      user,
      this.typeMapping,
      properties,
    );
  }
}
