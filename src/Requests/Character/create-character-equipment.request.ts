import {
  IsArray,
  IsInt,
  IsNotEmpty,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateCharacterEquipmentRandomRequest } from '@Requests/Character/create-character-equipment-random.request';
import { Type } from 'class-transformer';

export class CreateCharacterEquipmentRequest {
  @IsInt()
  @Min(0)
  money: number;

  @IsInt()
  @Min(0)
  clues: number;

  @ValidateNested()
  @Type(() => CreateCharacterEquipmentRandomRequest)
  @IsNotEmpty()
  random: CreateCharacterEquipmentRandomRequest;

  @IsArray()
  @IsInt({ each: true })
  static: number[];
}
