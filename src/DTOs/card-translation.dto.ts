import { Language } from '@Enums/language';
import { CardTranslation } from '@Entities/card-translation.entity';

export class CardTranslationDto {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public locale: Language,
  ) {}

  static fromEntity(card: CardTranslation): CardTranslationDto {
    return new CardTranslationDto(
      card.id,
      card.name,
      card.description,
      card.locale,
    );
  }
}
