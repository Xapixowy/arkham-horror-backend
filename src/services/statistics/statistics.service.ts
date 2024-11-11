import { Injectable } from '@nestjs/common';
import { Player } from '@Entities/player.entity';
import { UpdatePlayerRequest } from '@Requests/player/update-player.request';
import { PlayerStatistics } from '@Types/player/statistics.type';

@Injectable()
export class StatisticsService {
  constructor() {}

  static generateUpdatedPlayerStatistics(
    player: Player,
    updatePlayerRequest: UpdatePlayerRequest,
  ): PlayerStatistics {
    const newStatistics = { ...player.statistics } as PlayerStatistics;

    StatisticsService.updateStatistic(
      player.status.sanity,
      updatePlayerRequest.status?.sanity,
      'sanity_acquired',
      'sanity_lost',
      newStatistics,
    );
    StatisticsService.updateStatistic(
      player.status.endurance,
      updatePlayerRequest.status?.endurance,
      'endurance_acquired',
      'endurance_lost',
      newStatistics,
    );

    StatisticsService.updateStatistic(
      player.equipment.money,
      updatePlayerRequest.equipment?.money,
      'money_acquired',
      'money_lost',
      newStatistics,
    );
    StatisticsService.updateStatistic(
      player.equipment.clues,
      updatePlayerRequest.equipment?.clues,
      'clues_acquired',
      'clues_lost',
      newStatistics,
    );

    return newStatistics;
  }

  private static updateStatistic(
    currentValue: number,
    newValue: number | undefined,
    acquiredKey: keyof PlayerStatistics,
    lostKey: keyof PlayerStatistics,
    statistics: PlayerStatistics,
  ): void {
    if (newValue !== undefined) {
      const difference = newValue - currentValue;
      if (difference > 0) {
        statistics[acquiredKey] += difference;
      } else {
        statistics[lostKey] += Math.abs(difference);
      }
    }
  }
}
