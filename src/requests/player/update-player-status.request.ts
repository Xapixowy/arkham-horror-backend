import { IsNumber, IsOptional } from 'class-validator';
import { Status } from '@Types/player/status.type';

export class UpdatePlayerStatusRequest implements Partial<Status> {
  @IsOptional()
  @IsNumber()
  endurance?: number;

  @IsOptional()
  @IsNumber()
  sanity?: number;
}
