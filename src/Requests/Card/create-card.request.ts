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
import { CardType } from '@Enums/Card/card.type';
import { CardSubtype } from '@Enums/Card/card.subtype';
import { Type } from 'class-transformer';
import { CreateStatisticModifierRequest } from '@Requests/StatisticModifier/create-statistic-modifier.request';

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
  @Type(() => CreateStatisticModifierRequest)
  statisticModifiers: CreateStatisticModifierRequest[];

  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(2)
  handUsage: number;
}
