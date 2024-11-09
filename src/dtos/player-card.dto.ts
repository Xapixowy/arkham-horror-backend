import { Card } from '@Entities/card.entity';
import { DtoHelper } from '@Helpers/dto/dto.helper';
import { PlayerDto } from '@Dtos/player.dto';
import { DTOTypeMapping } from '@Types/dto/dto-type-mapping.type';
import { Player } from '@Entities/player.entity';
import { PlayerCard } from '@Entities/player-card.entity';
import { CardDto } from '@Dtos/card.dto';

export class PlayerCardDto {
  static readonly typeMapping: DTOTypeMapping = {
    player: (player: Player) => PlayerDto.fromEntity(player),
    card: (card: Card) => CardDto.fromEntity(card),
  };

  constructor(
    public id: number,
    public quantity: number,
    public player?: PlayerDto,
    public card?: CardDto,
  ) {}

  static fromEntity(
    playerCard: PlayerCard,
    properties?: { player?: true; card?: true },
  ): PlayerCardDto {
    return DtoHelper.populateDtoWithOptionalProperties(
      new PlayerCardDto(playerCard.id, playerCard.quantity),
      playerCard,
      this.typeMapping,
      properties,
    );
  }
}
