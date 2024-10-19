import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { Language } from '@Enums/language';

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

  @IsEnum(Language)
  locale: Language;
}
