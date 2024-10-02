import { StatisticModifier } from '@Types/statistic-modifier.type';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateStatisticModifierRequest implements StatisticModifier {
  @IsString()
  @IsNotEmpty()
  modifier: string;

  @IsInt()
  @IsNotEmpty()
  value: number;
}
