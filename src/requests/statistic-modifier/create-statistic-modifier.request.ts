import { StatisticModifier } from '@custom-types/card/statistic-modifier.type';
import { IsEnum, IsInt } from 'class-validator';
import { CardStatisticModifierEnum } from '@enums/card/card-statistic-modifier.enum';

export class CreateStatisticModifierRequest implements StatisticModifier {
  @IsEnum(CardStatisticModifierEnum)
  modifier: CardStatisticModifierEnum;

  @IsInt()
  value: number;
}
