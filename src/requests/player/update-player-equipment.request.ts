import { IsNumber, IsOptional } from 'class-validator';
import { Equipment } from '@Types/player/equipment.type';

export class UpdatePlayerEquipmentRequest implements Partial<Equipment> {
  @IsOptional()
  @IsNumber()
  money?: number;

  @IsOptional()
  @IsNumber()
  clues?: number;
}
