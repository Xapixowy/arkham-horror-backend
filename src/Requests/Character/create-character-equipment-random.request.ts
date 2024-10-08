import { IsInt, Min } from 'class-validator';

export class CreateCharacterEquipmentRandomRequest {
  @IsInt()
  @Min(0)
  common_items: number;

  @IsInt()
  @Min(0)
  unique_items: number;

  @IsInt()
  @Min(0)
  spells: number;

  @IsInt()
  @Min(0)
  abilities: number;

  @IsInt()
  @Min(0)
  allies: number;
}
