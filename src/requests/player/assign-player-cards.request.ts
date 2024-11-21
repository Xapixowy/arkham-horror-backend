import { IsArray, IsInt } from 'class-validator';

export class AssignPlayerCardsRequest {
  @IsArray()
  @IsInt({ each: true })
  card_ids: number[];
}
