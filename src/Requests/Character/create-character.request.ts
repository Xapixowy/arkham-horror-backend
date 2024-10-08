import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Expansion } from '@Enums/expansion.enum';
import { Language } from '@Enums/language';
import { Type } from 'class-transformer';
import { CreateCharacterStatisticsRequest } from '@Requests/Character/create-character-statistics.request';
import { CreateCharacterSkillRequest } from '@Requests/Character/create-character-skill.request';
import { CreateCharacterEquipmentRequest } from '@Requests/Character/create-character-equipment.request';

export class CreateCharacterRequest {
  @IsEnum(Expansion)
  expansion: Expansion;

  @IsString()
  @MaxLength(255)
  @MinLength(3)
  name: string;

  @IsString()
  description: string;

  @IsString()
  @MaxLength(64)
  profession: string;

  @IsString()
  @MaxLength(64)
  starting_location: string;

  @IsInt()
  @Min(0)
  sanity: number;

  @IsInt()
  @Min(0)
  endurance: number;

  @IsInt()
  @Min(0)
  concentration: number;

  @ValidateNested()
  @Type(() => CreateCharacterStatisticsRequest)
  @IsNotEmpty()
  statistics: CreateCharacterStatisticsRequest;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCharacterSkillRequest)
  @IsNotEmpty()
  skills: CreateCharacterSkillRequest[];

  @ValidateNested()
  @Type(() => CreateCharacterEquipmentRequest)
  @IsNotEmpty()
  equipment: CreateCharacterEquipmentRequest;

  @IsEnum(Language)
  locale: Language;
}
