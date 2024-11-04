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
import { CardType } from '@enums/card/card.type';
import { CardSubtype } from '@enums/card/card.subtype';
import { Type } from 'class-transformer';
import { CreateStatisticModifierRequest } from '@requests/statistic-modifier/create-statistic-modifier.request';

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
