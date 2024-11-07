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
import { CreateStatisticModifierRequest } from '@Requests/statistic-modifier/create-statistic-modifier.request';

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
  @Type(() => CreateStatisticModifierRequest)
  statisticModifiers: CreateStatisticModifierRequest[];

  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(2)
  handUsage: number;
}
