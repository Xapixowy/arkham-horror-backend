import { Card } from '@Entities/card.entity';
import { StatisticModifier } from '@Types/Card/statistic-modifier.type';
import { Language } from '@Enums/language';
import { CardTypeEnum } from '@Enums/Card/card-type.enum';
import { CardSubtypeEnum } from '@Enums/Card/card-subtype.enum';

export class CardDto {
  constructor(
    public id: number,
    public name: string,
    public description: string,
    public type: CardTypeEnum,
    public subtype: CardSubtypeEnum,
    public statisticModifiers: StatisticModifier[],
    public handUsage: number,
    public front_image_path: string,
    public back_image_path: string,
    public locale: Language,
  ) {}

  static fromEntity(card: Card): CardDto {
    return new CardDto(
      card.id,
      card.name,
      card.description,
      card.type,
      card.subtype,
      card.statistic_modifiers,
      card.hand_usage,
      card.front_image_path,
      card.back_image_path,
      card.locale,
    );
  }
}
