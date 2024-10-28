import { IsInt, Min } from 'class-validator';

export class CreateGameSessionRequest {
  @IsInt()
  @Min(1)
  user_id: number;
}
