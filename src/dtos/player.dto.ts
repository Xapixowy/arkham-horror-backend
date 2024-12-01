import { Attributes } from '@Types/player/attributes.type';
import { Equipment } from '@Types/player/equipment.type';
import { PlayerRole } from '@Enums/player/player-role.enum';
import { Status } from '@Types/player/status.type';
import { UserDto } from '@Dtos/user.dto';
import { CharacterDto } from '@Dtos/character.dto';
import { Player } from '@Entities/player.entity';
import { GameSessionDto } from '@Dtos/game-session.dto';
import { DTOTypeMapping } from '@Types/dto/dto-type-mapping.type';
import { User } from '@Entities/user.entity';
import { Character } from '@Entities/character.entity';
import { GameSession } from '@Entities/game-session.entity';
import { DtoHelper } from '@Helpers/dto/dto.helper';
import { PlayerCard } from '@Entities/player-card.entity';
import { PlayerCardDto } from '@Dtos/player-card.dto';
import { Statistics } from '@Types/player/statistics.type';

export class PlayerDto {
  private static readonly typeMapping: DTOTypeMapping = {
    user: (user: User) => UserDto.fromEntity(user),
    character: (character: Character) => CharacterDto.fromEntity(character),
    playerCards: (playerCards: PlayerCard[]) =>
      playerCards.map((playerCard) => PlayerCardDto.fromEntity(playerCard)),
    game_session: (gameSession: GameSession) =>
      GameSessionDto.fromEntity(gameSession),
  };

  constructor(
    public id: number,
    public token: string,
    public role: PlayerRole,
    public status: Status,
    public equipment: Equipment,
    public attributes: Attributes,
    public statistics: Statistics,
    public created_at: Date,
    public updated_at: Date,
    public user?: UserDto,
    public character?: CharacterDto,
    public playerCards?: PlayerCardDto[],
    public game_session?: GameSessionDto,
  ) {}

  static fromEntity(
    player: Player,
    properties?: {
      user?: true;
      character?: true;
      playerCards?: true;
      game_session?: true;
    },
    typeMapping?: DTOTypeMapping,
  ): PlayerDto {
    return DtoHelper.populateDtoWithOptionalProperties(
      new PlayerDto(
        player.id,
        player.token,
        player.role,
        player.status,
        player.equipment,
        player.attributes,
        player.statistics,
        player.created_at,
        player.updated_at,
      ),
      player,
      typeMapping ?? this.typeMapping,
      properties,
    );
  }
}
