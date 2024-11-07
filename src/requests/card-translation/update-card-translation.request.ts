import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateCardTranslationRequest {
  @IsString()
  @MaxLength(255)
  @MinLength(3)
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
