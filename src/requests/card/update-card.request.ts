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

export class UpdateCardRequest {
  @IsString()
  @MaxLength(255)
  @MinLength(3)
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsEnum(CardType)
  @IsOptional()
  type: CardType;

  @IsEnum(CardSubtype)
  @IsOptional()
  subtype: CardSubtype;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateAttributeModifierRequest)
  attributeModifiers: CreateAttributeModifierRequest[];

  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(2)
  handUsage: number;
}
