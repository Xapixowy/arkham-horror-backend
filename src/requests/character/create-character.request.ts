import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
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
  @Type(() => CreateCharacterAttributesRequest)
  @IsNotEmpty()
  attributes: CreateCharacterAttributesRequest;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCharacterSkillRequest)
  @IsNotEmpty()
  skills: CreateCharacterSkillRequest[];

  @ValidateNested()
  @Type(() => CreateCharacterEquipmentRequest)
  @IsNotEmpty()
  equipment: CreateCharacterEquipmentRequest;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  card_ids: number[];
}
