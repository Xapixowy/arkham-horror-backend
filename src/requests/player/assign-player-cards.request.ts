import { IsArray, IsInt } from 'class-validator';

export class AssignPlayerCardsRequest {
  @IsArray()
  @IsInt({ each: true })
  cardIds: number[];
}
