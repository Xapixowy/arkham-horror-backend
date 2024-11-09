import { Language } from '@Enums/language';
import { CardTranslation } from '@Entities/card-translation.entity';
import { CardDto } from '@Dtos/card.dto';
import { DtoHelper } from '@Helpers/dto/dto.helper';
import { DTOTypeMapping } from '@Types/dto/dto-type-mapping.type';
import { Card } from '@Entities/card.entity';

export class CardTranslationDto {
  static readonly typeMapping: DTOTypeMapping = {
    card: (card: Card) => CardDto.fromEntity(card),
  };

  constructor(
    public id: number,
    public name: string,
    public description: string,
    public locale: Language,
    public created_at: Date,
    public updated_at: Date,
    public card?: CardDto,
  ) {}

  static fromEntity(
    cardTranslation: CardTranslation,
    properties?: {
      card?: true;
    },
  ): CardTranslationDto {
    return DtoHelper.populateDtoWithOptionalProperties(
      new CardTranslationDto(
        cardTranslation.id,
        cardTranslation.name,
        cardTranslation.description,
        cardTranslation.locale,
        cardTranslation.created_at,
        cardTranslation.updated_at,
      ),
      cardTranslation,
      this.typeMapping,
      properties,
    );
  }
}
