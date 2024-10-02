import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
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

export class CreateCardRequest {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsEnum(LanguageEnum)
  @IsNotEmpty()
  locale: string;

  @IsEnum(CardTypeEnum)
  @IsNotEmpty()
  type: string;

  @IsEnum(CardSubtypeEnum)
  @IsNotEmpty()
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
