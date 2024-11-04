import { User } from '@entities/user.entity';
import { UserRole } from '@enums/user/user-role.enum';
import { PlayerDto } from '@dtos/player.dto';
import { DTOTypeMapping } from '@custom-types/dto/dto-type-mapping.type';
import { Player } from '@entities/player.entity';
import { DtoHelper } from '@helpers/dto.helper';

export class UserDto {
  private static readonly typeMapping: DTOTypeMapping = {
    players: (players: Player[]) =>
      players.map((player) => PlayerDto.fromEntity(player)),
  };

  constructor(
    public id: number,
    public name: string,
    public email: string,
    public role: UserRole,
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
        user.created_at,
        user.updated_at,
      ),
      user,
      this.typeMapping,
      properties,
    );
  }
}
