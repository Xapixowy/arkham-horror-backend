import { Card } from '@Entities/card.entity';
import { DtoHelper } from '@Helpers/dto/dto.helper';
import { DTOTypeMapping } from '@Types/dto/dto-type-mapping.type';
import { CardDto } from '@Dtos/card.dto';
import { Character } from '@Entities/character.entity';
import { CharacterDto } from '@Dtos/character.dto';
import { CharacterCard } from '@Entities/character-card.entity';

export class CharacterCardDto {
  private static readonly typeMapping: DTOTypeMapping = {
    character: (character: Character) => CharacterDto.fromEntity(character),
    card: (card: Card) => CardDto.fromEntity(card),
  };

  constructor(
    public id: number,
    public quantity: number,
    public character?: CharacterDto,
    public card?: CardDto,
  ) {}

  static fromEntity(
    characterCard: CharacterCard,
    properties?: { character?: true; card?: true },
  ): CharacterCardDto {
    return DtoHelper.populateDtoWithOptionalProperties(
      new CharacterCardDto(characterCard.id, characterCard.quantity),
      characterCard,
      this.typeMapping,
      properties,
    );
  }
}
