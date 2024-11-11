import { AttributeModifier } from '@Types/card/attribute-modifier.type';
import { IsEnum, IsInt } from 'class-validator';
import { CardAttributeModifierEnum } from '@Enums/card/card-attribute-modifier.enum';

export class CreateAttributeModifierRequest implements AttributeModifier {
  @IsEnum(CardAttributeModifierEnum)
  modifier: CardAttributeModifierEnum;

  @IsInt()
  value: number;
}
