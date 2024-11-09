import { IsArray, IsInt } from 'class-validator';

export class RemovePlayerCardsRequest {
  @IsArray()
  @IsInt({ each: true })
  cardIds: number[];
}
