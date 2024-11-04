import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Expansion } from '@enums/expansion.enum';
import { Type } from 'class-transformer';
import { CreateCharacterStatisticsRequest } from '@requests/character/create-character-statistics.request';
import { CreateCharacterSkillRequest } from '@requests/character/create-character-skill.request';
import { CreateCharacterEquipmentRequest } from '@requests/character/create-character-equipment.request';

export class UpdateCharacterRequest {
  @IsEnum(Expansion)
  @IsOptional()
  expansion: Expansion;

  @IsString()
  @MaxLength(255)
  @MinLength(3)
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsString()
  @MaxLength(64)
  @IsOptional()
  profession: string;

  @IsString()
  @MaxLength(64)
  @IsOptional()
  startingLocation: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sanity: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  endurance: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  concentration: number;

  @ValidateNested()
  @Type(() => CreateCharacterStatisticsRequest)
  @IsOptional()
  statistics: CreateCharacterStatisticsRequest;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCharacterSkillRequest)
  @IsOptional()
  skills: CreateCharacterSkillRequest[];

  @ValidateNested()
  @Type(() => CreateCharacterEquipmentRequest)
  @IsOptional()
  equipment: CreateCharacterEquipmentRequest;
}
