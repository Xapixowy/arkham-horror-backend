import { CardStatisticModifierEnum } from '@enums/card/card-statistic-modifier.enum';

export type StatisticModifier = {
  modifier: CardStatisticModifierEnum;
  value: number;
};
