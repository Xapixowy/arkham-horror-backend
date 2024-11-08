import { Statistics } from '@Types/player/statistics.type';
import { Equipment } from '@Types/player/equipment.type';
import { PlayerRole } from '@Enums/player/player-role.enum';
import { Status } from '@Types/player/status.type';
import { UserDto } from '@Dtos/user.dto';
import { CharacterDto } from '@Dtos/character.dto';
import { CardDto } from '@Dtos/card.dto';
import { Player } from '@Entities/player.entity';
import { GameSessionDto } from '@Dtos/game-session.dto';
import { DTOTypeMapping } from '@Types/dto/dto-type-mapping.type';
import { User } from '@Entities/user.entity';
import { Character } from '@Entities/character.entity';
import { Card } from '@Entities/card.entity';
import { GameSession } from '@Entities/game-session.entity';
import { DtoHelper } from '@Helpers/dto/dto.helper';

export class PlayerDto {
  private static readonly typeMapping: DTOTypeMapping = {
    user: (user: User) => UserDto.fromEntity(user),
    character: (character: Character) => CharacterDto.fromEntity(character),
    cards: (cards: Card[]) => cards.map((card) => CardDto.fromEntity(card)),
    game_session: (gameSession: GameSession) =>
      GameSessionDto.fromEntity(gameSession),
  };

  constructor(
    public id: number,
    public token: string,
    public role: PlayerRole,
    public status: Status,
    public equipment: Equipment,
    public statistics: Statistics,
    public created_at: Date,
    public updated_at: Date,
    public user?: UserDto,
    public character?: CharacterDto,
    public cards?: CardDto[],
    public game_session?: GameSessionDto,
  ) {}

  static fromEntity(
    player: Player,
    properties?: {
      user?: true;
      character?: true;
      cards?: true;
      game_session?: true;
    },
  ): PlayerDto {
    return DtoHelper.populateDtoWithOptionalProperties(
      new PlayerDto(
        player.id,
        player.token,
        player.role,
        player.status,
        player.equipment,
        player.statistics,
        player.created_at,
        player.updated_at,
      ),
      player,
      this.typeMapping,
      properties,
    );
  }
}
