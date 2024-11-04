import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCharacterSkillRequest {
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  name: string;

  @IsString()
  description: string;
}
