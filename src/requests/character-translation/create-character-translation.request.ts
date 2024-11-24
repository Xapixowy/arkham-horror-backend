import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Language } from '@Enums/language';
import { Type } from 'class-transformer';
import { CreateCharacterSkillRequest } from '@Requests/character/create-character-skill.request';

export class CreateCharacterTranslationRequest {
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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCharacterSkillRequest)
  @IsNotEmpty()
  skills: CreateCharacterSkillRequest[];

  @IsEnum(Language)
  locale: Language;
}
