import { Language } from '@enums/language';
import { CardTranslation } from '@entities/card-translation.entity';
import { CardDto } from '@dtos/card.dto';
import { DtoHelper } from '@helpers/dto.helper';
import { DTOTypeMapping } from '@custom-types/dto/dto-type-mapping.type';
import { Card } from '@entities/card.entity';

export class CardTranslationDto {
  private static readonly typeMapping: DTOTypeMapping = {
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
