import { AttributeModifier } from '@Types/card/attribute-modifier.type';
import { IsEnum, IsInt } from 'class-validator';
import { CardAttribute } from '@Enums/card/card-attribute.enum';

export class CreateAttributeModifierRequest implements AttributeModifier {
  @IsEnum(CardAttribute)
  modifier: CardAttribute;

  @IsInt()
  value: number;
}
