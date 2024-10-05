import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { LanguageEnum } from '@Enums/language.enum';
import { CardTypeEnum } from '@Enums/Card/card-type.enum';
import { CardSubtypeEnum } from '@Enums/Card/card-subtype.enum';
import { Type } from 'class-transformer';
import { CreateStatisticModifierRequest } from '@Requests/StatisticModifier/create-statistic-modifier.request';

export class UpdateCardRequest {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsEnum(LanguageEnum)
  @IsOptional()
  locale: string;

  @IsEnum(CardTypeEnum)
  @IsOptional()
  type: string;

  @IsEnum(CardSubtypeEnum)
  @IsOptional()
  subtype: string;

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
