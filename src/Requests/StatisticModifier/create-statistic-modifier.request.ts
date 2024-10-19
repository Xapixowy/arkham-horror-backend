import { StatisticModifier } from '@Types/Card/statistic-modifier.type';
import { IsEnum, IsInt } from 'class-validator';
import { CardStatisticModifierEnum } from '@Enums/Card/card-statistic-modifier.enum';

export class CreateStatisticModifierRequest implements StatisticModifier {
  @IsEnum(CardStatisticModifierEnum)
  modifier: CardStatisticModifierEnum;

  @IsInt()
  value: number;
}
