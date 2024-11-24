import {
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCharacterSkillRequest } from '@Requests/character/create-character-skill.request';

export class UpdateCharacterTranslationRequest {
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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCharacterSkillRequest)
  @IsOptional()
  skills?: CreateCharacterSkillRequest[];
}
