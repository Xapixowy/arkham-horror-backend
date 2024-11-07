import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { Language } from '@Enums/language';

export class CreateCardTranslationRequest {
  @IsString()
  @MaxLength(255)
  @MinLength(3)
  name: string;

  @IsString()
  description: string;

  @IsEnum(Language)
  locale: Language;
}
