import { Card } from '@Entities/card.entity';
import { AttributeModifier } from '@Types/card/attribute-modifier.type';
import { Language } from '@Enums/language';
import { CardType } from '@Enums/card/card.type';
import { CardSubtype } from '@Enums/card/card.subtype';
import { DtoHelper } from '@Helpers/dto/dto.helper';
import { CardTranslationDto } from '@Dtos/card-translation.dto';
import { DTOTypeMapping } from '@Types/dto/dto-type-mapping.type';
import { CardTranslation } from '@Entities/card-translation.entity';
import { PlayerCard } from '@Entities/player-card.entity';
import { PlayerCardDto } from '@Dtos/player-card.dto';
import { CharacterCard } from '@Entities/character-card.entity';
import { CharacterCardDto } from '@Dtos/character-card.dto';

export class CardDto {
  private static readonly typeMapping: DTOTypeMapping = {
    translations: (translations: CardTranslation[]) =>
      translations.map((translation) =>
        CardTranslationDto.fromEntity(translation),
      ),
    characterCards: (characterCards: CharacterCard[]) =>
      characterCards.map((characterCard) =>
        CharacterCardDto.fromEntity(characterCard),
      ),
    playerCards: (playerCards: PlayerCard[]) =>
      playerCards.map((playerCard) => PlayerCardDto.fromEntity(playerCard)),
  };

  constructor(
    public id: number,
    public name: string,
    public description: string,
    public type: CardType,
    public subtype: CardSubtype,
    public attribute_modifiers: AttributeModifier[],
    public hand_usage: number,
    public front_image_path: string,
    public back_image_path: string,
    public locale: Language,
    public created_at: Date,
    public update_at: Date,
    public translations?: CardTranslationDto[],
    public characterCards?: CharacterCardDto[],
    public playerCards?: PlayerCardDto[],
  ) {}

  static fromEntity(
    card: Card,
    properties?: {
      translations?: true;
      characterCards?: true;
      playerCards?: true;
    },
  ): CardDto {
    return DtoHelper.populateDtoWithOptionalProperties(
      new CardDto(
        card.id,
        card.name,
        card.description,
        card.type,
        card.subtype,
        card.attribute_modifiers,
        card.hand_usage,
        card.front_image_path,
        card.back_image_path,
        card.locale,
        card.created_at,
        card.updated_at,
      ),
      card,
      this.typeMapping,
      properties,
    );
  }
}
