import { Equipment } from '@Types/player/equipment.type';
import { Attributes } from '@Types/player/attributes.type';
import { Status } from '@Types/player/status.type';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdatePlayerStatusRequest } from '@Requests/player/update-player-status.request';
import { UpdatePlayerEquipmentRequest } from '@Requests/player/update-player-equipment.request';
import { UpdatePlayerAttributesRequest } from '@Requests/player/update-player-attributes.request';

export class UpdatePlayerRequest {
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePlayerStatusRequest)
  status?: Status;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePlayerEquipmentRequest)
  equipment?: Equipment;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePlayerAttributesRequest)
  attributes?: Attributes;
}
