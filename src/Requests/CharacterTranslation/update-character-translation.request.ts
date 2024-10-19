import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateCharacterTranslationRequest {
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
  starting_location: string;
}
