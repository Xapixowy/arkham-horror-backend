import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CardType } from '@Enums/card/card.type';
import { CardSubtype } from '@Enums/card/card.subtype';
import { Type } from 'class-transformer';
import { CreateAttributeModifierRequest } from '@Requests/attribute-modifier/create-attribute-modifier.request';

export class CreateCardRequest {
  @IsString()
  @MaxLength(255)
  @MinLength(3)
  name: string;

  @IsString()
  description: string;

  @IsEnum(CardType)
  type: CardType;

  @IsEnum(CardSubtype)
  @IsOptional()
  subtype: CardSubtype;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateAttributeModifierRequest)
  attribute_modifiers: CreateAttributeModifierRequest[];

  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(2)
  hand_usage: number;
}
