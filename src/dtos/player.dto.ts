import { Statistics } from '@custom-types/player/statistics.type';
import { Equipment } from '@custom-types/player/equipment.type';
import { PlayerRole } from '@enums/player/player-role.enum';
import { Status } from '@custom-types/player/status.type';
import { UserDto } from '@dtos/user.dto';
import { CharacterDto } from '@dtos/character.dto';
import { CardDto } from '@dtos/card.dto';
import { Player } from '@entities/player.entity';
import { GameSessionDto } from '@dtos/game-session.dto';
import { DTOTypeMapping } from '@custom-types/dto/dto-type-mapping.type';
import { User } from '@entities/user.entity';
import { Character } from '@entities/character.entity';
import { Card } from '@entities/card.entity';
import { GameSession } from '@entities/game-session.entity';
import { DtoHelper } from '@helpers/dto.helper';

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
