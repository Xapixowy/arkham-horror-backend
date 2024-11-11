import { Injectable } from '@nestjs/common';
import { Player } from '@Entities/player.entity';
import { UpdatePlayerRequest } from '@Requests/player/update-player.request';
import { Statistics as PlayerStatistics } from '@Types/player/statistics.type';
import { Statistics as UserStatistics } from '@Types/user/statistics.type';
import { PlayerRole } from '@Enums/player/player-role.enum';

@Injectable()
export class StatisticsService {
  constructor() {}

  static generateUserStatistics(players: Player[]): UserStatistics {
    const initialStatistics: UserStatistics = {
      money_acquired: 0,
      money_lost: 0,
      clues_acquired: 0,
      clues_lost: 0,
      endurance_acquired: 0,
      endurance_lost: 0,
      sanity_acquired: 0,
      sanity_lost: 0,
      cards_acquired: 0,
      cards_lost: 0,
      phases_played: 0,
      characters_played: 0,
      game_session_played: 0,
      game_session_created: 0,
    };

    return players.reduce(
      (acc, player) => ({
        money_acquired: acc.money_acquired + player.statistics.money_acquired,
        money_lost: acc.money_lost + player.statistics.money_lost,
        clues_acquired: acc.clues_acquired + player.statistics.clues_acquired,
        clues_lost: acc.clues_lost + player.statistics.clues_lost,
        endurance_acquired:
          acc.endurance_acquired + player.statistics.endurance_acquired,
        endurance_lost: acc.endurance_lost + player.statistics.endurance_lost,
        sanity_acquired:
          acc.sanity_acquired + player.statistics.sanity_acquired,
        sanity_lost: acc.sanity_lost + player.statistics.sanity_lost,
        cards_acquired: acc.cards_acquired + player.statistics.cards_acquired,
        cards_lost: acc.cards_lost + player.statistics.cards_lost,
        phases_played: acc.phases_played + player.statistics.phases_played,
        characters_played:
          acc.characters_played + player.statistics.characters_played,
        game_session_played: acc.game_session_played + 1,
        game_session_created:
          acc.game_session_created + (player.role === PlayerRole.HOST ? 1 : 0),
      }),
      initialStatistics,
    );
  }

  static generateUpdatedPlayerStatistics(
    player: Player,
    updatePlayerRequest: UpdatePlayerRequest,
  ): PlayerStatistics {
    const newStatistics = { ...player.statistics } as PlayerStatistics;

    StatisticsService.updatePlayerStatistic(
      player.status.sanity,
      updatePlayerRequest.status?.sanity,
      'sanity_acquired',
      'sanity_lost',
      newStatistics,
    );
    StatisticsService.updatePlayerStatistic(
      player.status.endurance,
      updatePlayerRequest.status?.endurance,
      'endurance_acquired',
      'endurance_lost',
      newStatistics,
    );

    StatisticsService.updatePlayerStatistic(
      player.equipment.money,
      updatePlayerRequest.equipment?.money,
      'money_acquired',
      'money_lost',
      newStatistics,
    );
    StatisticsService.updatePlayerStatistic(
      player.equipment.clues,
      updatePlayerRequest.equipment?.clues,
      'clues_acquired',
      'clues_lost',
      newStatistics,
    );

    return newStatistics;
  }

  private static updatePlayerStatistic(
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
