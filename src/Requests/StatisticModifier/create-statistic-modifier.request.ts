import { StatisticModifier } from '@Types/Card/statistic-modifier.type';
import { IsInt, IsString } from 'class-validator';

export class CreateStatisticModifierRequest implements StatisticModifier {
  @IsString()
  modifier: string;

  @IsInt()
  value: number;
}
