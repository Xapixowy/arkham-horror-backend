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
import { Expansion } from '@Enums/expansion.enum';
import { Type } from 'class-transformer';
import { CreateCharacterAttributesRequest } from '@Requests/character/create-character-attributes.request';
import { CreateCharacterSkillRequest } from '@Requests/character/create-character-skill.request';
import { CreateCharacterEquipmentRequest } from '@Requests/character/create-character-equipment.request';

export class UpdateCharacterRequest {
  @IsEnum(Expansion)
  @IsOptional()
  expansion?: Expansion;

  @IsString()
  @MaxLength(255)
  @MinLength(3)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @MaxLength(64)
  @IsOptional()
  profession?: string;

  @IsString()
  @MaxLength(64)
  @IsOptional()
  starting_location?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sanity?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  endurance?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  concentration?: number;

  @ValidateNested()
  @Type(() => CreateCharacterAttributesRequest)
  @IsOptional()
  attributes?: CreateCharacterAttributesRequest;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCharacterSkillRequest)
  @IsOptional()
  skills?: CreateCharacterSkillRequest[];

  @ValidateNested()
  @Type(() => CreateCharacterEquipmentRequest)
  @IsOptional()
  equipment?: CreateCharacterEquipmentRequest;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  card_ids: number[];
}
